
-- Daily tips table (admin-managed)
CREATE TABLE public.daily_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji text NOT NULL DEFAULT '💡',
  title text NOT NULL,
  text text NOT NULL,
  category text NOT NULL DEFAULT 'tip',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);

ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tips" ON public.daily_tips
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tips" ON public.daily_tips
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Point rules table (admin-managed)
CREATE TABLE public.point_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL UNIQUE,
  label text NOT NULL,
  points integer NOT NULL DEFAULT 10,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid NOT NULL
);

ALTER TABLE public.point_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rules" ON public.point_rules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage rules" ON public.point_rules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default point rules
INSERT INTO public.point_rules (action_type, label, points, description, updated_by) VALUES
  ('resource_upload', 'Upload Resource', 10, 'Points earned for uploading a study resource', '00000000-0000-0000-0000-000000000000'),
  ('project_create', 'Create Project', 15, 'Points earned for creating a new project', '00000000-0000-0000-0000-000000000000'),
  ('opportunity_post', 'Post Opportunity', 8, 'Points earned for posting an opportunity', '00000000-0000-0000-0000-000000000000');
