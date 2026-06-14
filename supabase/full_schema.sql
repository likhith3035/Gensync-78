-- ============================================
-- FULL SCHEMA FOR STUDENTHUB
-- Run this in your new Supabase SQL Editor
-- ============================================

-- =============================================
-- 1. UTILITY FUNCTIONS
-- =============================================

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =============================================
-- 2. ENUMS
-- =============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- =============================================
-- 3. TABLES
-- =============================================

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
  privacy_type text NOT NULL DEFAULT 'all' CHECK (privacy_type IN ('all', 'college', 'selected')),
  allowed_emails text[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PROJECTS TABLE
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'planning', 'active', 'archived', 'urgent')),
  privacy_type text NOT NULL DEFAULT 'all' CHECK (privacy_type IN ('all', 'college', 'selected')),
  allowed_emails text[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PROJECT MEMBERS TABLE
CREATE TABLE public.project_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

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
  privacy_type text NOT NULL DEFAULT 'all' CHECK (privacy_type IN ('all', 'college', 'selected')),
  allowed_emails text[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- USER ROLES TABLE
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- NOTIFICATION READS TABLE
CREATE TABLE public.notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (notification_id, user_id)
);

-- PROFILES TABLE
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  avatar_url text,
  bio text,
  department text,
  year_of_study text,
  skills text[] DEFAULT '{}',
  github_url text,
  linkedin_url text,
  portfolio_url text,
  twitter_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- SHARES TABLE
CREATE TABLE public.shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  share_type text NOT NULL CHECK (share_type IN ('resource', 'project', 'opportunity', 'custom')),
  reference_id uuid,
  custom_title text,
  custom_message text,
  custom_links text[] DEFAULT '{}',
  share_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  access_code text DEFAULT lpad(floor(random() * 1000000)::text, 6, '0'),
  access_method text NOT NULL DEFAULT 'both' CHECK (access_method IN ('link', 'code', 'both')),
  expires_at timestamp with time zone,
  view_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  custom_content text DEFAULT NULL,
  content_type text DEFAULT 'text',
  privacy_type text NOT NULL DEFAULT 'all' CHECK (privacy_type IN ('all', 'college', 'selected')),
  allowed_emails text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.shares.custom_content IS 'Inline code or notes content, max ~50KB recommended';
COMMENT ON COLUMN public.shares.content_type IS 'text or code';

-- CONVERSATIONS TABLE
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  is_group BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CONVERSATION MEMBERS TABLE
CREATE TABLE public.conversation_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- MESSAGES TABLE
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- EVENTS TABLE
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  category TEXT NOT NULL DEFAULT 'general',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- EVENT RSVPS TABLE
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'going',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- DAILY TIPS TABLE
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

-- POINT RULES TABLE
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

-- ANNOUNCEMENTS TABLE
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  is_pinned boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- BOOKMARKS TABLE
CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- ACTIVITY LOG TABLE
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  item_type text NOT NULL,
  item_id uuid,
  item_title text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. FUNCTIONS
-- =============================================

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Auto-assign admin role on signup for specific emails
CREATE OR REPLACE FUNCTION public.handle_admin_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IN ('kamilikhith@gmail.com', 'luckylucky12h@gmail.com', 'uppumanogna@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Share lookup by token
CREATE OR REPLACE FUNCTION public.get_share_by_token(p_token text)
RETURNS SETOF shares
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.shares
  WHERE share_token = p_token
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
$$;

-- Share lookup by access code
CREATE OR REPLACE FUNCTION public.get_share_by_code(p_code text)
RETURNS SETOF shares
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.shares
  WHERE access_code = p_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
$$;

-- Increment share view count
CREATE OR REPLACE FUNCTION public.increment_share_views(p_share_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.shares SET view_count = view_count + 1 WHERE id = p_share_id;
END;
$$;

-- =============================================
-- 6. TRIGGERS
-- =============================================

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_role_assignment();

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. RLS POLICIES
-- =============================================

-- Opportunities
CREATE POLICY "Anyone can view opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create opportunities" ON public.opportunities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own opportunities" ON public.opportunities FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own opportunities" ON public.opportunities FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any opportunity" ON public.opportunities FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any opportunity" ON public.opportunities FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Projects
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any project" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any project" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Project Members
CREATE POLICY "Anyone can view project members" ON public.project_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join projects" ON public.project_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave projects" ON public.project_members FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any project member" ON public.project_members FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Resources
CREATE POLICY "Anyone can view resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload resources" ON public.resources FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own resources" ON public.resources FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any resource" ON public.resources FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any resource" ON public.resources FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User Roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Notifications
CREATE POLICY "Anyone can view notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update notifications" ON public.notifications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete notifications" ON public.notifications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Notification Reads
CREATE POLICY "Users can view own reads" ON public.notification_reads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can mark as read" ON public.notification_reads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Shares
CREATE POLICY "Users can create shares" ON public.shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own shares" ON public.shares FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own shares" ON public.shares FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shares" ON public.shares FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active shares by token" ON public.shares FOR SELECT USING (is_active = true);

-- Conversations
CREATE POLICY "Members can view conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = id AND user_id = auth.uid())
  );
CREATE POLICY "Authenticated users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Conversation Members
CREATE POLICY "Members can view members" ON public.conversation_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members cm WHERE cm.conversation_id = conversation_members.conversation_id AND cm.user_id = auth.uid())
  );
CREATE POLICY "Conversation creator can add members" ON public.conversation_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND created_by = auth.uid())
    OR auth.uid() = user_id
  );

-- Messages
CREATE POLICY "Members can view messages" ON public.messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
  );
CREATE POLICY "Members can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
  );

-- Events
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Admins can update any event" ON public.events FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete any event" ON public.events FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Event RSVPs
CREATE POLICY "Anyone can view RSVPs" ON public.event_rsvps FOR SELECT USING (true);
CREATE POLICY "Authenticated users can RSVP" ON public.event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own RSVP" ON public.event_rsvps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own RSVP" ON public.event_rsvps FOR DELETE USING (auth.uid() = user_id);

-- Daily Tips
CREATE POLICY "Anyone can view active tips" ON public.daily_tips FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage tips" ON public.daily_tips FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Point Rules
CREATE POLICY "Anyone can view active rules" ON public.point_rules FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage rules" ON public.point_rules FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Announcements
CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Bookmarks
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Activity Log
CREATE POLICY "Anyone can view activity" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Authenticated users can log activity" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 8. STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for resources
CREATE POLICY "Anyone can view resource files" ON storage.objects FOR SELECT USING (bucket_id = 'resources');
CREATE POLICY "Authenticated users can upload resource files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own resource files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- 9. REALTIME
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- =============================================
-- 10. SEED DATA
-- =============================================

-- Default point rules
INSERT INTO public.point_rules (action_type, label, points, description, updated_by) VALUES
  ('resource_upload', 'Upload Resource', 10, 'Points earned for uploading a study resource', '00000000-0000-0000-0000-000000000000'),
  ('project_create', 'Create Project', 15, 'Points earned for creating a new project', '00000000-0000-0000-0000-000000000000'),
  ('opportunity_post', 'Post Opportunity', 8, 'Points earned for posting an opportunity', '00000000-0000-0000-0000-000000000000');
