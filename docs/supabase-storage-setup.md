# Supabase Storage Setup for Study Pack Creation

This document describes the storage bucket configuration needed for the Study Pack Creation feature.

## Storage Bucket: `materials`

### Configuration

- **Bucket Name**: `materials`
- **Public Access**: `false` (private)
- **File Size Limit**: 50MB (52428800 bytes) - already configured globally
- **Allowed MIME Types**: All (will be validated in application code)

### Creating the Bucket

You can create the bucket using the Supabase Dashboard or SQL:

#### Option 1: Supabase Dashboard
1. Go to Storage in your Supabase dashboard
2. Click "New bucket"
3. Name: `materials`
4. Public: `false`
5. Click "Create bucket"

#### Option 2: SQL (via Supabase SQL Editor)
```sql
-- Create the materials bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'materials',
  'materials',
  false,
  52428800, -- 50MB
  NULL -- Allow all MIME types (validation in app)
)
ON CONFLICT (id) DO NOTHING;
```

### Row Level Security (RLS) Policies

The following RLS policies ensure users can only access their own materials:

```sql
-- Policy: Users can upload their own materials
CREATE POLICY "Users can upload their own materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'materials' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own materials
CREATE POLICY "Users can read their own materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'materials' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own materials
CREATE POLICY "Users can update their own materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'materials' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own materials
CREATE POLICY "Users can delete their own materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'materials' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Storage Path Structure

Files are stored with the following path structure:
```
materials/{userId}/{materialId}/{filename}
```

Example:
```
materials/550e8400-e29b-41d4-a716-446655440000/7c9e6679-7425-40de-944b-e07fc1f90ae7/lecture-notes.pdf
```

This structure ensures:
- User isolation (each user has their own folder)
- Material uniqueness (each material has a unique ID)
- Original filename preservation (for user reference)

## Database Indexes

The following indexes have been created for optimal performance:

### Vector Search
- `idx_chunks_vector` - IVFFlat index for semantic similarity search on chunk embeddings

### Materials
- `idx_materials_user_status` - Composite index for filtering by user and status
- `idx_materials_created_at` - Index for sorting by creation date

### Chunks
- `idx_chunks_material` - Composite index for fetching chunks by material in order

### Study Packs
- `idx_study_packs_user` - Composite index for user's packs sorted by date
- `idx_study_packs_material` - Index for finding pack by material

### Flashcards
- `idx_flashcards_pack` - Index for fetching all cards in a pack
- `idx_flashcards_due` - Index for SRS due date queries

### Quizzes
- `idx_quizzes_pack` - Index for fetching quiz by pack
- `idx_quiz_items_quiz` - Index for fetching all items in a quiz

### Mind Maps
- `idx_mindmaps_pack` - Index for fetching mind map by pack
- `idx_mindmap_nodes_map` - Composite index for hierarchical queries
- `idx_mindmap_nodes_order` - Index for ordered node retrieval

### Events (Usage Tracking)
- `idx_events_user_created` - Index for user activity tracking
- `idx_events_event_created` - Index for event type queries

## Verification

To verify the setup is complete:

1. Check that the `materials` bucket exists:
```sql
SELECT * FROM storage.buckets WHERE id = 'materials';
```

2. Check that RLS policies are in place:
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

3. Check that indexes are created:
```sql
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

4. Verify pgvector extension:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

## Next Steps

After completing this setup:
1. Ensure environment variables are set (see `.env.example`)
2. Test file upload via the application
3. Verify RLS policies work correctly
4. Monitor storage usage in Supabase dashboard
