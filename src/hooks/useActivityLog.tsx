import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useActivityLog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logActivity = useMutation({
    mutationFn: async ({
      action,
      itemType,
      itemId,
      itemTitle,
    }: {
      action: string;
      itemType: string;
      itemId?: string;
      itemTitle?: string;
    }) => {
      if (!user) return;
      const { error } = await supabase.from("activity_log").insert({
        user_id: user.id,
        action,
        item_type: itemType,
        item_id: itemId || null,
        item_title: itemTitle || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-feed"] });
    },
  });

  return { logActivity };
};
