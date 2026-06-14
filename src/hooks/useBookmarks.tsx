import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useBookmarks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addBookmark = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: string; itemId: string }) => {
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user!.id,
        item_type: itemType,
        item_id: itemId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Bookmarked!");
    },
    onError: (e: any) => {
      if (e.message?.includes("duplicate")) {
        toast.info("Already bookmarked");
      } else {
        toast.error(e.message);
      }
    },
  });

  const removeBookmark = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: string; itemId: string }) => {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user!.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Bookmark removed");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const isBookmarked = (itemType: string, itemId: string) =>
    bookmarks.some((b: any) => b.item_type === itemType && b.item_id === itemId);

  const toggleBookmark = (itemType: string, itemId: string) => {
    if (isBookmarked(itemType, itemId)) {
      removeBookmark.mutate({ itemType, itemId });
    } else {
      addBookmark.mutate({ itemType, itemId });
    }
  };

  return { bookmarks, isLoading, isBookmarked, toggleBookmark, addBookmark, removeBookmark };
};
