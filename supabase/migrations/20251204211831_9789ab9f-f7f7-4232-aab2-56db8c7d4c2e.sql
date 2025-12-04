-- Add AccuLynx contact ID to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS acculynx_contact_id TEXT;