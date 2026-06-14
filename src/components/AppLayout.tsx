import { ReactNode, useState, useRef, useEffect, useMemo } from "react";
import AppSidebar from "./AppSidebar";
import MobileNav from "./MobileNav";
import Breadcrumbs from "./Breadcrumbs";
import { Search, Bell, X, Briefcase, FolderKanban, BookOpen, Calendar, FileText, LayoutDashboard, User, Share2, Shield, Info, Code2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import AIChatbot from "./AIChatbot";

const notifTypeIcons: Record<string, string> = {
  info: "ℹ️",
  warning: "⚠️",
  success: "✅",
  urgent: "🚨",
};

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: searchOpps = [] } = useQuery({
    queryKey: ["search-opportunities"],
    queryFn: async () => {
      const { data } = await supabase.from("opportunities").select("id, title, category, organization");
      return data || [];
    },
    enabled: !!user,
  });
  const { data: searchProjects = [] } = useQuery({
    queryKey: ["search-projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, title, status");
      return data || [];
    },
    enabled: !!user,
  });
  const { data: searchResources = [] } = useQuery({
    queryKey: ["search-resources"],
    queryFn: async () => {
      const { data } = await supabase.from("resources").select("id, title, subject, category");
      return data || [];
    },
    enabled: !!user,
  });
  const { data: searchEvents = [] } = useQuery({
    queryKey: ["search-events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("id, title, category, location");
      return data || [];
    },
    enabled: !!user,
  });

  // Pages for navigation search
  const pages = useMemo(() => [
    { id: "dashboard", title: "Dashboard", type: "page" as const, sub: "Home", route: "/dashboard" },
    { id: "opportunities", title: "Opportunities", type: "page" as const, sub: "Browse & post", route: "/opportunities" },
    { id: "projects", title: "Projects", type: "page" as const, sub: "Collaborate", route: "/projects" },
    { id: "resources", title: "Resources", type: "page" as const, sub: "Study materials", route: "/resources" },
    { id: "events", title: "Events", type: "page" as const, sub: "Campus events", route: "/events" },
    { id: "shares", title: "Sharing Hub", type: "page" as const, sub: "Share content", route: "/shares" },
    { id: "community", title: "Community Discussions", type: "page" as const, sub: "Student Forums & Q&A", route: "/community" },
    { id: "profile", title: "Profile", type: "page" as const, sub: "Your profile", route: "/profile" },
    { id: "about", title: "About", type: "page" as const, sub: "About StudentHub", route: "/about" },
    { id: "developer", title: "Developer", type: "page" as const, sub: "Meet the developer", route: "/developer" },
  ], []);

  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    const results: { id: string; title: string; type: string; sub: string; route: string }[] = [];

    // Search pages first
    pages.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q))
        results.push(p);
    });

    searchOpps.forEach((o: any) => {
      if (o.title?.toLowerCase().includes(q) || o.category?.toLowerCase().includes(q) || o.organization?.toLowerCase().includes(q))
        results.push({ id: o.id, title: o.title, type: "opportunity", sub: o.organization || o.category, route: "/opportunities" });
    });
    searchProjects.forEach((p: any) => {
      if (p.title?.toLowerCase().includes(q) || p.status?.toLowerCase().includes(q))
        results.push({ id: p.id, title: p.title, type: "project", sub: p.status, route: "/projects" });
    });
    searchResources.forEach((r: any) => {
      if (r.title?.toLowerCase().includes(q) || r.subject?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q))
        results.push({ id: r.id, title: r.title, type: "resource", sub: r.subject || r.category, route: "/resources" });
    });
    searchEvents.forEach((e: any) => {
      if (e.title?.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q))
        results.push({ id: e.id, title: e.title, type: "event", sub: e.location || e.category, route: "/events" });
    });
    return results.slice(0, 10);
  }, [searchQuery, searchOpps, searchProjects, searchResources, searchEvents, pages]);

  const searchIcon = (type: string) => {
    switch (type) {
      case "page": return <LayoutDashboard className="w-4 h-4 text-primary" />;
      case "opportunity": return <Briefcase className="w-4 h-4 text-primary" />;
      case "project": return <FolderKanban className="w-4 h-4 text-accent-foreground" />;
      case "resource": return <BookOpen className="w-4 h-4 text-success" />;
      case "event": return <Calendar className="w-4 h-4 text-warning" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const { data: notifications = [] } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: readIds = [] } = useQuery({
    queryKey: ["notification-reads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_reads")
        .select("notification_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r: any) => r.notification_id);
    },
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n: any) => !readIds.includes(n.id)).length;

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase.from("notification_reads").insert({
        notification_id: notificationId,
        user_id: user!.id,
      });
      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-reads"] });
    },
  });

  const markAllRead = async () => {
    const unread = notifications.filter((n: any) => !readIds.includes(n.id));
    for (const n of unread) {
      await supabase.from("notification_reads").insert({
        notification_id: n.id,
        user_id: user!.id,
      }).then(() => {});
    }
    queryClient.invalidateQueries({ queryKey: ["notification-reads"] });
  };

  return (
    <div className="flex min-h-screen bg-sarvam-ambient overflow-x-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* One UI Header */}
        <header className="sticky top-0 z-40 glass-panel h-16 flex items-center px-4 md:px-8 gap-3">
          <div className="flex-1 max-w-xl" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search opportunities, projects, resources..."
                className="w-full h-10 pl-11 pr-10 rounded-full bg-slate-50/80 border border-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:bg-white focus:border-slate-200 transition-all duration-200 shadow-sm"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                onFocus={() => { if (searchQuery.trim()) setShowResults(true); }}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => { setSearchQuery(""); setShowResults(false); }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showResults && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] overflow-hidden z-50 animate-scale-in">
                  {searchResults.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      No results for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto py-2">
                      {searchResults.map((r) => (
                        <button
                          key={r.id}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                          onClick={() => {
                            navigate(r.route);
                            setSearchQuery("");
                            setShowResults(false);
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                            {searchIcon(r.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{r.title}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{r.type} · {r.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Info */}
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200"
              onClick={() => navigate("/info")}
              title="How to use StudentHub"
            >
              <Info className="w-4.5 h-4.5 text-slate-500" />
            </button>
            {/* Bell */}
            <div className="relative">
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 relative"
                onClick={() => setShowNotifs(!showNotifs)}
              >
                <Bell className="w-4.5 h-4.5 text-slate-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-scale-in">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                  <div
                    className="absolute right-0 top-12 z-50 w-80 md:w-96 bg-white rounded-2xl border border-slate-100 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] overflow-hidden animate-scale-in"
                  >
                    <div className="p-5 pb-3 flex items-center justify-between">
                      <h3 className="font-bold text-foreground text-base">Notifications</h3>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-indigo-600 font-semibold hover:underline">
                            Read all
                          </button>
                        )}
                        <button onClick={() => setShowNotifs(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          No notifications yet
                        </div>
                      ) : notifications.map((n: any) => {
                        const isRead = readIds.includes(n.id);
                        return (
                          <div
                            key={n.id}
                            className={`px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${!isRead ? "bg-indigo-50/20" : ""}`}
                            onClick={() => { if (!isRead) markAsRead.mutate(n.id); }}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-base shrink-0 mt-0.5">{notifTypeIcons[n.type] || "ℹ️"}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className={`text-sm truncate ${!isRead ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>{n.title}</h4>
                                  {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-muted-foreground/70 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>
      <MobileNav />
      <AIChatbot />
    </div>
  );
};

export default AppLayout;
