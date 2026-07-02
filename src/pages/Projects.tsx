import SEO from "@/components/SEO";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  Plus, Rocket, Users, Tag, ArrowRight, Share2, Lock, GraduationCap, 
  Globe, X, AlertTriangle, UserPlus, Check, CheckCircle2, XCircle, 
  Briefcase, Mail, Send, Award, Sparkles, Github, Linkedin, ExternalLink 
} from "lucide-react";
import { useState } from "react";
import ShareDialog from "@/components/ShareDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { color: string; dot: string }> = {
  recruiting: { color: "bg-primary/10 text-primary", dot: "bg-primary" },
  planning: { color: "bg-accent text-accent-foreground", dot: "bg-accent-foreground" },
  active: { color: "bg-success/10 text-success", dot: "bg-success" },
  archived: { color: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  urgent: { color: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Mobile Developer",
  "AI/ML Engineer",
  "UI/UX Designer",
  "QA Engineer",
  "Project Manager",
  "Data Scientist",
  "Other"
];

import { useSearchParams } from "react-router-dom";

const Projects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tags: "", status: "recruiting" });
  const [shareTarget, setShareTarget] = useState<{ id: string; title: string } | null>(null);
  const [privacyType, setPrivacyType] = useState<"all" | "college" | "selected">("all");
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  
  // Database Warning Fallback Banner
  const [dbWarning, setDbWarning] = useState(false);

  // Application Dialog States
  const [applyTarget, setApplyTarget] = useState<{ id: string; title: string } | null>(null);
  const [applyRole, setApplyRole] = useState(ROLES[0]);
  const [applyMessage, setApplyMessage] = useState("");

  // Invitation Dialog States
  const [inviteTarget, setInviteTarget] = useState<{ userId: string; userName: string } | null>(null);
  const [inviteProjectId, setInviteProjectId] = useState("");

  // Availability setup state
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    bio: "",
    roles: [] as string[],
    roleInput: ROLES[0],
  });

  const addAllowedEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (trimmed && !allowedEmails.includes(trimmed) && trimmed.includes("@")) {
      setAllowedEmails([...allowedEmails, trimmed]);
      setEmailInput("");
    }
  };

  // Queries
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", user?.id, searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, project_members(user_id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      const filtered = data.filter((res: any) => {
        if (res.user_id === user?.id) return true;
        const privacy = res.privacy_type || "all";
        const allowed = res.allowed_emails || [];
        
        if (privacy === "all") return true;
        if (privacy === "college") {
          const emailStr = user?.email || "";
          const lowerEmail = emailStr.toLowerCase().trim();
          const admins = ["kamilikhith@gmail.com", "uppumanogna@gmail.com", "luckylucky12h@gmail.com", "limaaiuse@gmail.com"];
          return admins.includes(lowerEmail) || 
                 lowerEmail.endsWith("@nbkrist.org") || 
                 lowerEmail.endsWith("@srmap.edu.in") || 
                 lowerEmail.split("@")[1]?.endsWith(".edu") || 
                 lowerEmail.split("@")[1]?.endsWith(".edu.in");
        }
        if (privacy === "selected") {
          const emailStr = user?.email || "";
          return allowed.map((e: string) => e.toLowerCase().trim()).includes(emailStr.toLowerCase().trim());
        }
        return false;
      });

      if (searchQuery) {
        const lowerSearch = searchQuery.toLowerCase().trim();
        return filtered.filter((proj: any) => 
          proj.title.toLowerCase().includes(lowerSearch) || 
          proj.description.toLowerCase().includes(lowerSearch) || 
          proj.tags?.some((t: string) => t.toLowerCase().includes(lowerSearch))
        );
      }
      return filtered;
    },
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ["my-memberships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((m) => m.project_id);
    },
  });

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile-availability", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        if (error.message.includes("is_open_to_build") || error.code === "PGRST116") {
          setDbWarning(true);
        }
        throw error;
      }
      if (data) {
        setAvailabilityForm(prev => ({
          ...prev,
          bio: data.open_to_build_bio || "",
          roles: data.open_to_build_roles || [],
        }));
      }
      return data;
    },
    enabled: !!user,
  });

  const { data: talentProfiles = [], isLoading: talentLoading } = useQuery({
    queryKey: ["talent-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_open_to_build", true)
        .order("updated_at", { ascending: false });
      
      if (error) {
        if (error.message.includes("is_open_to_build") || error.code === "PGRST116") {
          setDbWarning(true);
        }
        throw error;
      }
      return (data || []).filter(p => p.user_id !== user?.id);
    },
    enabled: !!user,
  });

  const { data: myApplications = [] } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_join_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        if (error.message.includes("relation") || error.code === "PGRST116") {
          setDbWarning(true);
        }
        throw error;
      }

      if (data.length === 0) return [];

      const projectIds = data.map(r => r.project_id);
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, title, user_id")
        .in("id", projectIds);
      
      const ownerIds = projectsData?.map(p => p.user_id) || [];
      let ownerProfiles: any[] = [];
      if (ownerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", ownerIds);
        ownerProfiles = profilesData || [];
      }

      return data.map(r => {
        const projObj = projectsData?.find(p => p.id === r.project_id);
        const ownerProfile = ownerProfiles.find(p => p.user_id === projObj?.user_id);
        return {
          ...r,
          project_title: projObj?.title || "Unknown Project",
          project_owner_name: ownerProfile?.full_name || "Project Owner",
          project_owner_email: ownerProfile?.email || ""
        };
      });
    },
    enabled: !!user,
  });

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ["incoming-requests", user?.id],
    queryFn: async () => {
      const { data: myOwnedProjects } = await supabase
        .from("projects")
        .select("id, title")
        .eq("user_id", user!.id);
      
      if (!myOwnedProjects || myOwnedProjects.length === 0) return [];
      const myOwnedProjectIds = myOwnedProjects.map(p => p.id);
      
      const { data, error } = await supabase
        .from("project_join_requests")
        .select("*")
        .in("project_id", myOwnedProjectIds)
        .order("created_at", { ascending: false });
      
      if (error) {
        if (error.message.includes("relation") || error.code === "PGRST116") {
          setDbWarning(true);
        }
        throw error;
      }
      
      const applicantUserIds = data.map(r => r.user_id);
      let applicantProfiles: any[] = [];
      if (applicantUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", applicantUserIds);
        applicantProfiles = profilesData || [];
      }

      return data.map(r => {
        const projObj = myOwnedProjects.find(p => p.id === r.project_id);
        const profileObj = applicantProfiles.find(p => p.user_id === r.user_id);
        return {
          ...r,
          project_title: projObj?.title || "Unknown Project",
          applicant: profileObj || { full_name: "Student", email: "N/A" }
        };
      });
    },
    enabled: !!user,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").insert({
        title: form.title,
        description: form.description || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        status: form.status,
        user_id: user!.id,
        privacy_type: privacyType,
        allowed_emails: allowedEmails,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project posted!");
      setDialogOpen(false);
      setForm({ title: "", description: "", tags: "", status: "recruiting" });
      setPrivacyType("all");
      setAllowedEmails([]);
      setEmailInput("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const applyMutation = useMutation({
    mutationFn: async (vars: { projectId: string; role: string; message: string }) => {
      const { error } = await supabase.from("project_join_requests").insert({
        project_id: vars.projectId,
        user_id: user!.id,
        preferred_role: vars.role,
        message: vars.message,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Application submitted! The project owner has been notified.");
      setApplyTarget(null);
      setApplyMessage("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reviewMutation = useMutation({
    mutationFn: async (vars: { requestId: string; action: "accepted" | "rejected"; projectId: string; applicantId: string }) => {
      const { error: updateErr } = await supabase
        .from("project_join_requests")
        .update({ status: vars.action })
        .eq("id", vars.requestId);
      if (updateErr) throw updateErr;

      if (vars.action === "accepted") {
        const { error: memberErr } = await supabase.from("project_members").insert({
          project_id: vars.projectId,
          user_id: vars.applicantId,
        });
        if (memberErr) throw memberErr;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(`Application ${vars.action === "accepted" ? "approved" : "declined"}.`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reviewInvitationMutation = useMutation({
    mutationFn: async (vars: { requestId: string; action: "accepted" | "rejected"; projectId: string }) => {
      const { error: updateErr } = await supabase
        .from("project_join_requests")
        .update({ status: vars.action })
        .eq("id", vars.requestId);
      if (updateErr) throw updateErr;

      if (vars.action === "accepted") {
        const { error: memberErr } = await supabase.from("project_members").insert({
          project_id: vars.projectId,
          user_id: user!.id,
        });
        if (memberErr) throw memberErr;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["my-memberships"] });
      toast.success(`Invitation ${vars.action === "accepted" ? "accepted" : "declined"}.`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase.from("project_join_requests").delete().eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Application withdrawn.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (vars: { isOpen: boolean; bio: string; roles: string[] }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_open_to_build: vars.isOpen,
          open_to_build_bio: vars.bio,
          open_to_build_roles: vars.roles,
        })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile-availability"] });
      queryClient.invalidateQueries({ queryKey: ["talent-profiles"] });
      toast.success("Availability updated successfully!");
      setIsEditingAvailability(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const inviteMutation = useMutation({
    mutationFn: async (vars: { projectId: string; inviteeId: string }) => {
      const { error } = await supabase.from("project_join_requests").insert({
        project_id: vars.projectId,
        user_id: vars.inviteeId,
        status: "invited",
        message: `You have been invited by the project owner to join their team!`,
        preferred_role: "Invited Teammate",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      setInviteTarget(null);
    },
    onError: (e: any) => {
      if (e.message.includes("duplicate") || e.code === "23505") {
        toast.error("This student has already been invited or has applied to this project.");
      } else {
        toast.error(e.message);
      }
    },
  });

  const addRoleToAvailability = () => {
    const role = availabilityForm.roleInput;
    if (role && !availabilityForm.roles.includes(role)) {
      setAvailabilityForm({
        ...availabilityForm,
        roles: [...availabilityForm.roles, role]
      });
    }
  };

  const removeRoleFromAvailability = (role: string) => {
    setAvailabilityForm({
      ...availabilityForm,
      roles: availabilityForm.roles.filter(r => r !== role)
    });
  };

  // Lists & Filtering
  const displayedProjects = activeTab === 4
    ? projects.filter((p) => p.user_id === user?.id || myMemberships.includes(p.id))
    : projects;

  const myOwnedProjects = projects.filter(p => p.user_id === user?.id);

  // Tab configurations
  const pendingIncomingCount = incomingRequests.filter(r => r.status === "pending").length;
  const pendingInvitationsCount = myApplications.filter(r => r.status === "invited").length;

  const tabs = [
    { label: "Explore Projects", badge: 0 },
    { label: "Talent Board", badge: 0 },
    { label: "Incoming Requests", badge: pendingIncomingCount },
    { label: "My Applications", badge: pendingInvitationsCount },
    { label: "My Teams", badge: 0 }
  ];

  return (
    <AppLayout>
      <SEO 
        title="Projects" 
        description="Create teams, invite campus collaborators, apply to join active student projects, and mark your availability to build on StudentHub." 
        canonical="/projects" 
        keywords="student projects, team building, campus hiring, student teams, open to work, open to build" 
      />
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* SQL Database Schema Warning Banner */}
        {dbWarning && (
          <div className="bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 rounded-3xl p-5 sm:p-6 animate-scale-in flex flex-col md:flex-row gap-4 items-start relative overflow-hidden shadow-lg">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 space-y-1.5 min-w-0">
              <h4 className="font-bold text-sm">Database Schema Migration Required</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The database tables/columns for the new **Team Formation & Approval** features are not yet present in your remote Supabase instance.
              </p>
              <div className="text-xs bg-muted/80 p-3 rounded-xl font-mono text-muted-foreground border border-border/40 select-all max-h-24 overflow-y-auto">
                Please copy and run the SQL code from:
                <br />
                <span className="font-bold text-foreground">supabase/migrations/20260614020000_add_team_building_features.sql</span>
                <br />
                inside your Supabase Dashboard SQL Editor to activate all features.
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-2 gap-4 animate-fade-in">
          <div className="page-header mb-0">
            <h1 className="text-3xl sm:text-4xl font-medium text-[#0F172A] tracking-tight font-serif-elegant">Project Collaboration Hub</h1>
            <p className="text-sm text-slate-500 mt-1.5">Find teams, recruit collaborators, and build projects together</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5 font-semibold shadow-sm rounded-full bg-slate-900 hover:bg-slate-800 text-white h-10 px-5"><Plus className="w-4 h-4" /> Post a Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Post a Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4 mt-2">
                <input placeholder="Project title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
                <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none" />
                <input placeholder="Tags (comma-separated, e.g. React, Python)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all">
                  <option value="recruiting">Recruiting</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="urgent">Urgent</option>
                </select>

                {/* Privacy visibility settings */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground block">Privacy & Visibility</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: "all" as const, icon: Globe, label: "Public" },
                      { val: "college" as const, icon: GraduationCap, label: "College Mails" },
                      { val: "selected" as const, icon: Lock, label: "Selected Mails" },
                    ].map(({ val, icon: Icon, label }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPrivacyType(val)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-[11px] font-semibold transition-all ${
                          privacyType === val
                            ? "border-slate-800 bg-slate-50 text-[#0F172A]"
                            : "border-border/60 text-muted-foreground hover:border-slate-300"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {privacyType === "all" && (
                    <p className="text-[10px] text-muted-foreground/85 leading-normal">
                      All logged-in StudentHub students can find and join this project.
                    </p>
                  )}

                  {privacyType === "college" && (
                    <p className="text-[10px] text-muted-foreground/85 leading-normal">
                      Only authenticated student emails (@nbkrist.org, @srmap.edu.in, .edu, .edu.in) can find and join.
                    </p>
                  )}

                  {privacyType === "selected" && (
                    <div className="space-y-2 mt-1.5 p-3 rounded-xl bg-muted/40 border border-border/40 animate-fade-in">
                      <p className="text-[10px] text-muted-foreground/85 leading-normal mb-1.5">
                        Only students with the specific email addresses added below can view and join.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="Add student email (e.g. name@college.edu)"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addAllowedEmail();
                            }
                          }}
                          className="w-full h-9 px-3 rounded-lg border border-border/60 bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={addAllowedEmail}
                          className="shrink-0 h-9 px-3 rounded-lg"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5 max-h-[80px] overflow-y-auto p-0.5">
                        {allowedEmails.map((email, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="gap-1 py-0.5 pl-2 pr-1 rounded text-[10px] font-medium bg-background text-foreground border border-border"
                          >
                            {email}
                            <button
                              type="button"
                              onClick={() => setAllowedEmails(allowedEmails.filter((_, idx) => idx !== i))}
                              className="rounded-full hover:bg-muted p-0.5"
                            >
                              <X className="w-2.5 h-2.5 text-muted-foreground" />
                            </button>
                          </Badge>
                        ))}
                        {allowedEmails.length === 0 && (
                          <span className="text-[10px] text-muted-foreground/60 italic">No email addresses added.</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Posting..." : "Post Project"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {searchQuery && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between animate-fade-in">
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              Showing projects matching <span className="font-extrabold text-primary">"{searchQuery}"</span>
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSearchParams({})}
              className="text-xs hover:bg-primary/10 text-primary font-bold h-8 rounded-full"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Dynamic Navigation Tabs */}
        <div className="flex gap-1.5 p-1.5 bg-white/85 border border-slate-100/85 rounded-full w-full sm:w-fit overflow-x-auto no-scrollbar animate-fade-in shadow-[0_2px_8px_rgba(15,23,42,0.01)]">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
                activeTab === i
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="animate-fade-in">

            {/* TAB 0: EXPLORE PROJECTS */}
            {activeTab === 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedProjects.map((proj, i) => {
                  const memberCount = proj.project_members?.length || 0;
                  const isJoined = myMemberships.includes(proj.id);
                  const isOwner = proj.user_id === user?.id;
                  const status = statusConfig[proj.status] || statusConfig.archived;
                  
                  // Check if there is an application
                  const application = myApplications.find(app => app.project_id === proj.id);
                  const isPending = application?.status === "pending";
                  const isRejected = application?.status === "rejected";
                  const isInvited = application?.status === "invited";

                  return (
                    <div key={proj.id} className="card-premium-light overflow-hidden flex flex-col animate-fade-in" style={{ animationDelay: `${0.03 * i}s` }}>
                      <div className="h-1.5 gradient-primary" />
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {proj.status.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="font-bold text-foreground mb-1.5">{proj.title}</h3>
                        {proj.description && <p className="text-sm text-muted-foreground mb-3 flex-1 line-clamp-2">{proj.description}</p>}
                        {proj.tags && proj.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {proj.tags.map((tag) => (
                              <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <Users className="w-3.5 h-3.5" /> {memberCount} member{memberCount !== 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setShareTarget({ id: proj.id, title: proj.title })}
                              className="h-8 w-8 rounded-lg border border-border/60 flex items-center justify-center hover:bg-muted transition-all"
                            >
                              <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            {isOwner ? (
                              <span className="text-xs text-primary font-bold">Your Project</span>
                            ) : isJoined ? (
                              <span className="text-xs text-success font-bold flex items-center gap-1">✓ Joined</span>
                            ) : isPending ? (
                              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 bg-amber-500/5 py-1 px-2.5">
                                Pending Review
                              </Badge>
                            ) : isInvited ? (
                              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5 py-1 px-2.5">
                                Invited
                              </Badge>
                            ) : isRejected ? (
                              <Button size="sm" variant="outline" onClick={() => setApplyTarget({ id: proj.id, title: proj.title })} className="h-8 px-3 text-xs font-semibold border-destructive/20 text-destructive hover:bg-destructive/5">
                                Reapply
                              </Button>
                            ) : proj.status === "recruiting" || proj.status === "urgent" ? (
                              <Button size="sm" onClick={() => setApplyTarget({ id: proj.id, title: proj.title })} className="h-8 px-4 text-xs font-semibold shadow-sm">
                                Apply to Join
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground font-semibold">Closed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* CTA card */}
                <div className="rounded-2xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center p-8 text-center hover:border-primary/30 transition-colors">
                  <div className="w-14 h-14 rounded-2xl gradient-card flex items-center justify-center mb-4">
                    <Rocket className="w-6 h-6 text-primary/60" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1.5">Have a project idea?</h3>
                  <p className="text-sm text-muted-foreground mb-5">Start your own and invite talented teammates.</p>
                  <Button variant="outline" onClick={() => setDialogOpen(true)} className="font-semibold gap-1.5">
                    <Plus className="w-4 h-4" /> Post Project
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 1: TALENT BOARD (OPEN TO BUILD) */}
            {activeTab === 1 && (
              <div className="space-y-6">
                
                {/* Available Status Toggle for current user */}
                <div className="card-premium-light p-5 sm:p-6 bg-white">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#0F172A]">Become Available for Teams</h3>
                        {myProfile?.is_open_to_build ? (
                          <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 py-0.5 px-2.5 rounded-full text-[10px] font-bold">
                            Active Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] font-bold">Offline</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                        Toggle your status to appear on the Talent Board. Project managers can find your profile, view your tech stack, and invite you to join their startup/hackathon teams.
                      </p>
                    </div>

                    {!isEditingAvailability && (
                      <Button 
                        variant={myProfile?.is_open_to_build ? "outline" : "default"}
                        onClick={() => setIsEditingAvailability(true)}
                        className="font-semibold text-xs h-10 px-5 shrink-0"
                      >
                        {myProfile?.is_open_to_build ? "Edit Availability Info" : "Setup My Profile Info"}
                      </Button>
                    )}
                  </div>

                  {isEditingAvailability && (
                    <div className="mt-5 pt-5 border-t border-border/40 space-y-4 animate-fade-in">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">My Availability Pitch *</label>
                          <textarea
                            placeholder="Briefly pitch yourself: what are you looking to build? (e.g. '3rd year student looking for a Web3 hackathon team. Experienced in Rust and React.')"
                            value={availabilityForm.bio}
                            onChange={(e) => setAvailabilityForm({ ...availabilityForm, bio: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-semibold text-muted-foreground">Roles I'm looking for</label>
                          <div className="flex gap-2">
                            <select
                              value={availabilityForm.roleInput}
                              onChange={(e) => setAvailabilityForm({ ...availabilityForm, roleInput: e.target.value })}
                              className="flex-1 h-10 px-3 rounded-xl border border-border/60 bg-muted/30 text-xs focus:outline-none"
                            >
                              {ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                            <Button type="button" size="sm" onClick={addRoleToAvailability} className="h-10 px-4 rounded-xl text-xs">
                              Add
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-1.5 p-2 bg-muted/20 border border-border/40 rounded-xl min-h-[50px]">
                            {availabilityForm.roles.map(role => (
                              <Badge key={role} variant="secondary" className="gap-1 py-0.5 pl-2 pr-1 rounded bg-background border text-[10px] font-semibold">
                                {role}
                                <button type="button" onClick={() => removeRoleFromAvailability(role)} className="rounded-full hover:bg-muted p-0.5">
                                  <X className="w-2.5 h-2.5 text-muted-foreground hover:text-destructive" />
                                </button>
                              </Badge>
                            ))}
                            {availabilityForm.roles.length === 0 && (
                              <span className="text-[10px] text-muted-foreground/60 italic self-center pl-2">No roles selected.</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setIsEditingAvailability(false)}
                          className="text-xs font-semibold"
                        >
                          Cancel
                        </Button>
                        {myProfile?.is_open_to_build && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAvailabilityMutation.mutate({ isOpen: false, bio: "", roles: [] })}
                            className="text-xs border-destructive/20 text-destructive hover:bg-destructive/5 font-semibold"
                            disabled={toggleAvailabilityMutation.isPending}
                          >
                            Disable Availability
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => toggleAvailabilityMutation.mutate({
                            isOpen: true,
                            bio: availabilityForm.bio,
                            roles: availabilityForm.roles
                          })}
                          className="text-xs font-semibold bg-success hover:bg-success/90 text-success-foreground"
                          disabled={toggleAvailabilityMutation.isPending || !availabilityForm.bio.trim()}
                        >
                          {toggleAvailabilityMutation.isPending ? "Saving..." : "Go Live on Talent Board"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Available students list */}
                {talentLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-5">
                    {talentProfiles.map((student: any, i) => {
                      const popoverInitials = (student.full_name || student.email || "S").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                      return (
                        <div key={student.id} className="card-premium-light overflow-hidden flex flex-col p-5 animate-fade-in" style={{ animationDelay: `${0.03 * i}s` }}>
                          <div className="flex gap-4 items-start mb-3">
                            {student.avatar_url ? (
                              <img src={student.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover border shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm">
                                {popoverInitials}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-foreground text-sm truncate leading-snug">{student.full_name || "Student"}</h4>
                              <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5 text-primary" /> {student.department || "No Department Set"}
                                {student.year_of_study && ` • ${student.year_of_study}`}
                              </p>
                              {student.email && <p className="text-[10px] text-muted-foreground/75 truncate mt-0.5">{student.email}</p>}
                            </div>
                          </div>

                          {student.open_to_build_bio && (
                            <p className="text-xs text-muted-foreground/90 leading-relaxed italic bg-muted/30 border border-border/20 p-3 rounded-2xl mb-4">
                              "{student.open_to_build_bio}"
                            </p>
                          )}

                          {student.open_to_build_roles && student.open_to_build_roles.length > 0 && (
                            <div className="mb-3.5">
                              <p className="text-[9px] font-bold text-muted-foreground/70 mb-1 tracking-wider uppercase">PREFERRED ROLES:</p>
                              <div className="flex flex-wrap gap-1">
                                {student.open_to_build_roles.map((role: string) => (
                                  <Badge key={role} variant="secondary" className="text-[9px] py-0 px-2 rounded font-semibold bg-primary/5 text-primary border border-primary/10">
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {student.skills && student.skills.length > 0 && (
                            <div className="mb-4">
                              <p className="text-[9px] font-bold text-muted-foreground/70 mb-1 tracking-wider uppercase">KEY SKILLS:</p>
                              <div className="flex flex-wrap gap-1">
                                {student.skills.slice(0, 6).map((skill: string) => (
                                  <span key={skill} className="text-[9px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                    {skill}
                                  </span>
                                ))}
                                {student.skills.length > 6 && (
                                  <span className="text-[9px] text-muted-foreground font-bold self-center">+{student.skills.length - 6}</span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
                            {/* Social Links */}
                            <div className="flex items-center gap-1.5">
                              {student.github_url && (
                                <a href={student.github_url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-muted text-muted-foreground transition-all">
                                  <Github className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {student.linkedin_url && (
                                <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-muted text-muted-foreground transition-all">
                                  <Linkedin className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {student.portfolio_url && (
                                <a href={student.portfolio_url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-muted text-muted-foreground transition-all">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>

                            {/* Invite button */}
                            {myOwnedProjects.length > 0 ? (
                              <Button 
                                size="sm" 
                                onClick={() => setInviteTarget({ userId: student.user_id, userName: student.full_name || "Student" })}
                                className="h-8 text-[11px] font-bold gap-1 shadow-sm"
                              >
                                <UserPlus className="w-3.5 h-3.5" /> Invite to Team
                              </Button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">Post a project to invite</span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {talentProfiles.length === 0 && (
                      <div className="col-span-2 card-premium-light p-12 text-center text-slate-500">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-semibold">No other students are currently listed as "Open to Build".</p>
                        <p className="text-xs text-slate-400 mt-1">Be the first to list yourself by setting up your availability above!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INCOMING REQUESTS (OWNER REVIEW BOARD) */}
            {activeTab === 2 && (
              <div className="space-y-4">
                <div className="card-premium-light overflow-hidden bg-white">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-bold text-[#0F172A] text-sm sm:text-base">Incoming Applications ({incomingRequests.length})</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Approve or decline requests from students who want to collaborate on your projects.</p>
                  </div>
                  <div className="divide-y divide-border/40">
                    {incomingRequests.length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground">
                        <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm">No applications received yet.</p>
                        <p className="text-xs text-muted-foreground/75 mt-1">Make sure your project status is set to "Recruiting" to attract candidates.</p>
                      </div>
                    ) : incomingRequests.map((req, i) => {
                      const popoverInitials = (req.applicant?.full_name || "S").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                      const isPending = req.status === "pending";

                      return (
                        <div key={req.id} className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start animate-fade-in" style={{ animationDelay: `${0.03 * i}s` }}>
                          <div className="space-y-3 flex-1 min-w-0">
                            <div className="flex gap-3 items-start">
                              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                                {popoverInitials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-sm text-foreground truncate">{req.applicant?.full_name || "Student"}</h4>
                                <p className="text-[10px] text-muted-foreground font-semibold truncate">
                                  Applied to: <span className="text-primary font-bold">"{req.project_title}"</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{req.applicant?.email}</p>
                              </div>
                            </div>

                            <div className="bg-muted/30 border border-border/20 p-3.5 rounded-2xl space-y-2">
                              <p className="text-[10px] font-bold text-muted-foreground/80 flex items-center gap-1.5 uppercase">
                                <Briefcase className="w-3.5 h-3.5 text-primary" /> PREFERRED ROLE: 
                                <span className="text-foreground font-bold">{req.preferred_role || "Teammate"}</span>
                              </p>
                              {req.message && (
                                <p className="text-xs text-foreground/90 leading-relaxed border-t border-border/20 pt-1.5 italic">
                                  "{req.message}"
                                </p>
                              )}
                            </div>

                            {/* Applicant tags/department from profile */}
                            {(req.applicant?.department || (req.applicant?.skills && req.applicant.skills.length > 0)) && (
                              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                {req.applicant.department && (
                                  <span className="font-semibold text-muted-foreground flex items-center gap-1">
                                    <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
                                    {req.applicant.department} {req.applicant.year_of_study && `(${req.applicant.year_of_study})`}
                                  </span>
                                )}
                                {req.applicant.skills && req.applicant.skills.slice(0, 3).map((s: string) => (
                                  <span key={s} className="px-2 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-row md:flex-col items-end gap-2 w-full md:w-auto pt-3 md:pt-0 shrink-0">
                            {isPending ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => reviewMutation.mutate({
                                    requestId: req.id,
                                    action: "accepted",
                                    projectId: req.project_id,
                                    applicantId: req.user_id
                                  })}
                                  disabled={reviewMutation.isPending}
                                  className="h-9 w-full md:w-28 font-bold text-xs bg-success hover:bg-success/90 text-success-foreground shadow-sm"
                                >
                                  Accept Joiner
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => reviewMutation.mutate({
                                    requestId: req.id,
                                    action: "rejected",
                                    projectId: req.project_id,
                                    applicantId: req.user_id
                                  })}
                                  disabled={reviewMutation.isPending}
                                  className="h-9 w-full md:w-28 font-semibold text-xs border-destructive/20 text-destructive hover:bg-destructive/5"
                                >
                                  Decline
                                </Button>
                              </>
                            ) : (
                              <Badge className={
                                req.status === "accepted" 
                                  ? "bg-success/15 border-success/35 text-success hover:bg-success/15" 
                                  : "bg-destructive/15 border-destructive/35 text-destructive hover:bg-destructive/15"
                              } variant="outline">
                                {req.status === "accepted" ? "Approved" : "Declined"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MY APPLICATIONS & INCOMING INVITATIONS */}
            {activeTab === 3 && (
              <div className="space-y-6">
                
                {/* 1. Incoming Invitations Section */}
                <div className="card-campus overflow-hidden bg-card border border-border/80">
                  <div className="p-4 border-b border-border/40">
                    <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Project Invitations ({myApplications.filter(r => r.status === "invited").length})
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Project owners invited you to join their teams.</p>
                  </div>
                  <div className="divide-y divide-border/40">
                    {myApplications.filter(r => r.status === "invited").length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-xs italic">
                        No team invitations active. Complete your Talent Board profile to get discovered!
                      </div>
                    ) : myApplications.filter(r => r.status === "invited").map((inv, i) => (
                      <div key={inv.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in" style={{ animationDelay: `${0.03 * i}s` }}>
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-foreground">
                            You are invited to join <span className="text-primary font-bold">"{inv.project_title}"</span>
                          </h4>
                          <p className="text-[10px] text-muted-foreground">
                            Sender: {inv.project_owner_name} ({inv.project_owner_email})
                          </p>
                          {inv.message && (
                            <p className="text-xs text-muted-foreground italic pl-3 border-l-2 border-primary/20">
                              "{inv.message}"
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 shrink-0 pt-2 sm:pt-0 w-full sm:w-auto">
                          <Button
                            size="sm"
                            onClick={() => reviewInvitationMutation.mutate({
                              requestId: inv.id,
                              action: "accepted",
                              projectId: inv.project_id
                            })}
                            disabled={reviewInvitationMutation.isPending}
                            className="h-8 text-[11px] font-bold bg-success hover:bg-success/90 text-success-foreground"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reviewInvitationMutation.mutate({
                              requestId: inv.id,
                              action: "rejected",
                              projectId: inv.project_id
                            })}
                            disabled={reviewInvitationMutation.isPending}
                            className="h-8 text-[11px] font-semibold border-destructive/20 text-destructive hover:bg-destructive/5"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. My Sent Requests Section */}
                <div className="card-campus overflow-hidden bg-card border border-border/80">
                  <div className="p-4 border-b border-border/40">
                    <h3 className="font-bold text-foreground text-sm sm:text-base">Applications Sent ({myApplications.filter(r => r.status !== "invited").length})</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Track the status of your join requests to other teams.</p>
                  </div>
                  <div className="divide-y divide-border/40">
                    {myApplications.filter(r => r.status !== "invited").length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-xs italic">
                        No requests sent yet. Search recruiting projects under Explore.
                      </div>
                    ) : myApplications.filter(r => r.status !== "invited").map((app, i) => (
                      <div key={app.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in" style={{ animationDelay: `${0.03 * i}s` }}>
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-foreground">"{app.project_title}"</h4>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                            PREFERRED ROLE: <span className="text-foreground">{app.preferred_role || "Teammate"}</span>
                          </p>
                          {app.message && <p className="text-xs text-muted-foreground truncate italic">"{app.message}"</p>}
                          <p className="text-[9px] text-muted-foreground/70">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 self-end sm:self-center">
                          {app.status === "pending" ? (
                            <>
                              <Badge className="bg-amber-500/15 border-amber-500/35 text-amber-500 hover:bg-amber-500/15" variant="outline">
                                Pending review
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => cancelRequestMutation.mutate(app.id)}
                                className="h-8 text-[11px] font-semibold text-muted-foreground hover:text-destructive"
                              >
                                Withdraw
                              </Button>
                            </>
                          ) : (
                            <Badge className={
                              app.status === "accepted" 
                                ? "bg-success/15 border-success/35 text-success hover:bg-success/15" 
                                : "bg-destructive/15 border-destructive/35 text-destructive hover:bg-destructive/15"
                            } variant="outline">
                              {app.status === "accepted" ? "Approved & Joined" : "Declined"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: MY TEAMS */}
            {activeTab === 4 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedProjects.map((proj, i) => {
                  const memberCount = proj.project_members?.length || 0;
                  const isJoined = myMemberships.includes(proj.id);
                  const isOwner = proj.user_id === user?.id;
                  const status = statusConfig[proj.status] || statusConfig.archived;

                  return (
                    <div key={proj.id} className="card-premium-light overflow-hidden flex flex-col animate-fade-in" style={{ animationDelay: `${0.03 * i}s` }}>
                      <div className="h-1.5 gradient-primary" />
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {proj.status.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="font-bold text-foreground mb-1.5">{proj.title}</h3>
                        {proj.description && <p className="text-sm text-muted-foreground mb-3 flex-1 line-clamp-2">{proj.description}</p>}
                        {proj.tags && proj.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {proj.tags.map((tag) => (
                              <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <Users className="w-3.5 h-3.5" /> {memberCount} member{memberCount !== 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setShareTarget({ id: proj.id, title: proj.title })}
                              className="h-8 w-8 rounded-lg border border-border/60 flex items-center justify-center hover:bg-muted transition-all"
                            >
                              <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            {isOwner ? (
                              <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10 font-bold py-1 px-2.5 rounded-lg text-xs">
                                Owner
                              </Badge>
                            ) : isJoined ? (
                              <Badge variant="outline" className="text-success border-success/20 bg-success/5 font-bold py-1 px-2.5 rounded-lg text-xs">
                                Collaborator
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {displayedProjects.length === 0 && (
                  <div className="col-span-full card-premium-light p-12 text-center text-slate-500">
                    <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold">You haven't posted any projects or joined any teams yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Search active projects under Explore or post your own project to start building.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* SHARE PROJECT DIALOG */}
      {shareTarget && (
        <ShareDialog
          open={!!shareTarget}
          onOpenChange={(open) => !open && setShareTarget(null)}
          shareType="project"
          referenceId={shareTarget.id}
          referenceTitle={shareTarget.title}
        />
      )}

      {/* APPLY TO JOIN DIALOG */}
      {applyTarget && (
        <Dialog open={!!applyTarget} onOpenChange={(open) => !open && setApplyTarget(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Apply to Join Team</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Apply to join the team for <span className="font-semibold text-foreground">"{applyTarget.title}"</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground block">Preferred Role</label>
                <select
                  value={applyRole}
                  onChange={(e) => setApplyRole(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border/60 bg-muted/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25"
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground block">Pitch Message (Cover Letter)</label>
                <textarea
                  placeholder="Introduce yourself! What relevant skills, experience, or passion can you offer this team?"
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setApplyTarget(null)} className="text-xs font-semibold">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => applyMutation.mutate({
                    projectId: applyTarget.id,
                    role: applyRole,
                    message: applyMessage
                  })}
                  className="text-xs font-semibold shadow-md px-5"
                  disabled={applyMutation.isPending || !applyMessage.trim()}
                >
                  {applyMutation.isPending ? "Submitting..." : "Send Join Application"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* INVITE USER TO PROJECT DIALOG */}
      {inviteTarget && (
        <Dialog open={!!inviteTarget} onOpenChange={(open) => !open && setInviteTarget(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Invite to Project Team</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Select one of your projects to invite <span className="font-semibold text-foreground">"{inviteTarget.userName}"</span> to join.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground block">Select Project *</label>
                <select
                  value={inviteProjectId}
                  onChange={(e) => setInviteProjectId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border/60 bg-muted/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25"
                >
                  <option value="" disabled>Select your project</option>
                  {myOwnedProjects.map(proj => (
                    <option key={proj.id} value={proj.id}>{proj.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setInviteTarget(null)} className="text-xs font-semibold">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={inviteMutation.isPending || !inviteProjectId}
                  onClick={() => inviteMutation.mutate({
                    projectId: inviteProjectId,
                    inviteeId: inviteTarget.userId
                  })}
                  className="text-xs font-semibold shadow-md px-5"
                >
                  {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </AppLayout>
  );
};

export default Projects;
