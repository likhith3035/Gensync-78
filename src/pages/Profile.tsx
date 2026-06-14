import SEO from "@/components/SEO";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail, BookOpen, Users, LogOut, Briefcase, Calendar, TrendingUp,
  Camera, Pencil, X, Plus, Github, Linkedin, Globe, Twitter,
  GraduationCap, Sparkles, Save, ExternalLink, Code2,
  Trophy, Award, Star, Flame, Upload, FolderKanban, Share2,
  Target, Zap, Heart, MessageCircle, Clock, Lock, Eye, EyeOff
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Achievement definitions
const ACHIEVEMENTS = [
  { id: "first_resource", emoji: "📤", title: "First Upload", desc: "Upload your first resource", check: (s: any) => s.resources >= 1 },
  { id: "five_resources", emoji: "📚", title: "Resource Pro", desc: "Upload 5 resources", check: (s: any) => s.resources >= 5 },
  { id: "ten_resources", emoji: "🏆", title: "Knowledge Master", desc: "Upload 10 resources", check: (s: any) => s.resources >= 10 },
  { id: "first_project", emoji: "🚀", title: "Project Starter", desc: "Create your first project", check: (s: any) => s.projects >= 1 },
  { id: "five_projects", emoji: "⚡", title: "Builder", desc: "Create 5 projects", check: (s: any) => s.projects >= 5 },
  { id: "first_opportunity", emoji: "💼", title: "Opportunity Sharer", desc: "Post your first opportunity", check: (s: any) => s.opportunities >= 1 },
  { id: "all_rounder", emoji: "🌟", title: "All-Rounder", desc: "Contribute to all categories", check: (s: any) => s.resources >= 1 && s.projects >= 1 && s.opportunities >= 1 },
  { id: "top_contributor", emoji: "👑", title: "Top Contributor", desc: "Earn 100+ total points", check: (s: any) => s.totalPoints >= 100 },
];

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const [editMode, setEditMode] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [editForm, setEditForm] = useState<any>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "achievements" | "activity" | "settings">("overview");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({ user_id: user!.id })
          .select()
          .single();
        if (insertError) throw insertError;
        return newProfile;
      }
      return data;
    },
    enabled: !!user,
  });

  const { data: myProjects = [] } = useQuery({
    queryKey: ["my-projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: myResources = [] } = useQuery({
    queryKey: ["my-resources", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: myOpportunities = [] } = useQuery({
    queryKey: ["my-opportunities", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("opportunities").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch point rules for total points
  const { data: pointRules = [] } = useQuery({
    queryKey: ["profile-point-rules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("point_rules").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const getPoints = useMemo(() => {
    const ruleMap: Record<string, number> = {};
    pointRules.forEach((r: any) => { ruleMap[r.action_type] = r.points; });
    return {
      resource: ruleMap["resource_upload"] ?? 10,
      project: ruleMap["project_create"] ?? 15,
      opportunity: ruleMap["opportunity_post"] ?? 8,
    };
  }, [pointRules]);

  const totalPoints = myResources.length * getPoints.resource + myProjects.length * getPoints.project + myOpportunities.length * getPoints.opportunity;

  // Achievements
  const achievementStats = useMemo(() => ({
    resources: myResources.length,
    projects: myProjects.length,
    opportunities: myOpportunities.length,
    totalPoints,
  }), [myResources, myProjects, myOpportunities, totalPoints]);

  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(achievementStats));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !a.check(achievementStats));

  // Activity timeline
  const activityTimeline = useMemo(() => {
    const items: { id: string; type: string; title: string; time: string; icon: string }[] = [];
    myResources.forEach(r => items.push({ id: r.id, type: "resource", title: `Uploaded "${r.file_name}"`, time: r.created_at, icon: "resource" }));
    myProjects.forEach(p => items.push({ id: p.id, type: "project", title: `Created project "${p.title}"`, time: p.created_at, icon: "project" }));
    myOpportunities.forEach(o => items.push({ id: o.id, type: "opportunity", title: `Posted "${o.title}"`, time: o.created_at, icon: "opportunity" }));
    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);
  }, [myResources, myProjects, myOpportunities]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile updated!");
      setEditMode(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user!.id}/avatar.${ext}`;
      await supabase.storage.from("avatars").remove([filePath]);
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase.from("profiles").update({ avatar_url: urlData.publicUrl + "?t=" + Date.now() }).eq("user_id", user!.id);
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const openEdit = () => {
    setEditForm({
      bio: profile?.bio || "",
      department: profile?.department || "",
      year_of_study: profile?.year_of_study || "",
      github_url: profile?.github_url || "",
      linkedin_url: profile?.linkedin_url || "",
      portfolio_url: profile?.portfolio_url || "",
      twitter_url: profile?.twitter_url || "",
      skills: profile?.skills || [],
    });
    setEditMode(true);
    setNewSkill("");
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && editForm && !editForm.skills.includes(trimmed)) {
      setEditForm({ ...editForm, skills: [...editForm.skills, trimmed] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    if (editForm) {
      setEditForm({ ...editForm, skills: editForm.skills.filter((s: string) => s !== skill) });
    }
  };

  const saveProfile = () => {
    if (!editForm) return;
    updateProfile.mutate({
      bio: editForm.bio || null,
      department: editForm.department || null,
      year_of_study: editForm.year_of_study || null,
      github_url: editForm.github_url || null,
      linkedin_url: editForm.linkedin_url || null,
      portfolio_url: editForm.portfolio_url || null,
      twitter_url: editForm.twitter_url || null,
      skills: editForm.skills,
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setPasswordLoading(true);
    try {
      const { updatePassword } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
      } else {
        throw new Error("No active authenticated session found.");
      }
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const stats = [
    { num: myProjects.length, label: "Projects", icon: FolderKanban, color: "text-primary", bg: "bg-primary/10" },
    { num: myResources.length, label: "Resources", icon: BookOpen, color: "text-success", bg: "bg-success/10" },
    { num: myOpportunities.length, label: "Opportunities", icon: Briefcase, color: "text-warning", bg: "bg-warning/10" },
    { num: totalPoints, label: "Points", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
  ];

  const socialLinks = [
    { key: "github_url", icon: Github, label: "GitHub", color: "hover:text-foreground" },
    { key: "linkedin_url", icon: Linkedin, label: "LinkedIn", color: "hover:text-primary" },
    { key: "portfolio_url", icon: Globe, label: "Portfolio", color: "hover:text-success" },
    { key: "twitter_url", icon: Twitter, label: "Twitter", color: "hover:text-info" },
  ];

  const inputClass = "w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";
  const textareaClass = "w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none";

  const statusColors: Record<string, string> = {
    recruiting: "bg-primary/10 text-primary",
    planning: "bg-accent text-accent-foreground",
    active: "bg-success/10 text-success",
    archived: "bg-muted text-muted-foreground",
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

  const activityIcon = (type: string) => {
    switch (type) {
      case "resource": return <Upload className="w-3 h-3 text-success" />;
      case "project": return <FolderKanban className="w-3 h-3 text-primary" />;
      case "opportunity": return <Briefcase className="w-3 h-3 text-warning" />;
      default: return <Star className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const activityDotColor = (type: string) => {
    switch (type) {
      case "resource": return "bg-success/20";
      case "project": return "bg-primary/20";
      case "opportunity": return "bg-warning/20";
      default: return "bg-muted";
    }
  };

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: Target },
    { key: "achievements" as const, label: "Achievements", icon: Award },
    { key: "activity" as const, label: "Activity", icon: Clock },
    { key: "settings" as const, label: "Settings", icon: Lock },
  ];

  return (
    <AppLayout>
      <SEO title="My Profile" description="Your StudentHub profile — manage your bio, skills, social links, and achievements." canonical="/profile" noindex />
      <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
        {/* Profile header card */}
        <div className="card-campus overflow-hidden">
          <div className="h-28 sm:h-36 gradient-primary relative">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary-foreground/5 -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-primary-foreground/5 translate-y-1/2 -translate-x-1/4" />
            {/* Points badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary-foreground/15 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Trophy className="w-3.5 h-3.5 text-primary-foreground" />
              <span className="text-xs font-bold text-primary-foreground">{totalPoints} pts</span>
            </div>
          </div>

          <div className="px-4 sm:px-6 md:px-8 pb-6 -mt-14 sm:-mt-16 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
              <div className="relative group shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-card shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl gradient-primary flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-primary-foreground border-4 border-card shadow-lg">
                    {initials}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={avatarUploading}
                >
                  {avatarUploading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                {/* Achievement count badge */}
                {unlockedAchievements.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-warning text-warning-foreground flex items-center justify-center text-[10px] font-bold shadow-md animate-bounce-in">
                    {unlockedAchievements.length}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground truncate">{displayName}</h2>
                {profile?.department && (
                  <p className="text-sm text-primary font-semibold flex items-center gap-1.5 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {profile.department}
                    {profile.year_of_study && ` • ${profile.year_of_study}`}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" /> {user?.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> Joined {new Date(user?.created_at || "").toLocaleDateString()}
                  </span>
                </div>

                {/* Unlocked achievement badges inline */}
                {unlockedAchievements.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {unlockedAchievements.slice(0, 5).map(a => (
                      <span key={a.id} title={a.title} className="text-base cursor-default hover:scale-125 transition-transform">
                        {a.emoji}
                      </span>
                    ))}
                    {unlockedAchievements.length > 5 && (
                      <span className="text-xs text-muted-foreground font-semibold self-center">+{unlockedAchievements.length - 5} more</span>
                    )}
                  </div>
                )}

                {/* Social links */}
                {socialLinks.some(s => profile?.[s.key as keyof typeof profile]) && (
                  <div className="flex items-center gap-2 mt-3">
                    {socialLinks.map(({ key, icon: Icon, label, color }) => {
                      const url = profile?.[key as keyof typeof profile] as string;
                      if (!url) return null;
                      return (
                        <a key={key} href={url} target="_blank" rel="noopener noreferrer" title={label}
                          className={`w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground transition-all duration-300 hover:scale-110 ${color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 shrink-0 self-start sm:self-end">
                <Button variant="outline" className="gap-1.5 font-semibold text-xs sm:text-sm" onClick={openEdit}>
                  <Pencil className="w-3.5 h-3.5" /> Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/5 font-semibold text-xs sm:text-sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>

            {profile?.bio && (
              <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {profile?.skills && profile.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-1 shrink-0" />
                {profile.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {stats.map(({ num, label, icon: Icon, color, bg }, i) => (
            <div key={label} className="stat-card text-center p-3 sm:p-5 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
              </div>
              <p className="text-lg sm:text-2xl font-extrabold text-foreground animate-count-up">{num}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 bg-muted/40 p-1 rounded-2xl">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
            {/* My Projects */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-primary" /> Your Projects
              </h3>
              {myProjects.length === 0 ? (
                <div className="card-campus p-8 text-center">
                  <FolderKanban className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No projects yet. Create your first project!</p>
                  <Link to="/projects"><Button size="sm" className="mt-3 gap-1.5"><Plus className="w-3.5 h-3.5" /> Create Project</Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myProjects.slice(0, 5).map((proj, i) => (
                    <div key={proj.id} className="card-interactive p-3 sm:p-4 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-card flex items-center justify-center shrink-0">
                          <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-foreground text-sm truncate">{proj.title}</h4>
                          {proj.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{proj.description}</p>}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[proj.status] || "bg-muted text-muted-foreground"}`}>
                              {proj.status.toUpperCase()}
                            </span>
                            {proj.tags?.slice(0, 2).map((tag: string) => (
                              <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {myProjects.length > 5 && (
                    <Link to="/projects" className="block text-center text-xs text-primary font-semibold hover:underline py-2">
                      View all {myProjects.length} projects →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* My Resources */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-success" /> Uploaded Resources
              </h3>
              {myResources.length === 0 ? (
                <div className="card-campus p-8 text-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No resources uploaded yet.</p>
                  <Link to="/resources"><Button size="sm" className="mt-3 gap-1.5"><Upload className="w-3.5 h-3.5" /> Upload Resource</Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myResources.slice(0, 5).map((res, i) => (
                    <div key={res.id} className="card-interactive p-3 sm:p-4 flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-card flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{res.file_name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{res.subject} • {new Date(res.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {myResources.length > 5 && (
                    <Link to="/resources" className="block text-center text-xs text-primary font-semibold hover:underline py-2">
                      View all {myResources.length} resources →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Opportunities */}
            {myOpportunities.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-warning" /> Your Opportunities
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {myOpportunities.slice(0, 4).map((opp, i) => (
                    <div key={opp.id} className="card-interactive p-3 sm:p-4 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4 text-warning" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-foreground text-sm truncate">{opp.title}</h4>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{opp.organization} • {opp.category}</p>
                          {opp.deadline && (
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Deadline: {new Date(opp.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="animate-fade-in space-y-6">
            {/* Progress bar */}
            <div className="card-campus p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-warning" /> Achievement Progress
                </h3>
                <span className="text-xs font-bold text-primary">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full gradient-primary transition-all duration-700 ease-out"
                  style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {unlockedAchievements.length === ACHIEVEMENTS.length
                  ? "🎉 You've unlocked all achievements! Amazing!"
                  : `${ACHIEVEMENTS.length - unlockedAchievements.length} more to unlock. Keep contributing!`}
              </p>
            </div>

            {/* Unlocked */}
            {unlockedAchievements.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Unlocked
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {unlockedAchievements.map((a, i) => (
                    <div key={a.id} className="achievement-badge unlocked animate-bounce-in" style={{ animationDelay: `${i * 0.08}s` }}>
                      <span className="text-2xl sm:text-3xl">{a.emoji}</span>
                      <p className="text-xs sm:text-sm font-bold text-foreground text-center">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground text-center leading-tight">{a.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked */}
            {lockedAchievements.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                  🔒 Locked
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {lockedAchievements.map(a => (
                    <div key={a.id} className="achievement-badge locked">
                      <span className="text-2xl sm:text-3xl">{a.emoji}</span>
                      <p className="text-xs sm:text-sm font-bold text-foreground text-center">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground text-center leading-tight">{a.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="animate-fade-in">
            <div className="card-campus p-5 sm:p-6">
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2 mb-5">
                <Clock className="w-5 h-5 text-primary" /> Activity Timeline
              </h3>
              {activityTimeline.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No activity yet. Start by uploading a resource or creating a project!</p>
                </div>
              ) : (
                <div>
                  {activityTimeline.map((item, i) => (
                    <div key={item.id + item.type} className="timeline-item animate-slide-in-left" style={{ animationDelay: `${i * 0.04}s` }}>
                      <div className={`timeline-dot ${activityDotColor(item.type)}`}>
                        {activityIcon(item.type)}
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {item.type === "resource" ? `+${getPoints.resource} pts` :
                             item.type === "project" ? `+${getPoints.project} pts` :
                             `+${getPoints.opportunity} pts`}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(item.time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-fade-in space-y-6">
            <div className="card-campus p-5 sm:p-6">
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2 mb-5">
                <Lock className="w-5 h-5 text-primary" /> Password & Security
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password (min. 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputClass} pl-10 pr-10`}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground block">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputClass} pl-10 pr-10`}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="gap-1.5 font-semibold text-xs sm:text-sm mt-2" disabled={passwordLoading}>
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Developer Card */}
        <Link to="/developer" className="block group">
          <div className="card-interactive p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Meet the Developer</h3>
              <p className="text-xs text-muted-foreground">Built with ❤️ by GenSync — B.Tech AI & Data Science</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>
        </Link>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editMode} onOpenChange={(open) => !open && setEditMode(false)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" /> Edit Profile
            </DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Bio</label>
                <textarea
                  placeholder="Tell us about yourself..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  maxLength={300}
                  className={textareaClass}
                />
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{editForm.bio.length}/300</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Department</label>
                  <input placeholder="e.g. Computer Science" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Year of Study</label>
                  <select value={editForm.year_of_study} onChange={(e) => setEditForm({ ...editForm, year_of_study: e.target.value })} className={inputClass}>
                    <option value="">Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Skills & Interests</label>
                <div className="flex gap-2 mb-2">
                  <input
                    placeholder="Add a skill (e.g. React, Python)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    className={inputClass}
                  />
                  <Button type="button" size="sm" onClick={addSkill} className="shrink-0 h-11 px-4">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editForm.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold gap-1.5">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                  {editForm.skills.length === 0 && <p className="text-xs text-muted-foreground">No skills added yet</p>}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground block">Social Links</label>
                <div className="space-y-2">
                  {[
                    { key: "github_url", icon: Github, placeholder: "https://github.com/username" },
                    { key: "linkedin_url", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
                    { key: "portfolio_url", icon: Globe, placeholder: "https://yourportfolio.com" },
                    { key: "twitter_url", icon: Twitter, placeholder: "https://twitter.com/username" },
                  ].map(({ key, icon: Icon, placeholder }) => (
                    <div key={key} className="relative">
                      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input placeholder={placeholder} value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} className={`${inputClass} pl-10`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1 gap-1.5 font-semibold" onClick={saveProfile} disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4" /> {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Profile;