
-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- OPPORTUNITIES TABLE
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  location TEXT,
  deadline DATE,
  category TEXT NOT NULL CHECK (category IN ('internship', 'hackathon', 'workshop', 'scholarship')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create opportunities" ON public.opportunities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own opportunities" ON public.opportunities FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own opportunities" ON public.opportunities FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PROJECTS TABLE
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'planning', 'active', 'archived', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PROJECT MEMBERS TABLE
CREATE TABLE public.project_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view project members" ON public.project_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join projects" ON public.project_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave projects" ON public.project_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RESOURCES TABLE
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  course_code TEXT,
  category TEXT NOT NULL CHECK (category IN ('notes', 'past_paper', 'tutorial')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload resources" ON public.resources FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own resources" ON public.resources FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- STORAGE BUCKET FOR RESOURCES
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

CREATE POLICY "Anyone can view resource files" ON storage.objects FOR SELECT USING (bucket_id = 'resources');
CREATE POLICY "Authenticated users can upload resource files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own resource files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
