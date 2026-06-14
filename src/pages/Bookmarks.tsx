import SEO from "@/components/SEO";
import AppLayout from "@/components/AppLayout";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bookmark, Briefcase, FolderKanban, BookOpen, Calendar, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const filterTabs = [
  { label: "All", value: "all" },
  { label: "Opportunities", value: "opportunity", icon: Briefcase },
  { label: "Projects", value: "project", icon: FolderKanban },
  { label: "Resources", value: "resource", icon: BookOpen },
  { label: "Events", value: "event", icon: Calendar },
];

const Bookmarks = () => {
  const { bookmarks, isLoading, removeBookmark } = useBookmarks();
  const [filter, setFilter] = useState("all");

  // Fetch details for bookmarked items
  const { data: opportunities = [] } = useQuery({
    queryKey: ["bookmark-opportunities"],
    queryFn: async () => {
      const { data } = await supabase.from("opportunities").select("*");
      return data || [];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["bookmark-projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*");
      return data || [];
    },
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["bookmark-resources"],
    queryFn: async () => {
      const { data } = await supabase.from("resources").select("*");
      return data || [];
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["bookmark-events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*");
      return data || [];
    },
  });

  const filtered = filter === "all" ? bookmarks : bookmarks.filter((b: any) => b.item_type === filter);

  const getItemDetails = (bookmark: any) => {
    switch (bookmark.item_type) {
      case "opportunity": {
        const item = opportunities.find((o: any) => o.id === bookmark.item_id);
        return item ? { title: item.title, subtitle: item.organization, link: "/opportunities", icon: Briefcase, color: "text-primary", bg: "bg-primary/10" } : null;
      }
      case "project": {
        const item = projects.find((p: any) => p.id === bookmark.item_id);
        return item ? { title: item.title, subtitle: item.status, link: "/projects", icon: FolderKanban, color: "text-accent-foreground", bg: "bg-accent" } : null;
      }
      case "resource": {
        const item = resources.find((r: any) => r.id === bookmark.item_id);
        return item ? { title: item.title, subtitle: `${item.subject} • ${item.category}`, link: "/resources", icon: BookOpen, color: "text-success", bg: "bg-success/10" } : null;
      }
      case "event": {
        const item = events.find((e: any) => e.id === bookmark.item_id);
        return item ? { title: item.title, subtitle: new Date(item.event_date).toLocaleDateString(), link: "/events", icon: Calendar, color: "text-warning", bg: "bg-warning/10" } : null;
      }
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <SEO title="Bookmarks" description="Your saved bookmarks" noindex />
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">Bookmarks</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">{bookmarks.length} saved items</p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                filter === tab.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookmarks list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-campus p-10 text-center animate-fade-in">
            <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-foreground">No bookmarks yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tap the bookmark icon on any opportunity, project, resource, or event to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2 animate-fade-in">
            {filtered.map((bookmark: any) => {
              const details = getItemDetails(bookmark);
              if (!details) return (
                <div key={bookmark.id} className="card-campus p-3 sm:p-4 flex items-center gap-3 opacity-60">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Bookmark className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Item no longer available</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-8"
                    onClick={() => removeBookmark.mutate({ itemType: bookmark.item_type, itemId: bookmark.item_id })}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );

              const Icon = details.icon;
              return (
                <div key={bookmark.id} className="card-campus p-3 sm:p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${details.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${details.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{details.title}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{details.subtitle}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Link to={details.link}>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive h-8 px-2"
                      onClick={() => removeBookmark.mutate({ itemType: bookmark.item_type, itemId: bookmark.item_id })}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Bookmarks;
