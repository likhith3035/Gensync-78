-- Add privacy_type and allowed_emails to public.resources table
ALTER TABLE public.resources 
ADD COLUMN privacy_type TEXT NOT NULL DEFAULT 'all' CHECK (privacy_type IN ('all', 'college', 'selected')),
ADD COLUMN allowed_emails TEXT[] DEFAULT '{}';

-- Add privacy_type and allowed_emails to public.projects table
ALTER TABLE public.projects 
ADD COLUMN privacy_type TEXT NOT NULL DEFAULT 'all' CHECK (privacy_type IN ('all', 'college', 'selected')),
ADD COLUMN allowed_emails TEXT[] DEFAULT '{}';

-- Add privacy_type and allowed_emails to public.opportunities table
ALTER TABLE public.opportunities 
ADD COLUMN privacy_type TEXT NOT NULL DEFAULT 'all' CHECK (privacy_type IN ('all', 'college', 'selected')),
ADD COLUMN allowed_emails TEXT[] DEFAULT '{}';

-- Add privacy_type and allowed_emails to public.shares table
ALTER TABLE public.shares 
ADD COLUMN privacy_type TEXT NOT NULL DEFAULT 'all' CHECK (privacy_type IN ('all', 'college', 'selected')),
ADD COLUMN allowed_emails TEXT[] DEFAULT '{}';
