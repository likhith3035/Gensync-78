import SEO from "@/components/SEO";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail, BookOpen, Users, LogOut, Briefcase, Calendar, TrendingUp,
  Camera, Pencil, X, Plus, Github, Linkedin, Globe, Twitter,
  GraduationCap, Sparkles, Save, ExternalLink, Code2,
  Trophy, Award, Star, Flame, Upload, FolderKanban, Share2,
  Target, Zap, Heart, MessageCircle, Clock, Lock, Eye, EyeOff, UserPlus, Link as LinkIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useRef, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

  const params = new URLSearchParams(window.location.search);
  const paramUserId = params.get("user");
  const targetUserId = paramUserId || user?.id;
  const isOwnProfile = !paramUserId || paramUserId === user?.id;

  const urlName = params.get("name");
  const urlEmail = params.get("email");

  const [useLocalFallback, setUseLocalFallback] = useState(() => {
    return localStorage.getItem("sh_social_fallback") === "true";
  });
  const [editMode, setEditMode] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [editForm, setEditForm] = useState<any>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "certificates" | "overview" | "achievements" | "activity" | "settings">("posts");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Certificate Modal State
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certUrl, setCertUrl] = useState("");

  // Post lightbox state
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ["profile", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        if (isOwnProfile && user?.id) {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({ user_id: user.id })
            .select()
            .single();
          if (insertError) throw insertError;
          return newProfile;
        }
        return null;
      }
      return data;
    },
    enabled: !!targetUserId,
  });

  // Fetch follows (followers, following, current status)
  const { data: followData, refetch: refetchFollow } = useQuery({
    queryKey: ["follows", targetUserId],
    queryFn: async () => {
      // Check if we already know social tables are missing
      if (useLocalFallback || localStorage.getItem("sh_social_fallback") === "true") {
        setUseLocalFallback(true);
        const localFollows = localStorage.getItem("sh_follows") || "[]";
        const followsList = JSON.parse(localFollows);
        const followers = followsList.filter((f: any) => f.following_id === targetUserId);
        const following = followsList.filter((f: any) => f.follower_id === targetUserId);
        const myStatusMatch = followsList.find((f: any) => f.follower_id === user?.id && f.following_id === targetUserId);
        return {
          followers,
          following,
          myStatus: myStatusMatch ? myStatusMatch.status : null
        };
      }

      try {
        const { data: followers, error: e1 } = await supabase
          .from("follows")
          .select("follower_id, status")
          .eq("following_id", targetUserId);

        if (e1) throw e1;

        const { data: following, error: e2 } = await supabase
          .from("follows")
          .select("following_id, status")
          .eq("follower_id", targetUserId);

        if (e2) throw e2;

        const { data: myStatus, error: e3 } = await supabase
          .from("follows")
          .select("status")
          .eq("follower_id", user?.id)
          .eq("following_id", targetUserId)
          .maybeSingle();

        if (e3) throw e3;

        return {
          followers: followers || [],
          following: following || [],
          myStatus: myStatus?.status || null
        };
      } catch (err) {
        console.warn("Follows table not available, using localStorage.", (err as any)?.message);
        setUseLocalFallback(true);
        localStorage.setItem("sh_social_fallback", "true");
        const localFollows = localStorage.getItem("sh_follows") || "[]";
        const followsList = JSON.parse(localFollows);
        const followers = followsList.filter((f: any) => f.following_id === targetUserId);
        const following = followsList.filter((f: any) => f.follower_id === targetUserId);
        const myStatusMatch = followsList.find((f: any) => f.follower_id === user?.id && f.following_id === targetUserId);
        return {
          followers,
          following,
          myStatus: myStatusMatch ? myStatusMatch.status : null
        };
      }
    },
    enabled: !!targetUserId && !!user
  });

  // Fetch certificates query
  const { data: certificates = [], refetch: refetchCerts } = useQuery({
    queryKey: ["certificates", targetUserId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("certificates")
          .select("*")
          .eq("user_id", targetUserId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      } catch (err) {
        setUseLocalFallback(true);
        const localCerts = localStorage.getItem(`sh_certs_${targetUserId}`) || "[]";
        return JSON.parse(localCerts);
      }
    },
    enabled: !!targetUserId
  });

  // Fetch user posts
  const { data: userPosts = [], refetch: refetchUserPosts } = useQuery({
    queryKey: ["user-posts", targetUserId],
    queryFn: async () => {
      if (useLocalFallback || localStorage.getItem("sh_social_fallback") === "true") {
        const localPosts = localStorage.getItem("sh_posts") || "[]";
        const allPosts = JSON.parse(localPosts);
        return allPosts.filter((p: any) => p.user_id === targetUserId);
      }
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", targetUserId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        
        // Fetch comments and likes for each post
        const enriched = await Promise.all(data.map(async (post) => {
          const { count: likesCount } = await supabase
            .from("post_likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);

          const { data: comments } = await supabase
            .from("post_comments")
            .select(`id, content, created_at, user_id, profiles:user_id (username)`)
            .eq("post_id", post.id);

          return {
            ...post,
            likes_count: likesCount || 0,
            comments: comments?.map((c: any) => ({
              id: c.id,
              user_name: c.profiles?.username || "student",
              content: c.content
            })) || []
          };
        }));
        return enriched;
      } catch (err) {
        setUseLocalFallback(true);
        const localPosts = localStorage.getItem("sh_posts") || "[]";
        const allPosts = JSON.parse(localPosts);
        return allPosts.filter((p: any) => p.user_id === targetUserId);
      }
    },
    enabled: !!targetUserId
  });

  // Fetch pending follow requests (only for own private profile)
  const { data: pendingRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ["pending-requests"],
    queryFn: async () => {
      if (!isOwnProfile) return [];
      if (useLocalFallback || localStorage.getItem("sh_social_fallback") === "true") {
        const localFollows = localStorage.getItem("sh_follows") || "[]";
        const followsList = JSON.parse(localFollows);
        return followsList.filter((f: any) => f.following_id === user?.id && f.status === "pending").map((p: any) => ({
          follower_id: p.follower_id,
          profiles: { username: `student`, full_name: `Student`, avatar_url: null }
        }));
      }
      try {
        const { data, error } = await supabase
          .from("follows")
          .select(`
            follower_id,
            profiles:follower_id (username, full_name, avatar_url)
          `)
          .eq("following_id", user?.id)
          .eq("status", "pending");
        if (error) throw error;
        return data || [];
      } catch (err) {
        const localFollows = localStorage.getItem("sh_follows") || "[]";
        const followsList = JSON.parse(localFollows);
        const pending = followsList.filter((f: any) => f.following_id === user?.id && f.status === "pending");
        return pending.map((p: any) => ({
          follower_id: p.follower_id,
          profiles: {
            username: `student_${p.follower_id.slice(0, 4)}`,
            full_name: `Student ${p.follower_id.slice(0, 4)}`,
            avatar_url: null
          }
        }));
      }
    },
    enabled: isOwnProfile && !!user
  });

  // Follow Mutators
  const followMutation = useMutation({
    mutationFn: async () => {
      const isPrivate = profile?.is_private || false;
      const initialStatus = isPrivate ? "pending" : "accepted";
      
      try {
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: user?.id,
            following_id: targetUserId,
            status: initialStatus
          });
        if (error) throw error;
      } catch (err) {
        const localFollows = localStorage.getItem("sh_follows") || "[]";
        const followsList = JSON.parse(localFollows);
        followsList.push({
          follower_id: user?.id,
          following_id: targetUserId,
          status: initialStatus
        });
        localStorage.setItem("sh_follows", JSON.stringify(followsList));
      }
    },
    onSuccess: () => {
      toast.success(profile?.is_private ? "Follow request sent! 📩" : "Following user! ✅");
      refetchFollow();
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      try {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user?.id)
          .eq("following_id", targetUserId);
        if (error) throw error;
      } catch (err) {
        const localFollows = localStorage.getItem("sh_follows") || "[]";
        let followsList = JSON.parse(localFollows);
        followsList = followsList.filter((f: any) => !(f.follower_id === user?.id && f.following_id === targetUserId));
        localStorage.setItem("sh_follows", JSON.stringify(followsList));
      }
    },
    onSuccess: () => {
      toast.success("Unfollowed user");
      refetchFollow();
    }
  });

  // Request Action Mutators (Accept / Decline)
  const acceptRequestMutation = useMutation({
    mutationFn: async (followerId: string) => {
      try {
        const { error } = await supabase
          .from("follows")
          .update({ status: "accepted" })
          .eq("follower_id", followerId)
          .eq("following_id", user?.id);
        if (error) throw error;
      } catch (err) {
        const localFollows = localStorage.getItem("sh_follows") || "[]";
        const followsList = JSON.parse(localFollows);
        const match = followsList.find((f: any) => f.follower_id === followerId && f.following_id === user?.id);
        if (match) match.status = "accepted";
        localStorage.setItem("sh_follows", JSON.stringify(followsList));
      }
    },
    onSuccess: () => {
      toast.success("Request accepted!");
      refetchRequests();
      refetchFollow();
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (followerId: string) => {
      try {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", followerId)
          .eq("following_id", user?.id);
        if (error) throw error;
      } catch (err) {
        const localFollows = localStorage.getItem("sh_follows") || "[]";
        let followsList = JSON.parse(localFollows);
        followsList = followsList.filter((f: any) => !(f.follower_id === followerId && f.following_id === user?.id));
        localStorage.setItem("sh_follows", JSON.stringify(followsList));
      }
    },
    onSuccess: () => {
      toast.success("Request declined");
      refetchRequests();
    }
  });

  // Add Certificate mutation
  const addCertMutation = useMutation({
    mutationFn: async () => {
      if (useLocalFallback) {
        const localCerts = localStorage.getItem(`sh_certs_${user?.id}`) || "[]";
        const current = JSON.parse(localCerts);
        const newCert = {
          id: "cert_" + Date.now(),
          title: certTitle,
          issuer: certIssuer,
          issue_date: certDate,
          credential_url: certUrl,
          created_at: new Date().toISOString()
        };
        localStorage.setItem(`sh_certs_${user?.id}`, JSON.stringify([...current, newCert]));
        return;
      }

      const { error } = await supabase.from("certificates").insert({
        user_id: user?.id,
        title: certTitle,
        issuer: certIssuer,
        issue_date: certDate || null,
        credential_url: certUrl || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Certificate added successfully! 🎓");
      setCertDialogOpen(false);
      setCertTitle("");
      setCertIssuer("");
      setCertDate("");
      setCertUrl("");
      refetchCerts();
    },
    onError: () => toast.error("Failed to add certificate")
  });

  // Projects, Resources & Opportunities Queries
  const { data: myProjects = [] } = useQuery({
    queryKey: ["my-projects", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const { data, error } = await supabase.from("projects").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
  });

  const { data: myResources = [] } = useQuery({
    queryKey: ["my-resources", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const { data, error } = await supabase.from("resources").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
  });

  const { data: myOpportunities = [] } = useQuery({
    queryKey: ["my-opportunities", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const { data, error } = await supabase.from("opportunities").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
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
      username: profile?.username || "",
      is_private: profile?.is_private || false
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
      username: editForm.username.toLowerCase().trim() || null,
      is_private: editForm.is_private
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

  const displayName = isOwnProfile 
    ? (user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student")
    : (profile?.full_name || urlName || "Student");

  const displayEmail = isOwnProfile
    ? user?.email
    : (profile?.email || urlEmail || "");

  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

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

  // Follow Status checking for locks
  const isPrivate = profile?.is_private || false;
  const isFollowing = followData?.myStatus === "accepted";
  const isPending = followData?.myStatus === "pending";
  const shouldLockProfile = isPrivate && !isOwnProfile && !isFollowing;

  const tabs = [
    { key: "posts" as const, label: "Posts", icon: Eye },
    { key: "certificates" as const, label: "Certificates", icon: Award },
    { key: "overview" as const, label: "Overview", icon: Target },
    { key: "achievements" as const, label: "Achievements", icon: Trophy },
    { key: "activity" as const, label: "Activity", icon: Clock },
    ...(isOwnProfile ? [{ key: "settings" as const, label: "Settings", icon: Lock }] : []),
  ];

  return (
    <AppLayout>
      <SEO title={isOwnProfile ? "My Profile" : `${displayName}'s Profile`} description="StudentHub profile page." canonical="/profile" noindex />
      <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
        
        {/* Pending Requests Banner for Private profile owner */}
        {isOwnProfile && pendingRequests.length > 0 && (
          <div className="p-4 rounded-2xl bg-primary/8 border border-primary/20 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <UserPlus className="w-5 h-5 text-primary animate-pulse shrink-0" />
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Pending Follow Requests ({pendingRequests.length})
                </span>
                <span className="text-[10px] text-muted-foreground">Other students requested to follow your private profile.</span>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-[10px] font-bold text-primary bg-white hover:bg-slate-50 border px-3 py-1.5 rounded-full shadow-sm">
                  Review Requests
                </button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl border-border/40 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-extrabold text-foreground">Follow Requests</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-3 max-h-60 overflow-y-auto">
                  {pendingRequests.map((req: any) => (
                    <div key={req.follower_id} className="flex items-center justify-between p-2 rounded-2xl bg-muted/10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs overflow-hidden shrink-0">
                          {req.profiles?.avatar_url ? (
                            <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (req.profiles?.username || "S")[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{req.profiles?.full_name || "Student"}</p>
                          <p className="text-[10px] text-muted-foreground truncate">@{req.profiles?.username || "student"}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => acceptRequestMutation.mutate(req.follower_id)}
                          className="text-[10px] font-bold text-white bg-primary px-3 py-1.5 rounded-full hover:opacity-90"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectRequestMutation.mutate(req.follower_id)}
                          className="text-[10px] font-bold text-muted-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Profile header card */}
        <div className="card-premium-light overflow-hidden text-left">
          <div className="h-28 sm:h-36 bg-gradient-to-r from-orange-100/30 via-white to-blue-50 relative border-b border-slate-100/60">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-orange-200/5 blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-blue-200/5 blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
            
            {/* Points badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white border border-slate-200/60 shadow-sm px-3.5 py-1.5 rounded-full">
              <Trophy className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-bold text-slate-800">{totalPoints} pts</span>
            </div>
          </div>

          <div className="px-4 sm:px-6 md:px-8 pb-6 -mt-14 sm:-mt-16 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
              <div className="relative group shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white border-4 border-white shadow-md">
                    {initials}
                  </div>
                )}
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </>
                )}
                {unlockedAchievements.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md border border-white">
                    {unlockedAchievements.length}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{displayName}</h2>
                  {profile?.username && (
                    <span className="text-xs font-semibold text-muted-foreground">@{profile.username}</span>
                  )}
                  {profile?.is_private && (
                    <Badge variant="secondary" className="gap-1 rounded-full text-[9px] bg-slate-100 border border-slate-200/50">
                      <Lock className="w-2.5 h-2.5" /> Private
                    </Badge>
                  )}
                </div>

                {profile?.department && (
                  <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {profile.department}
                    {profile.year_of_study && ` • ${profile.year_of_study}`}
                  </div>
                )}

                {/* Instagram Stats Row */}
                <div className="flex gap-5 mt-3 pb-1">
                  <div>
                    <span className="block text-sm font-extrabold text-slate-800 leading-none">{userPosts.length}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Posts</span>
                  </div>
                  <div>
                    <span className="block text-sm font-extrabold text-slate-800 leading-none">
                      {followData?.followers.filter((f: any) => f.status === "accepted").length || 0}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Followers</span>
                  </div>
                  <div>
                    <span className="block text-sm font-extrabold text-slate-800 leading-none">
                      {followData?.following.filter((f: any) => f.status === "accepted").length || 0}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Following</span>
                  </div>
                  <div>
                    <span className="block text-sm font-extrabold text-orange-600 leading-none flex items-center gap-0.5">
                      🔥 {profile?.streak_count || 0}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Streak</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  {displayEmail && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {displayEmail}
                    </span>
                  )}
                </div>

                {/* Social links */}
                {socialLinks.some(s => profile?.[s.key as keyof typeof profile]) && (
                  <div className="flex items-center gap-2 mt-3">
                    {socialLinks.map(({ key, icon: Icon, label, color }) => {
                      const url = profile?.[key as keyof typeof profile] as string;
                      if (!url) return null;
                      return (
                        <a key={key} href={url} target="_blank" rel="noopener noreferrer" title={label}
                          className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all duration-300 hover:scale-105"
                        >
                          <Icon className="w-4 h-4" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons: Own vs Other Profile */}
              {isOwnProfile ? (
                <div className="flex gap-2 shrink-0 self-start sm:self-end">
                  <Button variant="outline" className="gap-1.5 font-bold text-xs border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-full h-9 px-4.5" onClick={openEdit}>
                    <Pencil className="w-3.5 h-3.5" /> Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/40 font-bold rounded-full h-9 px-4.5"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 shrink-0 self-start sm:self-end">
                  {isFollowing ? (
                    <Button 
                      variant="outline" 
                      className="gap-1.5 font-bold text-xs border border-slate-200 hover:bg-slate-50 rounded-full h-9 px-4.5"
                      onClick={() => unfollowMutation.mutate()}
                    >
                      Following
                    </Button>
                  ) : isPending ? (
                    <Button 
                      variant="outline" 
                      className="gap-1.5 font-bold text-xs border border-slate-200 bg-slate-50 rounded-full h-9 px-4.5"
                      disabled
                    >
                      Requested
                    </Button>
                  ) : (
                    <Button 
                      className="gap-1.5 font-bold text-xs rounded-full bg-primary text-white h-9 px-5 hover:opacity-90"
                      onClick={() => followMutation.mutate()}
                    >
                      Follow
                    </Button>
                  )}

                  <Link to={`/messages?user=${targetUserId}`}>
                    <Button variant="outline" className="gap-1.5 font-bold text-xs border border-slate-200 rounded-full h-9 px-4.5">
                      <MessageCircle className="w-3.5 h-3.5" /> Message
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {profile?.bio && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/80">
                <p className="text-sm text-slate-600 leading-relaxed font-normal">{profile.bio}</p>
              </div>
            )}

            {profile?.skills && profile.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Sparkles className="w-4 h-4 text-orange-500 mt-1 shrink-0 animate-pulse" />
                {profile.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="rounded-full px-3.5 py-1 text-xs font-semibold bg-slate-100 border border-slate-200/40 text-slate-600">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Private profile locked placeholder */}
        {shouldLockProfile ? (
          <div className="card-campus p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto border border-border/40">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-extrabold text-foreground">This Account is Private</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Follow this user to see their posts, shared certificates, and academic achievements.
            </p>
          </div>
        ) : (
          <>
            {/* Tab navigation */}
            <div className="flex gap-1.5 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/40">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-bold transition-all duration-300 ${
                    activeTab === key
                      ? "bg-white text-slate-800 shadow-sm border border-slate-100"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "posts" && (
              <div className="animate-fade-in">
                {userPosts.length === 0 ? (
                  <div className="card-premium-light p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm text-slate-500">No posts shared yet.</p>
                    {isOwnProfile && (
                      <Link to="/feed">
                        <Button size="sm" className="rounded-full bg-primary text-white text-xs font-bold">
                          Go to Feed & Post
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                    {userPosts.map((post: any) => (
                      <div 
                        key={post.id} 
                        onClick={() => setSelectedPost(post)}
                        className="relative aspect-square w-full rounded-2xl overflow-hidden cursor-pointer bg-slate-900 group hover:scale-[1.02] transition-transform"
                      >
                        <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="flex items-center gap-1 text-white text-xs font-bold">
                            <Heart className="w-4 h-4 fill-white" /> {post.likes_count}
                          </span>
                          <span className="flex items-center gap-1 text-white text-xs font-bold">
                            <MessageCircle className="w-4 h-4 fill-white" /> {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "certificates" && (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between text-left">
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground">Student Certificates</h3>
                    <p className="text-[10px] text-muted-foreground">Showcase academic, technical, or sports accomplishments.</p>
                  </div>
                  {isOwnProfile && (
                    <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="rounded-full bg-primary text-white text-xs font-bold h-9 px-4.5 gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> Add Certificate
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl border-border/40 sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="font-extrabold text-foreground">Add Certificate</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-3">
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Title *</label>
                            <input
                              type="text"
                              placeholder="e.g. AWS Certified Cloud Practitioner"
                              className={inputClass}
                              value={certTitle}
                              onChange={(e) => setCertTitle(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Issuer *</label>
                            <input
                              type="text"
                              placeholder="e.g. Amazon Web Services"
                              className={inputClass}
                              value={certIssuer}
                              onChange={(e) => setCertIssuer(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Issue Date</label>
                              <input
                                type="date"
                                className={inputClass}
                                value={certDate}
                                onChange={(e) => setCertDate(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Credential URL</label>
                              <input
                                type="url"
                                placeholder="Verification link..."
                                className={inputClass}
                                value={certUrl}
                                onChange={(e) => setCertUrl(e.target.value)}
                              />
                            </div>
                          </div>

                          <Button
                            disabled={!certTitle || !certIssuer || addCertMutation.isPending}
                            onClick={() => addCertMutation.mutate()}
                            className="w-full py-3 rounded-2xl bg-primary text-white font-extrabold text-sm hover:opacity-95"
                          >
                            Add Certificate
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {certificates.length === 0 ? (
                  <div className="card-premium-light p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm text-slate-500">No certificates showcased yet.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 text-left">
                    {certificates.map((cert: any) => (
                      <div key={cert.id} className="card-campus p-5 flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-primary/5 border flex items-center justify-center text-primary shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-foreground text-sm truncate leading-snug">{cert.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{cert.issuer}</p>
                          {cert.issue_date && (
                            <p className="text-[10px] text-muted-foreground/60 mt-1">Issued: {new Date(cert.issue_date).toLocaleDateString()}</p>
                          )}
                        </div>
                        {cert.credential_url && (
                          <a 
                            href={cert.credential_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-muted/60 hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shrink-0"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "overview" && (
              <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                {/* My Projects */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-3.5 flex items-center gap-2 text-left">
                    <FolderKanban className="w-4.5 h-4.5 text-slate-600" /> Projects
                  </h3>
                  {myProjects.length === 0 ? (
                    <div className="card-premium-light p-8 text-center">
                      <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No projects yet.</p>
                      {isOwnProfile && <Link to="/projects"><Button size="sm" className="mt-3 gap-1.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white"><Plus className="w-3.5 h-3.5" /> Create Project</Button></Link>}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myProjects.slice(0, 5).map((proj, i) => (
                        <div key={proj.id} className="card-premium-light p-4 animate-fade-in text-left" style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                              <FolderKanban className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-slate-800 text-sm truncate">{proj.title}</h4>
                              {proj.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 font-normal">{proj.description}</p>}
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/50 uppercase tracking-wider">
                                  {proj.status}
                                </span>
                                {proj.tags?.slice(0, 2).map((tag: string) => (
                                  <span key={tag} className="text-[9px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full font-semibold">{tag}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* My Resources */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-3.5 flex items-center gap-2 text-left">
                    <BookOpen className="w-4.5 h-4.5 text-slate-600" /> Uploaded Resources
                  </h3>
                  {myResources.length === 0 ? (
                    <div className="card-premium-light p-8 text-center">
                      <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No resources uploaded yet.</p>
                      {isOwnProfile && <Link to="/resources"><Button size="sm" className="mt-3 gap-1.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white"><Upload className="w-3.5 h-3.5" /> Upload Resource</Button></Link>}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myResources.slice(0, 5).map((res, i) => (
                        <div key={res.id} className="card-premium-light p-4 flex items-center gap-3 animate-fade-in text-left" style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate">{res.file_name}</p>
                            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold">{res.subject} • {new Date(res.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="animate-fade-in space-y-6 text-left">
                {/* Progress bar */}
                <div className="card-premium-light p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Award className="w-4.5 h-4.5 text-orange-500" /> Achievement Progress
                    </h3>
                    <span className="text-xs font-bold text-orange-500">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-700 ease-out"
                      style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    {unlockedAchievements.length === ACHIEVEMENTS.length
                      ? "🎉 You've unlocked all achievements! Amazing!"
                      : `${ACHIEVEMENTS.length - unlockedAchievements.length} more to unlock. Keep contributing!`}
                  </p>
                </div>

                {/* Unlocked */}
                {unlockedAchievements.length > 0 && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-3.5 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" /> Unlocked
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {unlockedAchievements.map((a, i) => (
                        <div key={a.id} className="rounded-3xl p-5 bg-white border border-orange-100/60 shadow-[0_8px_30px_rgba(249,115,22,0.03)] flex flex-col items-center justify-center gap-1.5 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                          <span className="text-2xl sm:text-3xl">{a.emoji}</span>
                          <p className="text-xs sm:text-sm font-bold text-slate-800 text-center">{a.title}</p>
                          <p className="text-[10px] text-slate-400 text-center leading-tight font-medium">{a.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked */}
                {lockedAchievements.length > 0 && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-400 mb-3.5 flex items-center gap-2">
                      🔒 Locked
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {lockedAchievements.map(a => (
                        <div key={a.id} className="rounded-3xl p-5 bg-slate-50/50 border border-slate-100/80 opacity-60 flex flex-col items-center justify-center gap-1.5 grayscale">
                          <span className="text-2xl sm:text-3xl">{a.emoji}</span>
                          <p className="text-xs sm:text-sm font-bold text-slate-500 text-center">{a.title}</p>
                          <p className="text-[10px] text-slate-400 text-center leading-tight font-medium">{a.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="animate-fade-in text-left">
                <div className="card-premium-light p-5 sm:p-6">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2 mb-5">
                    <Clock className="w-4.5 h-4.5 text-slate-600" /> Activity Timeline
                  </h3>
                  {activityTimeline.length === 0 ? (
                    <div className="text-center py-10">
                      <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">No activity yet. Start by uploading a resource or creating a project!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activityTimeline.map((item, i) => (
                        <div key={item.id + item.type} className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-slate-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                          <div className="w-7 h-7 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                            {activityIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">{item.title}</p>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mt-0.5">
                              {item.type === "resource" ? `+${getPoints.resource} pts` :
                               item.type === "project" ? `+${getPoints.project} pts` :
                               `+${getPoints.opportunity} pts`}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">{timeAgo(item.time)}</span>
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
          </>
        )}

        {/* Developer Card */}
        <Link to="/developer" className="block group">
          <div className="card-interactive p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Meet the Developer</h3>
              <p className="text-xs text-muted-foreground">Built with ❤️ by GenSync — B.Tech AI & Data Science</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>
        </Link>
      </div>

      {/* Post Lightbox Modal */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="rounded-3xl border-border/40 sm:max-w-2xl p-0 overflow-hidden flex flex-col md:flex-row bg-card">
            {/* Image section */}
            <div className="md:w-1/2 aspect-square bg-slate-900 flex items-center justify-center shrink-0">
              <img src={selectedPost.image_url} alt="" className="w-full h-full object-cover" />
            </div>
            {/* Context/Comments section */}
            <div className="p-5 flex flex-col flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2 border-b border-border/10 pb-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                  {(profile?.username || "S")[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-foreground leading-none">@{profile?.username || "student"}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{profile?.department || "Campus"}</p>
                </div>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed mb-4">{selectedPost.caption}</p>
              
              {/* Comments box */}
              <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Comments</h5>
              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-48 pr-2">
                {selectedPost.comments?.map((c: any) => (
                  <div key={c.id} className="text-xs leading-normal">
                    <span className="font-extrabold mr-1.5">@{c.user_name}</span>
                    <span className="text-muted-foreground">{c.content}</span>
                  </div>
                ))}
                {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                  <p className="text-[10px] text-muted-foreground/60 italic">No comments yet</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={editMode} onOpenChange={(open) => !open && setEditMode(false)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" /> Edit Profile
            </DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4 mt-2 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Unique Username</label>
                  <input 
                    placeholder="e.g. kamili" 
                    value={editForm.username} 
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Account Type</label>
                  <select 
                    value={editForm.is_private ? "private" : "public"} 
                    onChange={(e) => setEditForm({ ...editForm, is_private: e.target.value === "private" })} 
                    className={inputClass}
                  >
                    <option value="public">🌐 Public Profile</option>
                    <option value="private">🔒 Private Profile</option>
                  </select>
                </div>
              </div>

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
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{editForm.bio?.length || 0}/300</p>
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