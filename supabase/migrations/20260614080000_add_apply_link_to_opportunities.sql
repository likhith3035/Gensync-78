-- Add apply_link column to opportunities table
-- This stores an optional external URL (form, website, etc.) where students can apply
ALTER TABLE public.opportunities
ADD COLUMN IF NOT EXISTS apply_link TEXT;
