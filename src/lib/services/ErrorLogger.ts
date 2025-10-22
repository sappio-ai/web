/**
 * Error logging and monitoring service
 * Logs errors to Supabase events table with context
 */

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { MaterialErrorCode } from '@/lib/utils/errors'

export interface ErrorContext {
  userId?: string
  materialId?: string
  studyPackId?: string
  errorType: string
  errorCode?: MaterialErrorCode | string
  errorMessage: string
  stackTrace?: string
  metadata?: Record<string, any>
}

export class ErrorLogger {
  /**
   * Log an error to the database
   */
  static async logError(context: ErrorContext): Promise<void> {
    try {
      // Try to get user session first, fallback to service role
      let supabase = await createClient()
      let userId = context.userId

      // Get user if not provided
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        userId = user?.id
      }

      // If no user session, use service role client (for background jobs)
      if (!userId) {
        supabase = createServiceRoleClient()
      }

      console.log('[ErrorLogger] Logging error:', {
        type: context.errorType,
        code: context.errorCode,
        userId: userId || 'anonymous',
      })

      // Create error event
      const { data, error } = await supabase.from('events').insert({
        user_id: userId || null,
        event: 'error_occurred',
        props_json: {
          errorType: context.errorType,
          errorCode: context.errorCode,
          errorMessage: context.errorMessage,
          materialId: context.materialId,
          studyPackId: context.studyPackId,
          stackTrace: context.stackTrace,
          ...context.metadata,
          timestamp: new Date().toISOString(),
        },
      })

      if (error) {
        console.error('[ErrorLogger] Failed to insert error event:', error)
      } else {
        console.log('[ErrorLogger] Error event logged successfully')
      }

      // Also log to console for development
      console.error('[ErrorLogger] Error details:', {
        type: context.errorType,
        code: context.errorCode,
        message: context.errorMessage,
        userId,
        materialId: context.materialId,
        studyPackId: context.studyPackId,
      })
    } catch (error) {
      // Fallback to console if logging fails
      console.error('[ErrorLogger] Exception while logging error:', error)
      console.error('[ErrorLogger] Original error context:', context)
    }
  }

  /**
   * Log upload error
   */
  static async logUploadError(
    errorCode: MaterialErrorCode,
    errorMessage: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logError({
      userId,
      errorType: 'upload_error',
      errorCode,
      errorMessage,
      metadata,
    })
  }

  /**
   * Log processing error
   */
  static async logProcessingError(
    errorCode: MaterialErrorCode,
    errorMessage: string,
    materialId: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logError({
      userId,
      materialId,
      errorType: 'processing_error',
      errorCode,
      errorMessage,
      metadata,
    })
  }

  /**
   * Log generation error
   */
  static async logGenerationError(
    errorCode: MaterialErrorCode,
    errorMessage: string,
    studyPackId?: string,
    materialId?: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logError({
      userId,
      materialId,
      studyPackId,
      errorType: 'generation_error',
      errorCode,
      errorMessage,
      metadata,
    })
  }

  /**
   * Log API error
   */
  static async logApiError(
    endpoint: string,
    errorMessage: string,
    statusCode: number,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logError({
      userId,
      errorType: 'api_error',
      errorMessage,
      metadata: {
        endpoint,
        statusCode,
        ...metadata,
      },
    })
  }

  /**
   * Get error rate for monitoring
   * Returns error count in the last hour
   */
  static async getErrorRate(): Promise<number> {
    try {
      // Use service role for monitoring queries
      const supabase = createServiceRoleClient()
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

      console.log('[ErrorLogger] Getting error rate since:', oneHourAgo)

      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('event', 'error_occurred')
        .gte('created_at', oneHourAgo)

      if (error) {
        console.error('[ErrorLogger] Error getting error rate:', error)
        return 0
      }

      console.log('[ErrorLogger] Error count in last hour:', count || 0)
      return count || 0
    } catch (error) {
      console.error('[ErrorLogger] Exception getting error rate:', error)
      return 0
    }
  }

  /**
   * Check if error rate is high (>5% of total events)
   */
  static async isErrorRateHigh(): Promise<boolean> {
    try {
      // Use service role for monitoring queries
      const supabase = createServiceRoleClient()
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

      console.log('[ErrorLogger] Checking if error rate is high')

      // Get total events
      const { count: totalCount, error: totalError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneHourAgo)

      if (totalError) {
        console.error('[ErrorLogger] Error getting total count:', totalError)
        return false
      }

      // Get error events
      const { count: errorCount, error: errorError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('event', 'error_occurred')
        .gte('created_at', oneHourAgo)

      if (errorError) {
        console.error('[ErrorLogger] Error getting error count:', errorError)
        return false
      }

      if (!totalCount || totalCount === 0) {
        console.log('[ErrorLogger] No events in last hour')
        return false
      }

      const errorRate = (errorCount || 0) / totalCount
      console.log('[ErrorLogger] Error rate:', {
        errorCount: errorCount || 0,
        totalCount,
        errorRate: (errorRate * 100).toFixed(2) + '%',
        isHigh: errorRate > 0.05,
      })

      return errorRate > 0.05 // 5% threshold
    } catch (error) {
      console.error('[ErrorLogger] Exception checking error rate:', error)
      return false
    }
  }
}
