import SEO from "@/components/SEO";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Rocket, Users, Tag, ArrowRight, Share2, Lock, GraduationCap, Globe, X } from "lucide-react";
import { useState } from "react";
import ShareDialog from "@/components/ShareDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { color: string; dot: string }> = {
  recruiting: { color: "bg-primary/10 text-primary", dot: "bg-primary" },
  planning: { color: "bg-accent text-accent-foreground", dot: "bg-accent-foreground" },
  active: { color: "bg-success/10 text-success", dot: "bg-success" },
  archived: { color: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  urgent: { color: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

const tabs = ["Explore Projects", "My Teams"];

const Projects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tags: "", status: "recruiting" });
  const [shareTarget, setShareTarget] = useState<{ id: string; title: string } | null>(null);
  const [privacyType, setPrivacyType] = useState<"all" | "college" | "selected">("all");
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  const addAllowedEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (trimmed && !allowedEmails.includes(trimmed) && trimmed.includes("@")) {
      setAllowedEmails([...allowedEmails, trimmed]);
      setEmailInput("");
    }
  };

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, project_members(user_id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      // Filter based on privacy settings
      return data.filter((res: any) => {
        // Owner can always see it
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

  const joinMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase.from("project_members").insert({
        project_id: projectId,
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["my-memberships"] });
      toast.success("Joined the team!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const displayedProjects = activeTab === 1
    ? projects.filter((p) => p.user_id === user?.id || myMemberships.includes(p.id))
    : projects;

  return (
    <AppLayout>
      <SEO title="Projects" description="Create and join student projects on StudentHub. Collaborate with teammates, track progress, and build your portfolio." canonical="/projects" keywords="student projects, collaboration, team projects, studenthub projects" />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 animate-fade-in">
          <div className="page-header mb-0">
            <h1 className="page-title">Project Collaboration Hub</h1>
            <p className="page-subtitle">Find teams, build together, and ship real projects</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5 font-semibold shadow-md"><Plus className="w-4 h-4" /> Post a Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
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
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border/60 text-muted-foreground hover:border-primary/30"
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

                <Button type="submit" className="w-full h-11 font-semibold" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Posting..." : "Post Project"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === i
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedProjects.map((proj, i) => {
              const memberCount = proj.project_members?.length || 0;
              const isJoined = myMemberships.includes(proj.id);
              const isOwner = proj.user_id === user?.id;
              const status = statusConfig[proj.status] || statusConfig.archived;

              return (
                <div key={proj.id} className="card-campus overflow-hidden flex flex-col animate-fade-in" style={{ animationDelay: `${0.05 * i}s` }}>
                  <div className="h-2 gradient-primary" />
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
                          <span className="text-xs text-muted-foreground font-semibold">Your project</span>
                        ) : isJoined ? (
                          <span className="text-xs text-success font-bold flex items-center gap-1">✓ Joined</span>
                        ) : (
                          <Button size="sm" onClick={() => joinMutation.mutate(proj.id)} disabled={joinMutation.isPending} className="h-8 px-4 text-xs font-semibold">
                            Join Team
                          </Button>
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
      </div>
      {shareTarget && (
        <ShareDialog
          open={!!shareTarget}
          onOpenChange={(open) => !open && setShareTarget(null)}
          shareType="project"
          referenceId={shareTarget.id}
          referenceTitle={shareTarget.title}
        />
      )}
    </AppLayout>
  );
};

export default Projects;
