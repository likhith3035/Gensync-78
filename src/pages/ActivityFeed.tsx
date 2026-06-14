import SEO from "@/components/SEO";
import AppLayout from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, Briefcase, FolderKanban, BookOpen, Calendar, Bell, Megaphone,
  Clock, TrendingUp
} from "lucide-react";
import { useMemo, useState } from "react";

const ActivityFeed = () => {
  const [filter, setFilter] = useState("all");

  // Fetch all recent data to build feed
  const { data: opportunities = [] } = useQuery({
    queryKey: ["feed-opportunities"],
    queryFn: async () => {
      const { data } = await supabase.from("opportunities").select("id, title, category, organization, created_at").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["feed-projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, title, status, created_at").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["feed-resources"],
    queryFn: async () => {
      const { data } = await supabase.from("resources").select("id, title, subject, category, file_name, created_at").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["feed-events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("id, title, category, event_date, created_at").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["feed-announcements"],
    queryFn: async () => {
      const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["feed-notifications"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });

  const feed = useMemo(() => {
    const items: any[] = [];

    opportunities.forEach((o: any) => items.push({
      id: o.id, type: "opportunity", title: o.title,
      subtitle: `${o.organization} • ${o.category}`,
      time: o.created_at, icon: Briefcase, color: "text-primary", bg: "bg-primary/10",
    }));

    projects.forEach((p: any) => items.push({
      id: p.id, type: "project", title: p.title,
      subtitle: `Status: ${p.status}`,
      time: p.created_at, icon: FolderKanban, color: "text-accent-foreground", bg: "bg-accent",
    }));

    resources.forEach((r: any) => items.push({
      id: r.id, type: "resource", title: r.title || r.file_name,
      subtitle: `${r.subject} • ${r.category}`,
      time: r.created_at, icon: BookOpen, color: "text-success", bg: "bg-success/10",
    }));

    events.forEach((e: any) => items.push({
      id: e.id, type: "event", title: e.title,
      subtitle: `${e.category} • ${new Date(e.event_date).toLocaleDateString()}`,
      time: e.created_at, icon: Calendar, color: "text-warning", bg: "bg-warning/10",
    }));

    announcements.forEach((a: any) => items.push({
      id: a.id, type: "announcement", title: a.title,
      subtitle: a.content.slice(0, 80) + (a.content.length > 80 ? "..." : ""),
      time: a.created_at, icon: Megaphone, color: "text-destructive", bg: "bg-destructive/10",
    }));

    notifications.forEach((n: any) => items.push({
      id: n.id, type: "notification", title: n.title,
      subtitle: n.message.slice(0, 80),
      time: n.created_at, icon: Bell, color: "text-primary", bg: "bg-primary/10",
    }));

    return items
      .filter((i) => filter === "all" || i.type === filter)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [opportunities, projects, resources, events, announcements, notifications, filter]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const filters = [
    { label: "All", value: "all" },
    { label: "Opportunities", value: "opportunity" },
    { label: "Projects", value: "project" },
    { label: "Resources", value: "resource" },
    { label: "Events", value: "event" },
    { label: "Announcements", value: "announcement" },
  ];

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    feed.forEach((item) => {
      const date = new Date(item.time);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) key = "Today";
      else if (date.toDateString() === yesterday.toDateString()) key = "Yesterday";
      else key = date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [feed]);

  return (
    <AppLayout>
      <SEO title="Activity Feed" description="See what's happening on campus" noindex />
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-medium text-[#0F172A] tracking-tight font-serif-elegant">Activity Feed</h1>
              <p className="text-xs sm:text-sm text-slate-500">Everything happening on campus</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 p-1.5 bg-white border border-slate-100 rounded-full overflow-x-auto no-scrollbar shadow-[0_2px_8px_rgba(15,23,42,0.01)] w-fit">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                filter === f.value ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {feed.length === 0 ? (
          <div className="card-premium-light p-10 text-center bg-white animate-fade-in">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-[#0F172A]">No activity yet</p>
            <p className="text-sm text-slate-500 mt-1">New content will appear here as it's added.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{date}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="space-y-2.5">
                  {items.map((item: any) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id + item.type} className="card-premium-light bg-white p-3.5 sm:p-4 flex items-start gap-3">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${item.bg} flex items-center justify-center shrink-0 border border-slate-50`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-[#0F172A] truncate">{item.title}</p>
                          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
                        </div>
                        <span className="text-[10px] sm:text-xs text-slate-400 shrink-0 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5" /> {timeAgo(item.time)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ActivityFeed;
