import SEO from "@/components/SEO";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Calendar, Code, Plus, Sparkles, MapPin, Building2, Briefcase, GraduationCap, Zap, Award, Share2, Lock, Globe, X, ExternalLink, Link2 } from "lucide-react";
import { useState } from "react";
import ShareDialog from "@/components/ShareDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const categories = ["internship", "hackathon", "workshop", "scholarship"] as const;

const categoryConfig: Record<string, { color: string; icon: typeof Code; gradient: string }> = {
  internship: { color: "bg-primary/10 text-primary", icon: Briefcase, gradient: "from-primary/5 via-primary/10 to-accent" },
  hackathon: { color: "bg-accent text-accent-foreground", icon: Zap, gradient: "from-accent via-accent to-primary/5" },
  workshop: { color: "bg-warning/10 text-warning", icon: GraduationCap, gradient: "from-warning/5 via-warning/10 to-warning/5" },
  scholarship: { color: "bg-success/10 text-success", icon: Award, gradient: "from-success/5 via-success/10 to-success/5" },
};

const categoryIcons: Record<string, typeof Code> = {
  internship: Briefcase,
  hackathon: Zap,
  workshop: GraduationCap,
  scholarship: Award,
};

import { useSearchParams } from "react-router-dom";

const Opportunities = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", organization: "", location: "", deadline: "", category: "internship" as string, description: "", applyLink: "" });
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

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["opportunities", selectedCategories, user?.id, searchQuery],
    queryFn: async () => {
      let query = supabase.from("opportunities").select("*").order("created_at", { ascending: false });
      if (selectedCategories.length > 0) {
        query = query.in("category", selectedCategories);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      // Filter based on privacy settings
      const filtered = data.filter((res: any) => {
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

      if (searchQuery) {
        const lowerSearch = searchQuery.toLowerCase().trim();
        return filtered.filter((opp: any) => 
          opp.title.toLowerCase().includes(lowerSearch) || 
          opp.organization.toLowerCase().includes(lowerSearch) || 
          opp.description?.toLowerCase().includes(lowerSearch)
        );
      }
      return filtered;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("opportunities").insert({
        title: form.title,
        organization: form.organization,
        location: form.location || null,
        deadline: form.deadline || null,
        category: form.category,
        description: form.description || null,
        apply_link: form.applyLink || null,
        user_id: user!.id,
        privacy_type: privacyType,
        allowed_emails: allowedEmails,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-opportunities"] });
      toast.success("Opportunity posted!");
      setDialogOpen(false);
      setForm({ title: "", organization: "", location: "", deadline: "", category: "internship", description: "", applyLink: "" });
      setPrivacyType("all");
      setAllowedEmails([]);
      setEmailInput("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <AppLayout>
      <SEO title="Opportunities" description="Browse and post internships, hackathons, workshops, and scholarships on StudentHub. Find your next career opportunity." canonical="/opportunities" keywords="internships, hackathons, scholarships, student opportunities, studenthub" />
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 animate-fade-in">
          <div className="page-header mb-0">
            <h1 className="text-3xl sm:text-4xl font-medium text-[#0F172A] tracking-tight font-serif-elegant">Explore Opportunities</h1>
            <p className="text-sm text-slate-500 mt-1.5">Discover handpicked programs for your career growth</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5 font-semibold shadow-sm rounded-full bg-slate-900 hover:bg-slate-800 text-white h-10 px-5"><Plus className="w-4 h-4" /> Post Opportunity</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Post an Opportunity</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4 mt-2">
                <input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
                <input placeholder="Organization *" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} required className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Location (optional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
                  <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
                </div>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all capitalize">
                  {categories.map((cat) => <option key={cat} value={cat} className="capitalize">{cat}</option>)}
                </select>
                <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none" />

                {/* Apply / Registration Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" /> Apply / Registration Link
                  </label>
                  <input
                    placeholder="https://forms.google.com/... or website URL"
                    value={form.applyLink}
                    onChange={(e) => setForm({ ...form, applyLink: e.target.value })}
                    type="url"
                    className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground/70">Paste the form or website link where students can apply. Users will be redirected here when they click "Apply Now".</p>
                </div>

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
                      All logged-in StudentHub students can find and view this opportunity.
                    </p>
                  )}

                  {privacyType === "college" && (
                    <p className="text-[10px] text-muted-foreground/85 leading-normal">
                      Only authenticated student emails (@nbkrist.org, @srmap.edu.in, .edu, .edu.in) can find and view.
                    </p>
                  )}

                  {privacyType === "selected" && (
                    <div className="space-y-2 mt-1.5 p-3 rounded-xl bg-muted/40 border border-border/40 animate-fade-in">
                      <p className="text-[10px] text-muted-foreground/85 leading-normal mb-1.5">
                        Only students with the specific email addresses added below can view.
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
                  {createMutation.isPending ? "Posting..." : "Post Opportunity"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {searchQuery && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between animate-fade-in">
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              Showing opportunities matching <span className="font-extrabold text-primary">"{searchQuery}"</span>
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

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {categories.map((cat) => {
            const isActive = selectedCategories.includes(cat);
            const config = categoryConfig[cat];
            const Icon = categoryIcons[cat];
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`filter-pill capitalize ${isActive ? "filter-pill-active" : "filter-pill-inactive"}`}
              >
                <Icon className="w-4 h-4" />
                {cat}s
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <div className="w-16 h-16 rounded-2xl gradient-card flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary/40" />
            </div>
            <p className="font-bold text-foreground text-lg">No opportunities yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Be the first to post an opportunity for students!</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="w-4 h-4" /> Post First Opportunity
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            {opportunities.map((opp, i) => {
              const config = categoryConfig[opp.category] || { color: "bg-muted text-muted-foreground", icon: Code, gradient: "from-muted to-muted" };
              const Icon = config.icon;
              return (
                <div key={opp.id} className="card-premium-light overflow-hidden animate-fade-in flex flex-col" style={{ animationDelay: `${0.05 * i}s` }}>
                  <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5 text-slate-700" />
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${config.color}`}>
                        {opp.category.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A] mb-1">{opp.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {opp.organization}</span>
                      {opp.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {opp.location}</span>}
                    </div>
                    {opp.description && <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{opp.description}</p>}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                      {opp.deadline ? (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(opp.deadline).toLocaleDateString()}
                        </span>
                      ) : <span />}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShareTarget({ id: opp.id, title: opp.title })}
                          className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                          <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        {opp.apply_link ? (
                          <a href={opp.apply_link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="font-semibold h-8 px-4 text-xs rounded-full bg-slate-900 hover:bg-slate-800 text-white gap-1.5">
                              Apply Now <ExternalLink className="w-3 h-3" />
                            </Button>
                          </a>
                        ) : (
                          <Button size="sm" className="font-semibold h-8 px-4 text-xs rounded-full bg-slate-900 hover:bg-slate-800 text-white" onClick={() => toast.info("No apply link provided for this opportunity.")}>Apply Now</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {shareTarget && (
        <ShareDialog
          open={!!shareTarget}
          onOpenChange={(open) => !open && setShareTarget(null)}
          shareType="opportunity"
          referenceId={shareTarget.id}
          referenceTitle={shareTarget.title}
        />
      )}
    </AppLayout>
  );
};

export default Opportunities;
