import SEO from "@/components/SEO";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, PlayCircle, Download, Plus, Grid3X3, Upload, Search, Share2, Lock, GraduationCap, Globe, X } from "lucide-react";
import { useState, useRef } from "react";
import ShareDialog from "@/components/ShareDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const filters = [
  { label: "All Resources", icon: Grid3X3, value: "" },
  { label: "Notes", icon: FileText, value: "notes" },
  { label: "Past Papers", icon: BookOpen, value: "past_paper" },
  { label: "Tutorials", icon: PlayCircle, value: "tutorial" },
];

const categoryConfig: Record<string, { color: string; gradient: string; icon: typeof FileText }> = {
  notes: { color: "bg-primary/10 text-primary", gradient: "from-primary/5 to-accent", icon: FileText },
  past_paper: { color: "bg-success/10 text-success", gradient: "from-success/5 to-success/10", icon: BookOpen },
  tutorial: { color: "bg-warning/10 text-warning", gradient: "from-warning/5 to-warning/10", icon: PlayCircle },
};

const Resources = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", courseCode: "", category: "notes" });
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shareTarget, setShareTarget] = useState<{ id: string; title: string; type: "resource" } | null>(null);
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

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["resources", activeFilter, user?.id],
    queryFn: async () => {
      let query = supabase.from("resources").select("*").order("created_at", { ascending: false });
      if (activeFilter) {
        query = query.eq("category", activeFilter);
      }
      const { data, error } = await query;
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

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select a file");
      const filePath = `${user!.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("resources").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("resources").insert({
        title: form.title,
        subject: form.subject,
        course_code: form.courseCode || null,
        category: form.category,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        user_id: user!.id,
        privacy_type: privacyType,
        allowed_emails: allowedEmails,
      });
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-resources"] });
      toast.success("Resource uploaded!");
      setDialogOpen(false);
      setForm({ title: "", subject: "", courseCode: "", category: "notes" });
      setFile(null);
      setPrivacyType("all");
      setAllowedEmails([]);
      setEmailInput("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("resources").download(filePath);
    if (error) {
      toast.error("Download failed");
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <SEO title="Resources" description="Upload and download study notes, past papers, and tutorials on StudentHub. Share knowledge with fellow students." canonical="/resources" keywords="study notes, past papers, student resources, studenthub resources, course materials" />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 animate-fade-in">
          <div className="page-header mb-0">
            <h1 className="text-3xl sm:text-4xl font-medium text-[#0F172A] tracking-tight font-serif-elegant">Study Resources Library</h1>
            <p className="text-sm text-slate-500 mt-1.5">Access collaborative notes, past papers, and video tutorials</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5 font-semibold shadow-sm rounded-full bg-slate-900 hover:bg-slate-800 text-white h-10 px-5"><Plus className="w-4 h-4" /> Upload Resource</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-[#0F172A]">Upload Resource</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); uploadMutation.mutate(); }} className="space-y-4 mt-2">
                <input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Subject *" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
                  <input placeholder="Course code (e.g. CS301)" value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
                </div>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all">
                  <option value="notes">Notes</option>
                  <option value="past_paper">Past Paper</option>
                  <option value="tutorial">Tutorial</option>
                </select>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center cursor-pointer hover:bg-muted/30 hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl gradient-card flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-5 h-5 text-primary/60" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {file ? file.name : "Click to select a file"}
                  </p>
                  {file && <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>

                {/* Privacy visiblity settings */}
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
                      All logged-in StudentHub students can find and view this resource.
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

                <Button type="submit" className="w-full h-11 font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white" disabled={uploadMutation.isPending || !file}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload Resource"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.value)}
              className={`filter-pill ${activeFilter === f.value ? "filter-pill-active" : "filter-pill-inactive"}`}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resources.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <div className="w-16 h-16 rounded-2xl gradient-card flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-primary/40" />
            </div>
            <p className="font-bold text-[#0F172A] text-lg">No resources yet</p>
            <p className="text-sm text-slate-500 mt-1 mb-6">Upload the first study resource for your peers!</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="w-4 h-4" /> Upload First Resource
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            {resources.map((res, i) => {
              const config = categoryConfig[res.category] || categoryConfig.notes;
              const Icon = config.icon;
              return (
                <div key={res.id} className="card-premium-light overflow-hidden animate-fade-in flex flex-col" style={{ animationDelay: `${0.05 * i}s` }}>
                  <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5 text-slate-700" />
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${config.color}`}>
                        {res.category.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A] mb-1 line-clamp-2 leading-snug">{res.title}</h3>
                    <p className="text-xs text-slate-500 mb-4">{res.subject} {res.course_code && `| ${res.course_code}`}</p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">{new Date(res.created_at).toLocaleDateString()}</p>
                        {res.file_size && <p className="text-[10px] text-slate-400">{(res.file_size / 1024 / 1024).toFixed(1)} MB</p>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShareTarget({ id: res.id, title: res.title, type: "resource" as const })}
                          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                          <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        <button
                          onClick={() => handleDownload(res.file_path, res.file_name)}
                          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                        </button>
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
          shareType="resource"
          referenceId={shareTarget.id}
          referenceTitle={shareTarget.title}
        />
      )}
    </AppLayout>
  );
};

export default Resources;
