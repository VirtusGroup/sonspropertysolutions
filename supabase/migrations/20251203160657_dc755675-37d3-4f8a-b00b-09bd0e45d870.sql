-- Orders Table Phase 1 Migration
-- Add new columns, constraints, indexes, and trigger

-- 1. ADD NEW COLUMNS
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_category TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- AccuLynx Integration Fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending_contact_creation';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS acculynx_contact_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS acculynx_job_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sync_attempts INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_sync_error TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;

-- 2. BACKFILL updated_at FOR EXISTING ROWS
UPDATE orders SET updated_at = created_at WHERE updated_at IS NULL;

-- 3. ADD NOT NULL CONSTRAINTS (safe - verified no null values exist)
ALTER TABLE orders ALTER COLUMN job_ref SET NOT NULL;
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
ALTER TABLE orders ALTER COLUMN created_at SET NOT NULL;

-- 4. ADD PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_sync_status ON orders(sync_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 5. ADD updated_at TRIGGER (reuses existing function)
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();