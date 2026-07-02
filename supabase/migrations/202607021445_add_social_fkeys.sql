-- Add foreign key constraints referencing public.profiles(user_id) 
-- to allow PostgREST to automatically resolve joins between posts/stories/follows and profiles.

-- 1. Posts foreign key to profiles
ALTER TABLE public.posts
  ADD CONSTRAINT posts_user_id_profiles_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(user_id) 
  ON DELETE CASCADE;

-- 2. Stories foreign key to profiles
ALTER TABLE public.stories
  ADD CONSTRAINT stories_user_id_profiles_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(user_id) 
  ON DELETE CASCADE;

-- 3. Follows follower_id foreign key to profiles
ALTER TABLE public.follows
  ADD CONSTRAINT follows_follower_id_profiles_fkey 
  FOREIGN KEY (follower_id) 
  REFERENCES public.profiles(user_id) 
  ON DELETE CASCADE;

-- 4. Follows following_id foreign key to profiles
ALTER TABLE public.follows
  ADD CONSTRAINT follows_following_id_profiles_fkey 
  FOREIGN KEY (following_id) 
  REFERENCES public.profiles(user_id) 
  ON DELETE CASCADE;

-- 5. Certificates foreign key to profiles
ALTER TABLE public.certificates
  ADD CONSTRAINT certificates_user_id_profiles_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(user_id) 
  ON DELETE CASCADE;
