import SEO from "@/components/SEO";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2, Plus, Link2, KeyRound, Copy, Check, Trash2, Eye, Clock,
  Briefcase, FolderKanban, BookOpen, FileText, ExternalLink, Timer
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import ShareDialog from "@/components/ShareDialog";

const typeIcons: Record<string, any> = {
  resource: BookOpen,
  project: FolderKanban,
  opportunity: Briefcase,
  custom: FileText,
};

const typeColors: Record<string, string> = {
  resource: "bg-success/10 text-success",
  project: "bg-accent text-accent-foreground",
  opportunity: "bg-primary/10 text-primary",
  custom: "bg-warning/10 text-warning",
};

const Shares = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");

  const { data: shares = [], isLoading } = useQuery({
    queryKey: ["my-shares", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shares")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteShare = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shares").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shares"] });
      toast.success("Share deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCodeLookup = async () => {
    if (!codeInput.trim()) return;
    const { data, error } = await supabase.rpc("get_share_by_code", { p_code: codeInput.trim() });
    if (error || !data || (data as any[]).length === 0) {
      toast.error("Invalid or expired code");
      return;
    }
    const share = (data as any[])[0];
    window.open(`${window.location.origin}/shared/${share.share_token}`, "_blank");
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(Math.abs(diff) / 60000);
    const past = diff > 0;
    if (mins < 1) return past ? "Just now" : "< 1m";
    if (mins < 60) return past ? `${mins}m ago` : `in ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return past ? `${hrs}h ago` : `in ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return past ? `${days}d ago` : `in ${days}d`;
  };

  return (
    <AppLayout>
      <SEO title="My Shares" description="Manage your shared content on StudentHub — view share links, access codes, and view counts." canonical="/shares" noindex />
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Share2 className="w-6 h-6 text-primary" /> Sharing Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Share resources, projects, and more with classmates</p>
          </div>
          <Button className="gap-1.5 font-semibold shadow-md self-start" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> Create Share
          </Button>
        </div>

        {/* Access with code */}
        <div className="card-campus p-4 sm:p-6">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <KeyRound className="w-4 h-4 text-primary" /> Access Shared Content
          </h3>
          <p className="text-xs text-muted-foreground mb-3">Got a code from a classmate? Enter it below to access their shared content.</p>
          <div className="flex gap-2">
            <input
              placeholder="Enter 6-digit code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleCodeLookup()}
              maxLength={6}
              className="flex-1 oneui-input font-mono text-center tracking-[0.3em]"
            />
            <Button onClick={handleCodeLookup} disabled={codeInput.length < 6} className="shrink-0">
              <ExternalLink className="w-4 h-4 mr-1.5" /> Access
            </Button>
          </div>
        </div>

        {/* My Shares */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" /> Your Shares ({shares.length})
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : shares.length === 0 ? (
            <div className="card-campus p-10 text-center">
              <Share2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-foreground">No shares yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first share to start collaborating!</p>
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> Create Share
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {shares.map((share: any) => {
                const Icon = typeIcons[share.share_type] || FileText;
                const color = typeColors[share.share_type] || "bg-muted text-muted-foreground";
                const shareUrl = `${window.location.origin}/shared/${share.share_token}`;

                return (
                  <div key={share.id} className="card-campus p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-foreground text-sm truncate">
                              {share.custom_title || `Shared ${share.share_type}`}
                            </h4>
                            {share.custom_message && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{share.custom_message}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-[10px] shrink-0">{share.share_type}</Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                            <Eye className="w-3 h-3" /> {share.view_count} views
                          </span>
                          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /> {timeAgo(share.created_at)}
                          </span>
                          {share.access_method !== "link" && share.access_code && (
                            <span className="flex items-center gap-1 text-[10px] sm:text-xs font-mono text-primary font-bold">
                              <KeyRound className="w-3 h-3" /> {share.access_code}
                            </span>
                          )}
                          {share.expires_at && (
                            <span className={`flex items-center gap-1 text-[10px] sm:text-xs ${
                              new Date(share.expires_at) < new Date() ? "text-destructive" : "text-muted-foreground"
                            }`}>
                              <Timer className="w-3 h-3" />
                              {new Date(share.expires_at) < new Date()
                                ? "Expired"
                                : timeAgo(share.expires_at)}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {(share.access_method === "link" || share.access_method === "both") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-[10px] sm:text-xs font-semibold gap-1"
                              onClick={() => copyToClipboard(shareUrl, share.id + "-link")}
                            >
                              {copiedId === share.id + "-link" ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                              <span className="hidden sm:inline">Copy Link</span>
                            </Button>
                          )}
                          {(share.access_method === "code" || share.access_method === "both") && share.access_code && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-[10px] sm:text-xs font-semibold gap-1"
                              onClick={() => copyToClipboard(share.access_code, share.id + "-code")}
                            >
                              {copiedId === share.id + "-code" ? <Check className="w-3 h-3 text-success" /> : <KeyRound className="w-3 h-3" />}
                              <span className="hidden sm:inline">Copy Code</span>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-[10px] sm:text-xs font-semibold gap-1 text-destructive border-destructive/20 hover:bg-destructive/5"
                            onClick={() => { if (confirm("Delete this share?")) deleteShare.mutate(share.id); }}
                          >
                            <Trash2 className="w-3 h-3" /> <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ShareDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        shareType="custom"
      />
    </AppLayout>
  );
};

export default Shares;
