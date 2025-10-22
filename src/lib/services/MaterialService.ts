/**
 * MaterialService - Handles CRUD operations for materials and storage
 */

import { createClient } from '../supabase/server'
import { createServiceRoleClient } from '../supabase/server'
import type {
  Material,
  MaterialKind,
  MaterialStatus,
  MaterialMetadata,
  MaterialRow,
} from '../types/materials'
import type { TablesInsert, TablesUpdate } from '../types/database'
import {
  MaterialErrorCode,
  UploadError,
  ProcessingError,
} from '../utils/errors'
import { generateStoragePath } from '../utils/files'

export class MaterialService {
  /**
   * Creates a new material record in the database
   */
  static async createMaterial(
    userId: string,
    data: {
      kind: MaterialKind
      sourceUrl?: string
      storagePath?: string
      pageCount?: number
      metaJson?: MaterialMetadata
    }
  ): Promise<Material> {
    const supabase = await createClient()

    const insertData: TablesInsert<'materials'> = {
      user_id: userId,
      kind: data.kind,
      source_url: data.sourceUrl,
      storage_path: data.storagePath,
      page_count: data.pageCount,
      status: 'uploading',
      meta_json: (data.metaJson || {}) as any,
    }

    const { data: material, error } = await supabase
      .from('materials')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new ProcessingError(
        MaterialErrorCode.DATABASE_ERROR,
        `Failed to create material: ${error.message}`
      )
    }

