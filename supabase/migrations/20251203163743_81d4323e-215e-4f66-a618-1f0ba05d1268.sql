-- Phase 3: notifications table schema alignment
-- Add NOT NULL constraints and performance indexes

-- 1. Add NOT NULL constraints (safe - 0 records exist)
ALTER TABLE notifications ALTER COLUMN type SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN read SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN created_at SET NOT NULL;

-- 2. Create performance indexes for notification lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(user_id, created_at DESC);