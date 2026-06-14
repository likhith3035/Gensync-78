-- Migration to add Team Formation/Building features

-- 1. Create project_join_requests table
CREATE TABLE IF NOT EXISTS public.project_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- applicant's Firebase UID
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'invited'
    message TEXT,
    preferred_role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add Open to Build and profile detail columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_open_to_build BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS open_to_build_bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS open_to_build_roles TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Disable Row Level Security on project_join_requests
ALTER TABLE public.project_join_requests DISABLE ROW LEVEL SECURITY;
