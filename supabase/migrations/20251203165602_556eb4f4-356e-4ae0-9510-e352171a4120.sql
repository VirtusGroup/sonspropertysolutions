-- Phase 4 & 5: Create user_devices and webhook_logs tables

-- ============================================
-- PHASE 4: user_devices table
-- Purpose: Store push notification tokens for mobile devices
-- ============================================

CREATE TABLE user_devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fcm_token       TEXT NOT NULL,
  platform        TEXT NOT NULL,
  device_name     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_fcm_token ON user_devices(fcm_token);
CREATE UNIQUE INDEX idx_user_devices_unique_token ON user_devices(fcm_token) WHERE is_active = true;

-- Auto-update timestamp trigger
CREATE TRIGGER update_user_devices_updated_at
  BEFORE UPDATE ON user_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices"
  ON user_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
  ON user_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
  ON user_devices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON user_devices FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PHASE 5: webhook_logs table
-- Purpose: Audit trail for incoming AccuLynx webhooks
-- ============================================

CREATE TABLE webhook_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source          TEXT NOT NULL,
  event_type      TEXT,
  payload         JSONB NOT NULL,
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  processed       BOOLEAN NOT NULL DEFAULT false,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_webhook_logs_source ON webhook_logs(source);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_processed ON webhook_logs(processed) WHERE processed = false;

-- RLS policies (service role only - backend access)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON webhook_logs FOR ALL
  USING (auth.role() = 'service_role');