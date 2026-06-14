import { Bookmark } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAuth } from "@/hooks/useAuth";

interface BookmarkButtonProps {
  itemType: string;
  itemId: string;
  size?: "sm" | "md";
}

const BookmarkButton = ({ itemType, itemId, size = "sm" }: BookmarkButtonProps) => {
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  if (!user) return null;

  const bookmarked = isBookmarked(itemType, itemId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(itemType, itemId);
      }}
      className={`shrink-0 transition-all duration-200 ${
        size === "sm" ? "p-1.5 rounded-lg" : "p-2 rounded-xl"
      } ${
        bookmarked
          ? "text-warning bg-warning/10 hover:bg-warning/20"
          : "text-muted-foreground hover:text-warning hover:bg-warning/5"
      }`}
      title={bookmarked ? "Remove bookmark" : "Bookmark"}
    >
      <Bookmark
        className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} ${bookmarked ? "fill-current" : ""}`}
      />
    </button>
  );
};

export default BookmarkButton;
