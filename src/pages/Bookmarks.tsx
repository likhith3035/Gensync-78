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
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shadow-sm">
              <Bookmark className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-medium text-[#0F172A] tracking-tight font-serif-elegant">Bookmarks</h1>
              <p className="text-xs sm:text-sm text-slate-500">{bookmarks.length} saved items</p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 p-1.5 bg-white border border-slate-100 rounded-full overflow-x-auto no-scrollbar shadow-[0_2px_8px_rgba(15,23,42,0.01)] w-fit">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                filter === tab.value ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
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
          <div className="card-premium-light p-10 text-center bg-white animate-fade-in">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-[#0F172A]">No bookmarks yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Tap the bookmark icon on any opportunity, project, resource, or event to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 animate-fade-in">
            {filtered.map((bookmark: any) => {
              const details = getItemDetails(bookmark);
              if (!details) return (
                <div key={bookmark.id} className="card-premium-light p-3 sm:p-4 flex items-center gap-3 bg-white opacity-60">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Bookmark className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-500">Item no longer available</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-8 rounded-full"
                    onClick={() => removeBookmark.mutate({ itemType: bookmark.item_type, itemId: bookmark.item_id })}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );

              const Icon = details.icon;
              return (
                <div key={bookmark.id} className="card-premium-light p-3 sm:p-4 flex items-center gap-3 bg-white">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${details.bg} flex items-center justify-center shrink-0 border border-slate-100`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${details.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#0F172A] truncate">{details.title}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">{details.subtitle}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Link to={details.link}>
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs rounded-full">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive h-8 px-3 rounded-full hover:bg-destructive/10"
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