    return this.mapRowToMaterial(material)
  }

  /**
   * Gets a material by ID with ownership verification
   */
  static async getMaterial(
    materialId: string,
    userId?: string
  ): Promise<Material> {
    const supabase = await createClient()

    const query = supabase
      .from('materials')
      .select('*')
      .eq('id', materialId)

    // If userId provided, add to query
    const finalQuery = userId ? query.eq('user_id', userId) : query

    const { data: material, error } = await finalQuery.single()

    if (error || !material) {
      if (error?.code === 'PGRST116') {
        throw new ProcessingError(
          MaterialErrorCode.MATERIAL_NOT_FOUND,
          'Material not found'
        )
      }
      throw new ProcessingError(
        MaterialErrorCode.DATABASE_ERROR,
        `Failed to fetch material: ${error?.message}`
      )
    }

    return this.mapRowToMaterial(material)
  }

  /**
   * Gets a material by ID using service role (bypasses RLS)
   * Use this for background jobs like Inngest workers
   */
  static async getMaterialServiceRole(materialId: string): Promise<Material> {
    const supabase = createServiceRoleClient()

    const { data: material, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', materialId)
      .single()

    if (error || !material) {
      if (error?.code === 'PGRST116') {
        throw new ProcessingError(
          MaterialErrorCode.MATERIAL_NOT_FOUND,
          'Material not found'
        )
      }
      throw new ProcessingError(
        MaterialErrorCode.DATABASE_ERROR,
        `Failed to fetch material: ${error?.message}`
      )
    }

    return this.mapRowToMaterial(material)
  }

  /**
   * Updates material status and metadata
   */
  static async updateMaterialStatus(
    materialId: string,
    status: MaterialStatus,
    metaUpdates?: Partial<MaterialMetadata>
  ): Promise<void> {
    // Use service role for background jobs
    const supabase = createServiceRoleClient()

    // Get current material to merge metadata
    const { data: current } = await supabase
      .from('materials')
      .select('meta_json')
      .eq('id', materialId)
      .single()

    const currentMeta = (current?.meta_json as MaterialMetadata) || {}
    const updatedMeta = { ...currentMeta, ...metaUpdates }

    const updateData: TablesUpdate<'materials'> = {
      status,
      meta_json: updatedMeta as any,
    }

    const { error } = await supabase
      .from('materials')
      .update(updateData)
      .eq('id', materialId)

    if (error) {
      throw new ProcessingError(
        MaterialErrorCode.DATABASE_ERROR,
        `Failed to update material status: ${error.message}`,
        materialId
      )
    }
  }

  /**
   * Deletes a material and its storage file
   */
  static async deleteMaterial(
    materialId: string,
    userId: string
  ): Promise<void> {
    const supabase = await createClient()

    // Get material to verify ownership and get storage path
    const material = await this.getMaterial(materialId, userId)

    // Delete storage file if it exists
    if (material.storagePath) {
      await this.deleteFromStorage(material.storagePath)
    }

    // Delete material record (cascades to chunks via foreign key)
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', materialId)
      .eq('user_id', userId)

    if (error) {
      throw new ProcessingError(
        MaterialErrorCode.DATABASE_ERROR,
        `Failed to delete material: ${error.message}`,
        materialId
      )
    }
  }

  /**
   * Uploads a file to Supabase Storage
   * Uses service role client to bypass RLS since we've already authenticated in the route
   */
  static async uploadToStorage(
    file: File,
    authUserId: string,
    materialId: string
  ): Promise<string> {
    // Use service role client to bypass RLS (we've already authenticated the user in the route)
    const supabase = createServiceRoleClient()

    // Generate storage path using auth user ID
    const storagePath = generateStoragePath(authUserId, materialId, file.name)

    console.log('Uploading to storage path:', storagePath)
    console.log('Auth user ID:', authUserId)

    // Upload file
    const { data, error } = await supabase.storage
      .from('materials')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error details:', {
        message: error.message,
        name: error.name,
        cause: error.cause,
        storagePath,
        authUserId
      })
      throw new UploadError(
        MaterialErrorCode.UPLOAD_FAILED,
        `Failed to upload file: ${error.message}`
      )
    }

    console.log('Upload successful:', data)
    return storagePath
  }

  /**
   * Deletes a file from Supabase Storage
   */
  static async deleteFromStorage(storagePath: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.storage
      .from('materials')
      .remove([storagePath])

    if (error) {
      // Log error but don't throw - file might already be deleted
      console.error('Failed to delete storage file:', error)
    }
  }

  /**
   * Downloads a file from Supabase Storage
   * Uses service role client for background jobs
   */
  static async downloadFromStorage(storagePath: string): Promise<Blob> {
    const supabase = createServiceRoleClient()

    console.log('Downloading from storage:', storagePath)

    const { data, error } = await supabase.storage
      .from('materials')
      .download(storagePath)

    if (error || !data) {
      console.error('Download error:', error)
      throw new ProcessingError(
        MaterialErrorCode.STORAGE_ERROR,
        `Failed to download file: ${error?.message}`
      )
    }

    console.log('Download successful, blob size:', data.size)
    return data
  }

  /**
   * Gets the public URL for a storage file (for private buckets, returns signed URL)
   */
  static async getStorageUrl(
    storagePath: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
      .from('materials')
      .createSignedUrl(storagePath, expiresIn)

    if (error || !data) {
      throw new ProcessingError(
        MaterialErrorCode.STORAGE_ERROR,
        `Failed to get storage URL: ${error?.message}`
      )
    }

    return data.signedUrl
  }

  /**
   * Gets the count of materials created by a user in a specific month
   */
  static async getUserMaterialCount(
    userId: string,
    year: number,
    month: number
  ): Promise<number> {
    const supabase = await createClient()

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1).toISOString()
    const endDate = new Date(year, month, 1).toISOString()

    const { count, error } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lt('created_at', endDate)

    if (error) {
      throw new ProcessingError(
        MaterialErrorCode.DATABASE_ERROR,
        `Failed to get material count: ${error.message}`
      )
    }

    return count || 0
  }

  /**
   * Gets the count of materials created by a user in the current month
   */
  static async getCurrentMonthMaterialCount(userId: string): Promise<number> {
    const now = new Date()
    return this.getUserMaterialCount(userId, now.getFullYear(), now.getMonth() + 1)
  }

  /**
   * Lists materials for a user with optional filtering
   */
  static async listMaterials(
    userId: string,
    options?: {
      status?: MaterialStatus
      kind?: MaterialKind
      limit?: number
      offset?: number
    }
  ): Promise<Material[]> {
    const supabase = await createClient()

    let query = supabase
      .from('materials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.kind) {
      query = query.eq('kind', options.kind)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data: materials, error } = await query

    if (error) {
      throw new ProcessingError(
        MaterialErrorCode.DATABASE_ERROR,
        `Failed to list materials: ${error.message}`
      )
    }

    return materials?.map(this.mapRowToMaterial) || []
  }

  /**
   * Maps a database row to a Material interface
   */
  private static mapRowToMaterial(row: MaterialRow): Material {
    return {
      id: row.id,
      userId: row.user_id,
      kind: row.kind as MaterialKind,
      sourceUrl: row.source_url || undefined,
      storagePath: row.storage_path || undefined,
      pageCount: row.page_count || undefined,
      status: row.status as MaterialStatus,
      metaJson: (row.meta_json as MaterialMetadata) || {},
      createdAt: row.created_at,
    }
  }
}
