-- 1. Create a trigger function to auto-confirm new signups
CREATE OR REPLACE FUNCTION public.auto_confirm_new_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
  NEW.confirmed_at = COALESCE(NEW.confirmed_at, NOW());
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;

-- Create trigger BEFORE INSERT on auth.users (runs before user row is inserted)
CREATE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_new_users();

-- 2. Clear out all user-generated test data
-- Use DELETE FROM to be safe and avoid foreign key constraint issues
DELETE FROM public.bookmarks;
DELETE FROM public.activity_log;
DELETE FROM public.event_rsvps;
DELETE FROM public.events;
DELETE FROM public.messages;
DELETE FROM public.conversation_members;
DELETE FROM public.conversations;
DELETE FROM public.shares;
DELETE FROM public.notification_reads;
DELETE FROM public.notifications;
DELETE FROM public.project_members;
DELETE FROM public.projects;
DELETE FROM public.resources;
DELETE FROM public.opportunities;
DELETE FROM public.announcements;

-- Delete profiles and user roles for non-admin users
DELETE FROM public.user_roles 
WHERE user_id NOT IN (
  SELECT id FROM auth.users 
  WHERE email IN ('kamilikhith@gmail.com', 'luckylucky12h@gmail.com', 'uppumanogna@gmail.com')
);

DELETE FROM public.profiles 
WHERE user_id NOT IN (
  SELECT id FROM auth.users 
  WHERE email IN ('kamilikhith@gmail.com', 'luckylucky12h@gmail.com', 'uppumanogna@gmail.com')
);

-- Delete non-admin users from auth.users (will cascade delete remaining profiles/roles if any reference them)
DELETE FROM auth.users 
WHERE email NOT IN ('kamilikhith@gmail.com', 'luckylucky12h@gmail.com', 'uppumanogna@gmail.com');
