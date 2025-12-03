-- Phase 2: order_photos table schema alignment
-- Add file metadata columns, AccuLynx sync fields, constraints, and index

-- 1. Add new columns
ALTER TABLE order_photos ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE order_photos ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE order_photos ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE order_photos ADD COLUMN IF NOT EXISTS uploaded_to_acculynx BOOLEAN DEFAULT false;
ALTER TABLE order_photos ADD COLUMN IF NOT EXISTS acculynx_file_id TEXT;

-- 2. Backfill file_name from storage_path for existing records
UPDATE order_photos 
SET file_name = substring(storage_path from '[^/]+$')
WHERE file_name IS NULL;

-- 3. Add NOT NULL constraints
ALTER TABLE order_photos ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE order_photos ALTER COLUMN uploaded_to_acculynx SET NOT NULL;

-- 4. Create performance index for photo lookups by order
CREATE INDEX IF NOT EXISTS idx_photos_order_id ON order_photos(order_id);