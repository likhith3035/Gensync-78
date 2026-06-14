import SEO from "@/components/SEO";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Shield, Users, Briefcase, FolderKanban, BookOpen, Trash2,
  TrendingUp, AlertTriangle, BarChart3, Pencil, Plus, Bell,
  Send, X, Check, Calendar, MapPin, Building2, Tag, HardDrive, FileText, Download,
  Lightbulb, Trophy, Sparkles, Megaphone, Pin
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const tabs = [
  { label: "Overview", icon: BarChart3 },
  { label: "Opportunities", icon: Briefcase },
  { label: "Projects", icon: FolderKanban },
  { label: "Resources", icon: BookOpen },
  { label: "Users", icon: Users },
  { label: "Notifications", icon: Bell },
  { label: "Storage", icon: HardDrive },
  { label: "Daily Tips", icon: Lightbulb },
  { label: "Points", icon: Trophy },
  { label: "Announcements", icon: Megaphone },
];

const categoryColors: Record<string, string> = {
  internship: "bg-primary/10 text-primary",
  hackathon: "bg-accent text-accent-foreground",
  workshop: "bg-warning/10 text-warning",
  scholarship: "bg-success/10 text-success",
};

const statusColors: Record<string, string> = {
  recruiting: "bg-primary/10 text-primary",
  planning: "bg-accent text-accent-foreground",
  active: "bg-success/10 text-success",
  archived: "bg-muted text-muted-foreground",
  urgent: "bg-destructive/10 text-destructive",
};

const resourceCategoryColors: Record<string, string> = {
  notes: "bg-primary/10 text-primary",
  past_paper: "bg-success/10 text-success",
  tutorial: "bg-warning/10 text-warning",
};

const notifTypeColors: Record<string, string> = {
  info: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
  urgent: "bg-destructive/10 text-destructive",
};

