-- ============================================
-- IMPORTANT: Run this SQL in your Supabase Dashboard
-- ============================================
-- Go to: Supabase Dashboard > SQL Editor > New Query
-- Paste this entire file and click "Run"
-- ============================================

-- Add invite_code column to waitlist table if it doesn't exist
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_invite_code ON waitlist(invite_code);

-- Create app_settings table for global application settings
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to app_settings" ON app_settings;
DROP POLICY IF EXISTS "Allow service role to update app_settings" ON app_settings;

-- Allow public read access (for checking waitlist mode)
CREATE POLICY "Allow public read access to app_settings"
  ON app_settings
  FOR SELECT
  TO public
  USING (true);

-- Only allow service role to update (admin only via API)
CREATE POLICY "Allow service role to update app_settings"
  ON app_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default waitlist mode setting (enabled by default)
INSERT INTO app_settings (key, value)
VALUES ('waitlist_mode', '{"enabled": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Add comment
COMMENT ON TABLE app_settings IS 'Global application settings stored as key-value pairs with JSONB values';

-- Verify the table was created
SELECT * FROM app_settings WHERE key = 'waitlist_mode';
