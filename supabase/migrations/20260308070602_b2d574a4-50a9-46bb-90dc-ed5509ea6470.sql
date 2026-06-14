
-- Create shares table
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
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can create shares" ON public.shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own shares" ON public.shares FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own shares" ON public.shares FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shares" ON public.shares FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active shares by token" ON public.shares FOR SELECT USING (is_active = true);

-- Function to look up share by token (public, no auth needed)
CREATE OR REPLACE FUNCTION public.get_share_by_token(p_token text)
RETURNS SETOF public.shares
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.shares
  WHERE share_token = p_token AND is_active = true;
$$;

-- Function to look up share by access code (public, no auth needed)
CREATE OR REPLACE FUNCTION public.get_share_by_code(p_code text)
RETURNS SETOF public.shares
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.shares
  WHERE access_code = p_code AND is_active = true;
$$;

-- Function to increment view count
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