const inputClass = "w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";
const textareaClass = "w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none";

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);

  // Edit states
  const [editOpp, setEditOpp] = useState<any>(null);
  const [editProj, setEditProj] = useState<any>(null);
  const [editRes, setEditRes] = useState<any>(null);
  const [editNotif, setEditNotif] = useState<any>(null);
  const [newNotif, setNewNotif] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "info" });
  const [newTip, setNewTip] = useState(false);
  const [tipForm, setTipForm] = useState({ emoji: "💡", title: "", text: "", category: "tip" });
  const [editTip, setEditTip] = useState<any>(null);
  const [editRule, setEditRule] = useState<any>(null);
  const [newAnnouncement, setNewAnnouncement] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "", category: "general", is_pinned: false });
  const [editAnnouncement, setEditAnnouncement] = useState<any>(null);

  // Data queries
  const { data: opportunities = [] } = useQuery({
    queryKey: ["admin-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("opportunities").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*, project_members(user_id)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: dailyTips = [] } = useQuery({
    queryKey: ["admin-daily-tips"],
    queryFn: async () => {
      const { data, error } = await supabase.from("daily_tips").select("*").order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: pointRules = [] } = useQuery({
    queryKey: ["admin-point-rules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("point_rules").select("*").order("action_type");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: announcements_list = [] } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("list-users");
      if (error) throw error;
      return data.users || [];
    },
    enabled: isAdmin,
  });

  // Mutations
  const deleteOpportunity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("opportunities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-opportunities"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateOpportunity = useMutation({
    mutationFn: async (opp: any) => {
      const { error } = await supabase.from("opportunities").update({
        title: opp.title, organization: opp.organization, location: opp.location || null,
        deadline: opp.deadline || null, category: opp.category, description: opp.description || null,
      }).eq("id", opp.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-opportunities"] }); toast.success("Updated"); setEditOpp(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-projects"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateProject = useMutation({
    mutationFn: async (proj: any) => {
      const { error } = await supabase.from("projects").update({
        title: proj.title, description: proj.description || null,
        tags: proj.tagsStr ? proj.tagsStr.split(",").map((t: string) => t.trim()) : proj.tags || [],
        status: proj.status,
      }).eq("id", proj.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-projects"] }); toast.success("Updated"); setEditProj(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteResource = useMutation({
    mutationFn: async (res: any) => {
      // Delete from storage bucket first
      if (res.file_path) {
        await supabase.storage.from("resources").remove([res.file_path]);
      }
      const { error } = await supabase.from("resources").delete().eq("id", res.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-resources"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateResource = useMutation({
    mutationFn: async (res: any) => {
      const { error } = await supabase.from("resources").update({
        title: res.title, subject: res.subject, course_code: res.course_code || null, category: res.category,
      }).eq("id", res.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-resources"] }); toast.success("Updated"); setEditRes(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const createNotification = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notifications").insert({
        title: notifForm.title, message: notifForm.message, type: notifForm.type, created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("Notification sent!");
      setNewNotif(false);
      setNotifForm({ title: "", message: "", type: "info" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateNotification = useMutation({
    mutationFn: async (n: any) => {
      const { error } = await supabase.from("notifications").update({
        title: n.title, message: n.message, type: n.type,
      }).eq("id", n.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }); toast.success("Updated"); setEditNotif(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  // Daily Tips mutations
  const createTip = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("daily_tips").insert({
        emoji: tipForm.emoji, title: tipForm.title, text: tipForm.text,
        category: tipForm.category, created_by: user!.id,
        display_order: dailyTips.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-daily-tips"] });
      toast.success("Tip added!");
      setNewTip(false);
      setTipForm({ emoji: "💡", title: "", text: "", category: "tip" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateTip = useMutation({
    mutationFn: async (tip: any) => {
      const { error } = await supabase.from("daily_tips").update({
        emoji: tip.emoji, title: tip.title, text: tip.text,
        category: tip.category, is_active: tip.is_active,
      }).eq("id", tip.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-daily-tips"] }); toast.success("Updated"); setEditTip(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteTip = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("daily_tips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-daily-tips"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  // Point Rules mutations
  const updatePointRule = useMutation({
    mutationFn: async (rule: any) => {
      const { error } = await supabase.from("point_rules").update({
        points: rule.points, label: rule.label, description: rule.description,
        is_active: rule.is_active, updated_by: user!.id,
      }).eq("id", rule.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-point-rules"] }); toast.success("Rule updated"); setEditRule(null); },
    onError: (e: any) => toast.error(e.message),
  });

  // Announcement mutations
  const createAnnouncement = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("announcements").insert({
        title: announcementForm.title, content: announcementForm.content,
        category: announcementForm.category, is_pinned: announcementForm.is_pinned,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement posted!");
      setNewAnnouncement(false);
      setAnnouncementForm({ title: "", content: "", category: "general", is_pinned: false });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateAnnouncement = useMutation({
    mutationFn: async (a: any) => {
      const { error } = await supabase.from("announcements").update({
        title: a.title, content: a.content, category: a.category, is_pinned: a.is_pinned,
      }).eq("id", a.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-announcements"] }); toast.success("Updated"); setEditAnnouncement(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-announcements"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  if (adminLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-32">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const totalStorageBytes = resources.reduce((sum: number, r: any) => sum + (r.file_size || 0), 0);
  const formatSizeShort = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const stats = [
    { label: "Opportunities", value: opportunities.length, icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
    { label: "Projects", value: projects.length, icon: FolderKanban, color: "text-accent-foreground", bg: "bg-accent" },
    { label: "Resources", value: resources.length, icon: BookOpen, color: "text-success", bg: "bg-success/10" },
    { label: "Users", value: users.length, icon: Users, color: "text-warning", bg: "bg-warning/10" },
    { label: "Storage", value: formatSizeShort(totalStorageBytes), icon: HardDrive, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <AppLayout>
      <SEO title="Admin Panel" noindex />
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 overflow-hidden">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Manage all platform content, users, and notifications</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card p-3 sm:p-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${bg} flex items-center justify-center mb-2 sm:mb-3`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
              </div>
              <p className="text-lg sm:text-2xl font-extrabold text-foreground">{value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5 truncate">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl overflow-x-auto no-scrollbar animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-lg text-[11px] sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                activeTab === i ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>

          {/* ===== OVERVIEW ===== */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <div className="card-campus p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Platform Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Recent Opportunities</p>
                    {opportunities.slice(0, 4).map((opp) => (
                      <div key={opp.id} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[opp.category] || "bg-muted text-muted-foreground"}`}>{opp.category.toUpperCase()}</span>
                        <p className="text-sm text-foreground truncate flex-1">{opp.title}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Recent Projects</p>
                    {projects.slice(0, 4).map((proj) => (
                      <div key={proj.id} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[proj.status] || "bg-muted text-muted-foreground"}`}>{proj.status.toUpperCase()}</span>
                        <p className="text-sm text-foreground truncate flex-1">{proj.title}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Recent Notifications</p>
                    {notifications.slice(0, 4).map((n) => (
                      <div key={n.id} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${notifTypeColors[n.type] || notifTypeColors.info}`}>{n.type.toUpperCase()}</span>
                        <p className="text-sm text-foreground truncate flex-1">{n.title}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && <p className="text-sm text-muted-foreground">No notifications sent yet.</p>}
                  </div>
                </div>
              </div>

              <div className="card-campus p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" /> Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { tab: 1, icon: Briefcase, color: "text-primary", label: "Manage Opportunities", count: opportunities.length },
                    { tab: 2, icon: FolderKanban, color: "text-accent-foreground", label: "Manage Projects", count: projects.length },
                    { tab: 5, icon: Bell, color: "text-destructive", label: "Send Notification", count: notifications.length },
                  ].map(({ tab, icon: Icon, color, label, count }) => (
                    <button key={label} onClick={() => setActiveTab(tab)} className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left">
                      <Icon className={`w-5 h-5 ${color} mb-2`} />
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{count} total</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== OPPORTUNITIES ===== */}
          {activeTab === 1 && (
            <div className="card-campus overflow-hidden">
              <div className="p-3 sm:p-5 border-b border-border/40">
                <h3 className="font-bold text-foreground text-sm sm:text-base">All Opportunities ({opportunities.length})</h3>
              </div>
              <div className="divide-y divide-border/40">
                {opportunities.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center text-muted-foreground text-sm">No opportunities yet.</div>
                ) : opportunities.map((opp) => (
                  <div key={opp.id} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                        <h4 className="font-semibold text-foreground text-xs sm:text-sm truncate">{opp.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${categoryColors[opp.category] || "bg-muted text-muted-foreground"}`}>{opp.category.toUpperCase()}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{opp.organization} {opp.location && `• ${opp.location}`} • {new Date(opp.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2 shrink-0 self-end sm:self-center">
                      <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold" onClick={() => setEditOpp({ ...opp })}>
                        <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/5 h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold"
                        onClick={() => { if (confirm("Delete this opportunity?")) deleteOpportunity.mutate(opp.id); }}>
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== PROJECTS ===== */}
          {activeTab === 2 && (
            <div className="card-campus overflow-hidden">
              <div className="p-3 sm:p-5 border-b border-border/40">
                <h3 className="font-bold text-foreground text-sm sm:text-base">All Projects ({projects.length})</h3>
              </div>
              <div className="divide-y divide-border/40">
                {projects.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center text-muted-foreground text-sm">No projects yet.</div>
                ) : projects.map((proj) => (
                  <div key={proj.id} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                        <h4 className="font-semibold text-foreground text-xs sm:text-sm truncate">{proj.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColors[proj.status] || "bg-muted text-muted-foreground"}`}>{proj.status.toUpperCase()}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{proj.project_members?.length || 0} members • {new Date(proj.created_at).toLocaleDateString()}{proj.tags?.length ? ` • ${proj.tags.join(", ")}` : ""}</p>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2 shrink-0 self-end sm:self-center">
                      <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold" onClick={() => setEditProj({ ...proj, tagsStr: proj.tags?.join(", ") || "" })}>
                        <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/5 h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold"
                        onClick={() => { if (confirm("Delete this project?")) deleteProject.mutate(proj.id); }}>
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== RESOURCES ===== */}
          {activeTab === 3 && (
            <div className="card-campus overflow-hidden">
              <div className="p-3 sm:p-5 border-b border-border/40">
                <h3 className="font-bold text-foreground text-sm sm:text-base">All Resources ({resources.length})</h3>
              </div>
              <div className="divide-y divide-border/40">
                {resources.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center text-muted-foreground text-sm">No resources yet.</div>
                ) : resources.map((res) => (
                  <div key={res.id} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                        <h4 className="font-semibold text-foreground text-xs sm:text-sm truncate">{res.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${resourceCategoryColors[res.category] || "bg-muted text-muted-foreground"}`}>{res.category.replace("_", " ").toUpperCase()}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{res.subject} {res.course_code && `| ${res.course_code}`} • {res.file_name} • {new Date(res.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2 shrink-0 self-end sm:self-center">
                      <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold" onClick={() => setEditRes({ ...res })}>
                        <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/5 h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold"
                        onClick={() => { if (confirm("Delete this resource and its file?")) deleteResource.mutate(res); }}>
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== USERS ===== */}
          {activeTab === 4 && (
            <div className="card-campus overflow-hidden">
              <div className="p-5 border-b border-border/40">
                <h3 className="font-bold text-foreground">Registered Users ({users.length})</h3>
              </div>
              {usersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {users.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">No users found.</div>
                  ) : users.map((u: any) => (
                    <div key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                        {(u.full_name || u.email || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm truncate">{u.full_name || "No name"}</h4>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.email_confirmed_at ? (
                            <span className="text-success font-medium flex items-center gap-1 justify-end"><Check className="w-3 h-3" /> Verified</span>
                          ) : (
                            <span className="text-warning font-medium">Unverified</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== NOTIFICATIONS ===== */}
          {activeTab === 5 && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button className="gap-1.5 font-semibold shadow-md" onClick={() => { setNewNotif(true); setNotifForm({ title: "", message: "", type: "info" }); }}>
                  <Send className="w-4 h-4" /> Send Notification
                </Button>
              </div>

              <div className="card-campus overflow-hidden">
                <div className="p-5 border-b border-border/40">
                  <h3 className="font-bold text-foreground">All Notifications ({notifications.length})</h3>
                </div>
                <div className="divide-y divide-border/40">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">No notifications sent yet.</div>
                  ) : notifications.map((n: any) => (
                    <div key={n.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notifTypeColors[n.type] || notifTypeColors.info}`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground text-sm truncate">{n.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${notifTypeColors[n.type] || notifTypeColors.info}`}>{n.type.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2 shrink-0 self-end sm:self-center">
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-semibold"
                          onClick={() => { setEditNotif({ ...n }); }}>
                          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/5 h-8 px-3 text-xs font-semibold"
                          onClick={() => { if (confirm("Delete this notification?")) deleteNotification.mutate(n.id); }}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== STORAGE ===== */}
          {activeTab === 6 && (() => {
            const formatSize = (bytes: number) => {
              if (bytes < 1024) return bytes + " B";
              if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
              if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
              return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
            };

            const totalStorage = resources.reduce((sum: number, r: any) => sum + (r.file_size || 0), 0);
            const totalFiles = resources.length;

            const userMap: Record<string, { files: any[]; totalSize: number }> = {};
            resources.forEach((r: any) => {
              if (!userMap[r.user_id]) userMap[r.user_id] = { files: [], totalSize: 0 };
              userMap[r.user_id].files.push(r);
              userMap[r.user_id].totalSize += r.file_size || 0;
            });

            const getUserEmail = (uid: string) => {
              const u = users.find((u: any) => u.id === uid);
              return u ? (u.full_name || u.email) : uid.slice(0, 8) + "...";
            };

            const sortedUsers = Object.entries(userMap).sort((a, b) => b[1].totalSize - a[1].totalSize);

            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="stat-card">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <HardDrive className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-extrabold text-foreground">{formatSize(totalStorage)}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Total Storage Used</p>
                  </div>
                  <div className="stat-card">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
                      <FileText className="w-5 h-5 text-success" />
                    </div>
                    <p className="text-2xl font-extrabold text-foreground">{totalFiles}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Total Files</p>
                  </div>
                  <div className="stat-card">
                    <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mb-3">
                      <Users className="w-5 h-5 text-warning" />
                    </div>
                    <p className="text-2xl font-extrabold text-foreground">{sortedUsers.length}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Users with Files</p>
                  </div>
                </div>

                <div className="card-campus overflow-hidden">
                  <div className="p-5 border-b border-border/40">
                    <h3 className="font-bold text-foreground">Storage by User</h3>
                  </div>
                  <div className="divide-y divide-border/40">
                    {sortedUsers.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm">No files uploaded yet.</div>
                    ) : sortedUsers.map(([uid, data]) => (
                      <div key={uid} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                              {getUserEmail(uid).slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{getUserEmail(uid)}</p>
                              <p className="text-xs text-muted-foreground">{data.files.length} file{data.files.length !== 1 ? "s" : ""} • {formatSize(data.totalSize)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${totalStorage > 0 ? Math.min(100, (data.totalSize / totalStorage) * 100) : 0}%` }} />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">{totalStorage > 0 ? ((data.totalSize / totalStorage) * 100).toFixed(1) : 0}%</p>
                          </div>
                        </div>
                        <div className="space-y-1 ml-12">
                          {data.files.map((f: any) => (
                            <div key={f.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors group">
                              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{f.file_name}</p>
                                <p className="text-[10px] text-muted-foreground">{f.title} • {f.subject} • {formatSize(f.file_size || 0)} • {new Date(f.created_at).toLocaleDateString()}</p>
                              </div>
                              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]"
                                  onClick={() => {
                                    const { data: urlData } = supabase.storage.from("resources").getPublicUrl(f.file_path);
                                    window.open(urlData.publicUrl, "_blank");
                                  }}>
                                  <Download className="w-3 h-3 mr-1" /> View
                                </Button>
                                <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/5 h-7 px-2 text-[10px]"
                                  onClick={() => { if (confirm(`Delete "${f.file_name}"?`)) deleteResource.mutate(f); }}>
                                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ===== DAILY TIPS ===== */}
          {activeTab === 7 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-warning" /> Daily Tips ({dailyTips.length})
                </h3>
                <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={() => setNewTip(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add Tip
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Tips rotate daily on the student dashboard. Active tips cycle based on the day of the year.</p>
              <div className="card-campus overflow-hidden">
                {dailyTips.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No tips yet. Add your first daily tip!
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {dailyTips.map((tip: any) => (
                      <div key={tip.id} className={`flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors ${!tip.is_active ? "opacity-50" : ""}`}>
                        <span className="text-2xl shrink-0">{tip.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-semibold text-foreground text-sm truncate">{tip.title}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tip.category.toUpperCase()}</span>
                            {!tip.is_active && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">INACTIVE</span>}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{tip.text}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setEditTip({ ...tip })} className="w-8 h-8 rounded-lg bg-muted/60 hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button onClick={() => deleteTip.mutate(tip.id)} className="w-8 h-8 rounded-lg bg-muted/60 hover:bg-destructive/10 flex items-center justify-center transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== POINT RULES ===== */}
          {activeTab === 8 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" /> Leaderboard Point Rules
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Configure how many points students earn for each action. Changes apply immediately to the leaderboard.</p>
              </div>
              <div className="card-campus overflow-hidden">
                <div className="divide-y divide-border/40">
                  {pointRules.map((rule: any) => (
                    <div key={rule.id} className={`flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors ${!rule.is_active ? "opacity-50" : ""}`}>
                      <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                        <span className="text-lg font-extrabold text-warning">{rule.points}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm">{rule.label}</h4>
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Action: <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{rule.action_type}</code></p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!rule.is_active && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">OFF</span>}
                        <button onClick={() => setEditRule({ ...rule })} className="w-8 h-8 rounded-lg bg-muted/60 hover:bg-primary/10 flex items-center justify-center transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {pointRules.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">No point rules configured.</div>
                  )}
                </div>
              </div>
              <div className="card-campus p-4">
                <h4 className="text-xs font-bold text-foreground mb-2">How it works</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Points are calculated automatically from student activity</li>
                  <li>• The leaderboard shows top 5 contributors on the dashboard</li>
                  <li>• Changing point values here updates the leaderboard instantly</li>
                  <li>• Disable a rule to stop counting that action type</li>
                </ul>
              </div>
            </div>
          )}

          {/* ===== ANNOUNCEMENTS ===== */}
          {activeTab === 9 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm sm:text-base">Announcements ({announcements_list.length})</h3>
                <Button size="sm" className="gap-1.5 font-semibold" onClick={() => setNewAnnouncement(true)}>
                  <Plus className="w-4 h-4" /> New Announcement
                </Button>
              </div>
              <div className="card-campus overflow-hidden">
                {announcements_list.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No announcements yet. Create one to inform students!</div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {announcements_list.map((a: any) => (
                      <div key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {a.is_pinned && <Pin className="w-3 h-3 text-warning" />}
                            <h4 className="font-semibold text-foreground text-xs sm:text-sm truncate">{a.title}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              a.category === "urgent" ? "bg-destructive/10 text-destructive" :
                              a.category === "academic" ? "bg-success/10 text-success" :
                              a.category === "event" ? "bg-warning/10 text-warning" :
                              "bg-primary/10 text-primary"
                            }`}>{a.category.toUpperCase()}</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{a.content.slice(0, 100)}</p>
                          <p className="text-[9px] text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0 self-end sm:self-center">
                          <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] font-semibold" onClick={() => setEditAnnouncement({ ...a })}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/5 h-7 px-2 text-[10px] font-semibold"
                            onClick={() => { if (confirm("Delete this announcement?")) deleteAnnouncement.mutate(a.id); }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== NEW TIP DIALOG ===== */}
      <Dialog open={newTip} onOpenChange={setNewTip}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold">Add Daily Tip</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createTip.mutate(); }} className="space-y-4 mt-2">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Emoji</label>
                <input value={tipForm.emoji} onChange={(e) => setTipForm({ ...tipForm, emoji: e.target.value })} className={inputClass} maxLength={4} />
              </div>
              <div className="col-span-3">
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Title *</label>
                <input placeholder="e.g. Study Tip" value={tipForm.title} onChange={(e) => setTipForm({ ...tipForm, title: e.target.value })} required className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tip Text *</label>
              <textarea placeholder="The tip content shown to students..." value={tipForm.text} onChange={(e) => setTipForm({ ...tipForm, text: e.target.value })} required rows={3} className={textareaClass} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Category</label>
              <select value={tipForm.category} onChange={(e) => setTipForm({ ...tipForm, category: e.target.value })} className={inputClass}>
                <option value="tip">💡 Study Tip</option>
                <option value="career">🚀 Career</option>
                <option value="motivation">💪 Motivation</option>
                <option value="fact">🔥 Fun Fact</option>
                <option value="reminder">⏰ Reminder</option>
              </select>
            </div>
            <Button type="submit" className="w-full h-11 font-semibold gap-1.5" disabled={createTip.isPending}>
              <Plus className="w-4 h-4" /> {createTip.isPending ? "Adding..." : "Add Tip"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT TIP DIALOG ===== */}
      <Dialog open={!!editTip} onOpenChange={(open) => !open && setEditTip(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold">Edit Tip</DialogTitle></DialogHeader>
          {editTip && (
            <form onSubmit={(e) => { e.preventDefault(); updateTip.mutate(editTip); }} className="space-y-4 mt-2">
              <div className="grid grid-cols-4 gap-3">
                <input value={editTip.emoji} onChange={(e) => setEditTip({ ...editTip, emoji: e.target.value })} className={inputClass} maxLength={4} />
                <div className="col-span-3">
                  <input placeholder="Title *" value={editTip.title} onChange={(e) => setEditTip({ ...editTip, title: e.target.value })} required className={inputClass} />
                </div>
              </div>
              <textarea placeholder="Tip text *" value={editTip.text} onChange={(e) => setEditTip({ ...editTip, text: e.target.value })} required rows={3} className={textareaClass} />
              <select value={editTip.category} onChange={(e) => setEditTip({ ...editTip, category: e.target.value })} className={inputClass}>
                <option value="tip">💡 Study Tip</option>
                <option value="career">🚀 Career</option>
                <option value="motivation">💪 Motivation</option>
                <option value="fact">🔥 Fun Fact</option>
                <option value="reminder">⏰ Reminder</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editTip.is_active} onChange={(e) => setEditTip({ ...editTip, is_active: e.target.checked })} className="rounded" />
                <span className="font-medium text-foreground">Active</span>
              </label>
              <Button type="submit" className="w-full h-11 font-semibold" disabled={updateTip.isPending}>
                {updateTip.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== EDIT POINT RULE DIALOG ===== */}
      <Dialog open={!!editRule} onOpenChange={(open) => !open && setEditRule(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold">Edit Point Rule</DialogTitle></DialogHeader>
          {editRule && (
            <form onSubmit={(e) => { e.preventDefault(); updatePointRule.mutate(editRule); }} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Label</label>
                <input value={editRule.label} onChange={(e) => setEditRule({ ...editRule, label: e.target.value })} required className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Points per Action</label>
                <input type="number" min="0" max="100" value={editRule.points} onChange={(e) => setEditRule({ ...editRule, points: parseInt(e.target.value) || 0 })} required className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
                <textarea value={editRule.description || ""} onChange={(e) => setEditRule({ ...editRule, description: e.target.value })} rows={2} className={textareaClass} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editRule.is_active} onChange={(e) => setEditRule({ ...editRule, is_active: e.target.checked })} className="rounded" />
                <span className="font-medium text-foreground">Active</span>
              </label>
              <Button type="submit" className="w-full h-11 font-semibold" disabled={updatePointRule.isPending}>
                {updatePointRule.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== EDIT OPPORTUNITY DIALOG ===== */}
      <Dialog open={!!editOpp} onOpenChange={(open) => !open && setEditOpp(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold">Edit Opportunity</DialogTitle></DialogHeader>
          {editOpp && (
            <form onSubmit={(e) => { e.preventDefault(); updateOpportunity.mutate(editOpp); }} className="space-y-4 mt-2">
              <input placeholder="Title *" value={editOpp.title} onChange={(e) => setEditOpp({ ...editOpp, title: e.target.value })} required className={inputClass} />
              <input placeholder="Organization *" value={editOpp.organization} onChange={(e) => setEditOpp({ ...editOpp, organization: e.target.value })} required className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Location" value={editOpp.location || ""} onChange={(e) => setEditOpp({ ...editOpp, location: e.target.value })} className={inputClass} />
                <input type="date" value={editOpp.deadline || ""} onChange={(e) => setEditOpp({ ...editOpp, deadline: e.target.value })} className={inputClass} />
              </div>
              <select value={editOpp.category} onChange={(e) => setEditOpp({ ...editOpp, category: e.target.value })} className={inputClass}>
                <option value="internship">Internship</option>
                <option value="hackathon">Hackathon</option>
                <option value="workshop">Workshop</option>
                <option value="scholarship">Scholarship</option>
              </select>
              <textarea placeholder="Description" value={editOpp.description || ""} onChange={(e) => setEditOpp({ ...editOpp, description: e.target.value })} rows={3} className={textareaClass} />
              <Button type="submit" className="w-full h-11 font-semibold" disabled={updateOpportunity.isPending}>
                {updateOpportunity.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== EDIT PROJECT DIALOG ===== */}
      <Dialog open={!!editProj} onOpenChange={(open) => !open && setEditProj(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold">Edit Project</DialogTitle></DialogHeader>
          {editProj && (
            <form onSubmit={(e) => { e.preventDefault(); updateProject.mutate(editProj); }} className="space-y-4 mt-2">
              <input placeholder="Title *" value={editProj.title} onChange={(e) => setEditProj({ ...editProj, title: e.target.value })} required className={inputClass} />
              <textarea placeholder="Description" value={editProj.description || ""} onChange={(e) => setEditProj({ ...editProj, description: e.target.value })} rows={3} className={textareaClass} />
              <input placeholder="Tags (comma-separated)" value={editProj.tagsStr} onChange={(e) => setEditProj({ ...editProj, tagsStr: e.target.value })} className={inputClass} />
              <select value={editProj.status} onChange={(e) => setEditProj({ ...editProj, status: e.target.value })} className={inputClass}>
                <option value="recruiting">Recruiting</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="urgent">Urgent</option>
                <option value="archived">Archived</option>
              </select>
              <Button type="submit" className="w-full h-11 font-semibold" disabled={updateProject.isPending}>
                {updateProject.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== EDIT RESOURCE DIALOG ===== */}
      <Dialog open={!!editRes} onOpenChange={(open) => !open && setEditRes(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold">Edit Resource</DialogTitle></DialogHeader>
          {editRes && (
            <form onSubmit={(e) => { e.preventDefault(); updateResource.mutate(editRes); }} className="space-y-4 mt-2">
              <input placeholder="Title *" value={editRes.title} onChange={(e) => setEditRes({ ...editRes, title: e.target.value })} required className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Subject *" value={editRes.subject} onChange={(e) => setEditRes({ ...editRes, subject: e.target.value })} required className={inputClass} />
                <input placeholder="Course code" value={editRes.course_code || ""} onChange={(e) => setEditRes({ ...editRes, course_code: e.target.value })} className={inputClass} />
              </div>
              <select value={editRes.category} onChange={(e) => setEditRes({ ...editRes, category: e.target.value })} className={inputClass}>
                <option value="notes">Notes</option>
                <option value="past_paper">Past Paper</option>
                <option value="tutorial">Tutorial</option>
              </select>
              <Button type="submit" className="w-full h-11 font-semibold" disabled={updateResource.isPending}>
                {updateResource.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== NEW NOTIFICATION DIALOG ===== */}
      <Dialog open={newNotif} onOpenChange={setNewNotif}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold">Send Notification</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createNotification.mutate(); }} className="space-y-4 mt-2">
            <input placeholder="Title *" value={notifForm.title} onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })} required className={inputClass} />
            <textarea placeholder="Message *" value={notifForm.message} onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })} required rows={4} className={textareaClass} />
            <select value={notifForm.type} onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })} className={inputClass}>
              <option value="info">ℹ️ Info</option>
              <option value="success">✅ Success</option>
              <option value="warning">⚠️ Warning</option>
              <option value="urgent">🚨 Urgent</option>
            </select>
            <Button type="submit" className="w-full h-11 font-semibold gap-1.5" disabled={createNotification.isPending}>
              <Send className="w-4 h-4" />
              {createNotification.isPending ? "Sending..." : "Send to All Users"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT NOTIFICATION DIALOG ===== */}
      <Dialog open={!!editNotif} onOpenChange={(open) => !open && setEditNotif(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold">Edit Notification</DialogTitle></DialogHeader>
          {editNotif && (
            <form onSubmit={(e) => { e.preventDefault(); updateNotification.mutate(editNotif); }} className="space-y-4 mt-2">
              <input placeholder="Title *" value={editNotif.title} onChange={(e) => setEditNotif({ ...editNotif, title: e.target.value })} required className={inputClass} />
              <textarea placeholder="Message *" value={editNotif.message} onChange={(e) => setEditNotif({ ...editNotif, message: e.target.value })} required rows={4} className={textareaClass} />
              <select value={editNotif.type} onChange={(e) => setEditNotif({ ...editNotif, type: e.target.value })} className={inputClass}>
                <option value="info">ℹ️ Info</option>
                <option value="success">✅ Success</option>
                <option value="warning">⚠️ Warning</option>
                <option value="urgent">🚨 Urgent</option>
              </select>
              <Button type="submit" className="w-full h-11 font-semibold" disabled={updateNotification.isPending}>
                {updateNotification.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== NEW ANNOUNCEMENT DIALOG ===== */}
      <Dialog open={newAnnouncement} onOpenChange={setNewAnnouncement}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold">New Announcement</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createAnnouncement.mutate(); }} className="space-y-4 mt-2">
            <input placeholder="Title *" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} required className={inputClass} />
            <textarea placeholder="Content *" value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} required rows={4} className={textareaClass} />
            <select value={announcementForm.category} onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })} className={inputClass}>
              <option value="general">📢 General</option>
              <option value="urgent">🚨 Urgent</option>
              <option value="academic">📚 Academic</option>
              <option value="event">🎉 Event</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={announcementForm.is_pinned} onChange={(e) => setAnnouncementForm({ ...announcementForm, is_pinned: e.target.checked })} className="rounded" />
              <span className="font-medium text-foreground">Pin to top</span>
            </label>
            <Button type="submit" className="w-full h-11 font-semibold gap-1.5" disabled={createAnnouncement.isPending}>
              <Megaphone className="w-4 h-4" /> {createAnnouncement.isPending ? "Posting..." : "Post Announcement"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT ANNOUNCEMENT DIALOG ===== */}
      <Dialog open={!!editAnnouncement} onOpenChange={(open) => !open && setEditAnnouncement(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold">Edit Announcement</DialogTitle></DialogHeader>
          {editAnnouncement && (
            <form onSubmit={(e) => { e.preventDefault(); updateAnnouncement.mutate(editAnnouncement); }} className="space-y-4 mt-2">
              <input placeholder="Title *" value={editAnnouncement.title} onChange={(e) => setEditAnnouncement({ ...editAnnouncement, title: e.target.value })} required className={inputClass} />
              <textarea placeholder="Content *" value={editAnnouncement.content} onChange={(e) => setEditAnnouncement({ ...editAnnouncement, content: e.target.value })} required rows={4} className={textareaClass} />
              <select value={editAnnouncement.category} onChange={(e) => setEditAnnouncement({ ...editAnnouncement, category: e.target.value })} className={inputClass}>
                <option value="general">📢 General</option>
                <option value="urgent">🚨 Urgent</option>
                <option value="academic">📚 Academic</option>
                <option value="event">🎉 Event</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editAnnouncement.is_pinned} onChange={(e) => setEditAnnouncement({ ...editAnnouncement, is_pinned: e.target.checked })} className="rounded" />
                <span className="font-medium text-foreground">Pin to top</span>
              </label>
              <Button type="submit" className="w-full h-11 font-semibold" disabled={updateAnnouncement.isPending}>
                {updateAnnouncement.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Admin;
