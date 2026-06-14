import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import EventReminders from "@/components/EventReminders";
import AnnouncementsBanner from "@/components/AnnouncementsBanner";
import OnboardingDialog from "@/components/OnboardingDialog";
import { Button } from "@/components/ui/button";
import {
  Rocket, FileText, Calendar, Users, ArrowRight, Sparkles, TrendingUp,
  BookOpen, FolderKanban, Briefcase, Clock, Plus, Activity, BarChart3,
  Zap, Target, Award, Trophy, Flame, Star, Lightbulb, Heart,
  Coffee, Sun, MessageCircle, Code2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { useMemo, useState } from "react";

const CHART_COLORS = [
  "hsl(234, 89%, 64%)",
  "hsl(160, 60%, 45%)",
  "hsl(35, 80%, 55%)",
  "hsl(280, 67%, 60%)",
  "hsl(0, 84%, 60%)",
];

const categoryColors: Record<string, string> = {
  internship: "bg-primary/10 text-primary",
  hackathon: "bg-accent text-accent-foreground",
  workshop: "bg-warning/10 text-warning",
  scholarship: "bg-success/10 text-success",
};

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

  const { data: opportunities = [] } = useQuery({
    queryKey: ["dashboard-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: allOpportunities = [] } = useQuery({
    queryKey: ["dashboard-all-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("opportunities").select("id, category, created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ["dashboard-all-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id, status, created_at, title, user_id");
      if (error) throw error;
      return data;
    },
  });

  const { data: allResources = [] } = useQuery({
    queryKey: ["dashboard-all-resources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("id, category, subject, created_at, file_name, user_id");
      if (error) throw error;
      return data;
    },
  });

  const { data: recentResources = [] } = useQuery({
    queryKey: ["dashboard-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["dashboard-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  // Fetch all profiles for leaderboard display names
  const { data: allProfiles = [] } = useQuery({
    queryKey: ["dashboard-all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, bio, department, avatar_url, skills");
      if (error) throw error;
      return data;
    },
  });

  // Fetch admin-managed daily tips
  const { data: dbTips = [] } = useQuery({
    queryKey: ["dashboard-daily-tips"],
    queryFn: async () => {
      const { data, error } = await supabase.from("daily_tips").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data;
    },
  });

  // Fetch admin-managed point rules
  const { data: pointRules = [] } = useQuery({
    queryKey: ["dashboard-point-rules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("point_rules").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Daily Campus Feed - uses DB tips if available, falls back to defaults
  const dailyFeed = useMemo(() => {
    const fallbackTips = [
      { emoji: "💡", title: "Study Tip", text: "Break study sessions into 25-minute focus blocks with 5-minute breaks. The Pomodoro technique boosts retention!", category: "tip" },
      { emoji: "🚀", title: "Career Boost", text: "Update your LinkedIn profile today. Recruiters check it before interviews!", category: "career" },
      { emoji: "📚", title: "Did You Know?", text: "Students who share notes with peers score 15% higher on average. Upload your notes on StudentHub!", category: "fact" },
      { emoji: "🤝", title: "Collaboration", text: "Join a project team this week! Working with others builds skills that classes alone can't teach.", category: "motivation" },
      { emoji: "💪", title: "Motivational", text: "Every expert was once a beginner. Keep building, keep learning, keep sharing!", category: "motivation" },
    ];
    const tips = dbTips.length > 0 ? dbTips : fallbackTips;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return tips[dayOfYear % tips.length];
  }, [dbTips]);

  // Get point values from DB rules (with defaults)
  const getPoints = useMemo(() => {
    const ruleMap: Record<string, number> = {};
    pointRules.forEach((r: any) => { ruleMap[r.action_type] = r.points; });
    return {
      resource: ruleMap["resource_upload"] ?? 10,
      project: ruleMap["project_create"] ?? 15,
      opportunity: ruleMap["opportunity_post"] ?? 8,
    };
  }, [pointRules]);

  // Leaderboard - computed from existing data with DB-driven points
  const leaderboard = useMemo(() => {
    const scores: Record<string, { resources: number; projects: number; opportunities: number; total: number }> = {};
    
    allResources.forEach((r) => {
      if (!scores[r.user_id]) scores[r.user_id] = { resources: 0, projects: 0, opportunities: 0, total: 0 };
      scores[r.user_id].resources += 1;
      scores[r.user_id].total += getPoints.resource;
    });
    
    allProjects.forEach((p) => {
      if (!scores[p.user_id]) scores[p.user_id] = { resources: 0, projects: 0, opportunities: 0, total: 0 };
      scores[p.user_id].projects += 1;
      scores[p.user_id].total += getPoints.project;
    });
    
    allOpportunities.forEach((o: any) => {
      if (!o.user_id) return;
      if (!scores[o.user_id]) scores[o.user_id] = { resources: 0, projects: 0, opportunities: 0, total: 0 };
      scores[o.user_id].opportunities += 1;
      scores[o.user_id].total += getPoints.opportunity;
    });

    return Object.entries(scores)
      .map(([userId, data]) => {
        const profile = allProfiles.find((p) => p.user_id === userId);
        return { userId, ...data, profile };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [allResources, allProjects, allOpportunities, allProfiles, getPoints]);

  const rankBadge = (index: number) => {
    if (index === 0) return { icon: "🥇", bg: "bg-warning/15 border-warning/30" };
    if (index === 1) return { icon: "🥈", bg: "bg-muted border-border" };
    if (index === 2) return { icon: "🥉", bg: "bg-warning/8 border-warning/20" };
    return { icon: `${index + 1}`, bg: "bg-muted/50 border-border/40" };
  };

  const myPoints = useMemo(() => {
    if (!user) return 0;
    const entry = leaderboard.find((l) => l.userId === user.id);
    return entry?.total || 0;
  }, [leaderboard, user]);

  // Build activity timeline from all data
  const activityFeed = useMemo(() => {
    const items: { id: string; type: string; title: string; time: string; icon: string }[] = [];

    allOpportunities.slice(0, 5).forEach((o) => {
      items.push({ id: o.id, type: "opportunity", title: `New opportunity: ${(o as any).title || o.category}`, time: o.created_at, icon: "opportunity" });
    });
    allProjects.slice(0, 5).forEach((p) => {
      items.push({ id: p.id, type: "project", title: `Project created: ${p.title}`, time: p.created_at, icon: "project" });
    });
    allResources.slice(0, 5).forEach((r) => {
      items.push({ id: r.id, type: "resource", title: `Resource uploaded: ${r.file_name}`, time: r.created_at, icon: "resource" });
    });
    notifications.forEach((n: any) => {
      items.push({ id: n.id, type: "notification", title: n.title, time: n.created_at, icon: "notification" });
    });

    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
  }, [allOpportunities, allProjects, allResources, notifications]);

  // Weekly activity chart data (last 7 days)
  const weeklyData = useMemo(() => {
    const days: { name: string; opportunities: number; projects: number; resources: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = date.toISOString().split("T")[0];

      days.push({
        name: dayStr,
        opportunities: allOpportunities.filter((o) => o.created_at.startsWith(dateStr)).length,
        projects: allProjects.filter((p) => p.created_at.startsWith(dateStr)).length,
        resources: allResources.filter((r) => r.created_at.startsWith(dateStr)).length,
      });
    }
    return days;
  }, [allOpportunities, allProjects, allResources]);

  // Category distribution for pie chart
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    allOpportunities.forEach((o) => {
      counts[o.category] = (counts[o.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [allOpportunities]);

  // Project status distribution
  const projectStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    allProjects.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [allProjects]);

  const activityIcon = (type: string) => {
    switch (type) {
      case "opportunity": return <Briefcase className="w-3.5 h-3.5 text-primary" />;
      case "project": return <FolderKanban className="w-3.5 h-3.5 text-accent-foreground" />;
      case "resource": return <BookOpen className="w-3.5 h-3.5 text-success" />;
      case "notification": return <Zap className="w-3.5 h-3.5 text-warning" />;
      default: return <Activity className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const activityColor = (type: string) => {
    switch (type) {
      case "opportunity": return "bg-primary/10 border-primary/20";
      case "project": return "bg-accent border-accent-foreground/20";
      case "resource": return "bg-success/10 border-success/20";
      case "notification": return "bg-warning/10 border-warning/20";
      default: return "bg-muted border-border";
    }
  };

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

  const myProjectCount = allProjects.filter((p) => p.user_id === user?.id).length;
  const myResourceCount = allResources.filter((r) => r.user_id === user?.id).length;

  return (
    <AppLayout>
      <SEO title="Dashboard" description="Your StudentHub dashboard — view activity, leaderboard, resources, projects, and opportunities at a glance." canonical="/dashboard" noindex />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 sm:p-8 md:p-10 animate-fade-in">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground/80" />
              <span className="text-xs sm:text-sm font-medium text-primary-foreground/80">Welcome back</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary-foreground tracking-tight mb-1.5">
              Hey, {displayName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-primary-foreground/70 max-w-md">
              Stay updated with campus activities, explore opportunities, and track your progress.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Link to="/opportunities">
                <Button variant="secondary" size="sm" className="gap-1.5 font-semibold shadow-sm text-xs sm:text-sm h-9 sm:h-10">
                  <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Explore Opportunities
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="secondary" size="sm" className="gap-1.5 font-semibold shadow-sm bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0 text-xs sm:text-sm h-9 sm:h-10">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Create Project
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-primary-foreground/5 -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 right-20 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-primary-foreground/5 translate-y-1/3" />
        </div>

        {/* Announcements */}
        <AnnouncementsBanner />

        {/* Event Reminders */}
        <EventReminders compact />

        {/* Daily Campus Feed + Your Points */}
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="sm:col-span-2 card-campus p-4 sm:p-5 flex items-start gap-4">
            <div className="text-3xl sm:text-4xl shrink-0">{dailyFeed.emoji}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold text-primary bg-primary/8 px-2 py-0.5 rounded-full uppercase tracking-wider">Daily {dailyFeed.category}</span>
                <span className="text-[10px] text-muted-foreground">• {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">{dailyFeed.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{dailyFeed.text}</p>
            </div>
          </div>
          <div className="card-campus p-4 sm:p-5 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-warning/10 flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">{myPoints}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Your Points</p>
            <p className="text-[9px] text-muted-foreground mt-1">+{getPoints.resource} per resource • +{getPoints.project} per project</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {[
            { label: "Opportunities", value: allOpportunities.length, icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
            { label: "Projects", value: allProjects.length, icon: FolderKanban, color: "text-accent-foreground", bg: "bg-accent" },
            { label: "Resources", value: allResources.length, icon: BookOpen, color: "text-success", bg: "bg-success/10" },
            { label: "My Contributions", value: myProjectCount + myResourceCount, icon: Award, color: "text-warning", bg: "bg-warning/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card p-3 sm:p-5">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${bg} flex items-center justify-center mb-2 sm:mb-3`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
              </div>
              <p className="text-lg sm:text-2xl font-extrabold text-foreground">{value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5 truncate">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {/* Weekly Activity Chart */}
          <div className="card-campus p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Weekly Activity
              </h3>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Last 7 days</span>
            </div>
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorOpps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(234, 89%, 64%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(234, 89%, 64%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResources" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(35, 80%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(35, 80%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px hsl(222, 47%, 11%, 0.1)",
                    }}
                  />
                  <Area type="monotone" dataKey="opportunities" stroke="hsl(234, 89%, 64%)" fillOpacity={1} fill="url(#colorOpps)" strokeWidth={2} />
                  <Area type="monotone" dataKey="projects" stroke="hsl(160, 60%, 45%)" fillOpacity={1} fill="url(#colorProjects)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resources" stroke="hsl(35, 80%, 55%)" fillOpacity={1} fill="url(#colorResources)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3">
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Opportunities
              </span>
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-success" /> Projects
              </span>
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-warning" /> Resources
              </span>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Opportunity Categories */}
            <div className="card-campus p-3 sm:p-5 flex flex-col items-center">
              <h3 className="text-[11px] sm:text-xs font-bold text-foreground mb-2 sm:mb-3 self-start flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" /> Categories
              </h3>
              {categoryData.length > 0 ? (
                <>
                  <div className="h-28 sm:h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius="40%"
                          outerRadius="75%"
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "hsl(0, 0%, 100%)",
                            border: "1px solid hsl(220, 13%, 91%)",
                            borderRadius: "10px",
                            fontSize: "11px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                    {categoryData.map((d, i) => (
                      <span key={d.name} className="flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        {d.name}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-center mt-8">No data yet</p>
              )}
            </div>

            {/* Project Status */}
            <div className="card-campus p-3 sm:p-5">
              <h3 className="text-[11px] sm:text-xs font-bold text-foreground mb-2 sm:mb-3 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-accent-foreground" /> Project Status
              </h3>
              {projectStatusData.length > 0 ? (
                <div className="h-28 sm:h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectStatusData} layout="vertical">
                      <XAxis type="number" hide allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }}
                        axisLine={false}
                        tickLine={false}
                        width={65}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(0, 0%, 100%)",
                          border: "1px solid hsl(220, 13%, 91%)",
                          borderRadius: "10px",
                          fontSize: "11px",
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                        {projectStatusData.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center mt-8">No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Main content + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {/* Left: Opportunities + Activity */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Latest Opportunities */}
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-sm sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Latest Opportunities
                </h2>
                <Link to="/opportunities" className="text-xs sm:text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Link>
              </div>
              {opportunities.length === 0 ? (
                <div className="card-campus p-8 sm:p-10 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">No opportunities yet</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-4">Be the first to post one!</p>
                  <Link to="/opportunities"><Button size="sm">Browse Opportunities</Button></Link>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {opportunities.map((opp) => (
                    <div key={opp.id} className="card-campus p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-card flex items-center justify-center shrink-0">
                        <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-xs sm:text-sm truncate">{opp.title}</h3>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{opp.organization} {opp.location && `• ${opp.location}`}</p>
                          </div>
                          <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:py-1 rounded-full shrink-0 ${categoryColors[opp.category] || "bg-muted text-muted-foreground"}`}>
                            {opp.category.toUpperCase()}
                          </span>
                        </div>
                        {opp.deadline && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(opp.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Feed */}
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-foreground flex items-center gap-2 mb-3 sm:mb-4">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Recent Activity
              </h2>
              <div className="card-campus overflow-hidden">
                {activityFeed.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No activity yet. Start exploring!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {activityFeed.map((item) => (
                      <div key={item.id + item.type} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${activityColor(item.type)}`}>
                          {activityIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-foreground truncate">{item.title}</p>
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeAgo(item.time)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Student Leaderboard */}
            <div className="card-campus p-4 sm:p-5">
              <h3 className="font-bold text-foreground flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                <Flame className="w-4 h-4 text-warning" /> Top Contributors
              </h3>
              {leaderboard.length === 0 ? (
                <div className="text-center py-6">
                  <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No contributors yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => {
                    const badge = rankBadge(i);
                    const isMe = entry.userId === user?.id;
                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl transition-colors ${
                          isMe ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shrink-0 text-xs font-bold ${badge.bg}`}>
                          {i < 3 ? badge.icon : <span className="text-muted-foreground">{badge.icon}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                            {isMe ? "You" : (entry.profile?.department || `Student`)}
                            {isMe && <span className="text-[10px] text-primary ml-1">⭐</span>}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {entry.resources}R • {entry.projects}P • {entry.opportunities}O
                          </p>
                        </div>
                        <span className="text-xs sm:text-sm font-extrabold text-foreground">{entry.total}</span>
                        <span className="text-[9px] text-muted-foreground">pts</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground">
                  <strong>Earn points:</strong> Upload resources (+10) • Create projects (+15) • Post opportunities (+8)
                </p>
              </div>
            </div>

            {/* GenSync Developer Team */}
            <div className="card-campus p-5 relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-background border-primary/20 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="font-extrabold text-foreground flex items-center gap-2 mb-1.5 text-xs sm:text-sm tracking-tight">
                <Code2 className="w-4 h-4 text-primary animate-pulse" /> Developed by GenSync
              </h3>
              <p className="text-[10px] text-muted-foreground mb-4">GenSync — Innovating for Campus Life</p>
              
              <div className="space-y-3">
                {[
                  { name: "Likhith.K", role: "Full-Stack Engineer", initial: "LK", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
                  { name: "Manogna.u", role: "UI/UX & Frontend Developer", initial: "MU", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
                  { name: "udaya lakshmi.Z", role: "Database & Backend Engineer", initial: "UL", color: "bg-teal-500/10 text-teal-500 border-teal-500/20" }
                ].map((dev) => (
                  <div key={dev.name} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-muted/40 transition-colors border border-transparent hover:border-border/30 group/item">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-extrabold text-xs shrink-0 group-hover/item:scale-105 transition-transform duration-300 ${dev.color}`}>
                      {dev.initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate group-hover/item:text-primary transition-colors">{dev.name}</p>
                      <p className="text-[10px] text-muted-foreground">{dev.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Resources */}
            <div className="card-campus p-4 sm:p-5">
              <h3 className="font-bold text-foreground flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                <FileText className="w-4 h-4 text-primary" /> Recent Resources
              </h3>
              {recentResources.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">No resources uploaded yet.</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentResources.map((res) => (
                    <div key={res.id} className="flex items-start gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg gradient-card flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">{res.file_name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{res.subject} • {new Date(res.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/resources">
                <Button variant="outline" className="w-full mt-3 sm:mt-4 gap-1.5 text-xs sm:text-sm" size="sm">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> View All Resources
                </Button>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="card-campus p-4 sm:p-5">
              <h3 className="font-bold text-foreground flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                <Zap className="w-4 h-4 text-warning" /> Quick Actions
              </h3>
              <div className="space-y-1">
                {[
                  { label: "Browse Opportunities", path: "/opportunities", icon: Rocket, color: "text-primary" },
                  { label: "Explore Projects", path: "/projects", icon: FolderKanban, color: "text-accent-foreground" },
                  { label: "Study Resources", path: "/resources", icon: BookOpen, color: "text-success" },
                  { label: "Your Profile", path: "/profile", icon: Users, color: "text-warning" },
                ].map(({ label, path, icon: Icon, color }) => (
                  <Link
                    key={path}
                    to={path}
                    className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-muted-foreground hover:text-foreground p-2 sm:p-2.5 rounded-xl hover:bg-muted/50 transition-all font-medium group"
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color}`} />
                    </div>
                    {label}
                    <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Announcements */}
            {notifications.length > 0 && (
              <div className="card-campus p-4 sm:p-5">
                <h3 className="font-bold text-foreground flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-primary" /> Announcements
                </h3>
                <div className="space-y-3">
                  {notifications.map((n: any) => (
                    <div key={n.id} className="p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-border/40">
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{n.title}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1.5">{timeAgo(n.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <OnboardingDialog />
    </AppLayout>
  );
};

export default Dashboard;
