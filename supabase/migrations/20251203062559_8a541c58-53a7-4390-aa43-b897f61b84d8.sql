-- Add updated_at column to addresses
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill updated_at from created_at for existing records
UPDATE addresses SET updated_at = created_at WHERE updated_at IS NULL;

-- Add NOT NULL constraint to is_default (safe - no nulls exist)
ALTER TABLE addresses ALTER COLUMN is_default SET NOT NULL;
ALTER TABLE addresses ALTER COLUMN is_default SET DEFAULT false;

-- Add NOT NULL constraint to created_at (safe - no nulls exist)
ALTER TABLE addresses ALTER COLUMN created_at SET NOT NULL;

-- Add performance index for user address lookups
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- Add partial index for finding default address quickly
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(user_id, is_default) 
  WHERE is_default = true;

-- Add updated_at trigger (reuses existing function from profiles migration)
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();