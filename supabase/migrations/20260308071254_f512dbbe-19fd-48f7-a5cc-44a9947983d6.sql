
ALTER TABLE public.shares
ADD COLUMN custom_content text DEFAULT NULL,
ADD COLUMN content_type text DEFAULT 'text';

COMMENT ON COLUMN public.shares.custom_content IS 'Inline code or notes content, max ~50KB recommended';
COMMENT ON COLUMN public.shares.content_type IS 'text or code';
