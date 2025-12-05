-- Add columns for tracking cancellation and AccuLynx milestone
ALTER TABLE orders ADD COLUMN cancellation_reason TEXT;
ALTER TABLE orders ADD COLUMN acculynx_milestone TEXT;
ALTER TABLE orders ADD COLUMN milestone_updated_at TIMESTAMPTZ;