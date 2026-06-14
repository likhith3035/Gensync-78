
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
