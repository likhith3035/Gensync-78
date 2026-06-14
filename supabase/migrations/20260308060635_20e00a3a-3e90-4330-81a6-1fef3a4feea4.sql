
-- Allow admins to delete any opportunity
CREATE POLICY "Admins can delete any opportunity"
  ON public.opportunities FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any project
CREATE POLICY "Admins can delete any project"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any resource
CREATE POLICY "Admins can delete any resource"
  ON public.resources FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete project members (when deleting projects)
CREATE POLICY "Admins can delete any project member"
  ON public.project_members FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
