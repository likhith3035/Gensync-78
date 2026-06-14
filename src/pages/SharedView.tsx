import SEO from "@/components/SEO";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2, Link2, ExternalLink, GraduationCap, Briefcase, FolderKanban,
  BookOpen, FileText, Download, Clock, User, ArrowLeft, Code, Copy, Check, Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

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

const SharedView = () => {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const [share, setShare] = useState<any>(null);
  const [refData, setRefData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contentCopied, setContentCopied] = useState(false);

  useEffect(() => {
    const fetchShare = async () => {
      if (authLoading) return;
      if (!token) { setError("Invalid link"); setLoading(false); return; }

      const { data, error: fetchErr } = await supabase.rpc("get_share_by_token", { p_token: token });
      if (fetchErr || !data || (data as any[]).length === 0) {
        setError("This share link is invalid or has expired.");
        setLoading(false);
        return;
      }

      const shareData = (data as any[])[0];

      // Privacy Visibility checks
      const privacyType = shareData.privacy_type || "all";
      const allowedEmails = shareData.allowed_emails || [];

      if (privacyType === "college") {
        if (!user) {
          setError("auth_required_college");
          setShare(shareData);
          setLoading(false);
          return;
        }

        // Validate college email domain
        const emailStr = user.email || "";
        const lowerEmail = emailStr.toLowerCase().trim();
        const admins = ["kamilikhith@gmail.com", "uppumanogna@gmail.com", "luckylucky12h@gmail.com", "limaaiuse@gmail.com"];
        const isCollege = admins.includes(lowerEmail) || 
                          lowerEmail.endsWith("@nbkrist.org") || 
                          lowerEmail.endsWith("@srmap.edu.in") || 
                          lowerEmail.split("@")[1]?.endsWith(".edu") || 
                          lowerEmail.split("@")[1]?.endsWith(".edu.in");

        if (!isCollege) {
          setError("restricted_college");
          setShare(shareData);
          setLoading(false);
          return;
        }
      } else if (privacyType === "selected") {
        if (!user) {
          setError("auth_required_selected");
          setShare(shareData);
          setLoading(false);
          return;
        }

        const emailStr = user.email || "";
        const lowerEmail = emailStr.toLowerCase().trim();
        const isAllowed = allowedEmails.map((e: string) => e.toLowerCase().trim()).includes(lowerEmail);

        if (!isAllowed) {
          setError("restricted_selected");
          setShare(shareData);
          setLoading(false);
          return;
        }
      }

      setShare(shareData);

      // Increment views
      await supabase.rpc("increment_share_views", { p_share_id: shareData.id });

      // Fetch referenced content
      if (shareData.reference_id) {
        let table = "";
        if (shareData.share_type === "resource") table = "resources";
        else if (shareData.share_type === "project") table = "projects";
        else if (shareData.share_type === "opportunity") table = "opportunities";

        if (table) {
          const { data: ref } = await supabase.from(table as any).select("*").eq("id", shareData.reference_id).maybeSingle();
          setRefData(ref);
        }
      }

      setError("");
      setLoading(false);
    };

    fetchShare();
  }, [token, user, authLoading]);

  const isPrivacyError = ["auth_required_college", "restricted_college", "auth_required_selected", "restricted_selected"].includes(error);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if ((error && !isPrivacyError) || !share) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground mb-2">Share Not Found</h1>
          <p className="text-sm text-muted-foreground mb-6">{error || "This link may be invalid or expired."}</p>
          <Link to="/">
            <Button variant="outline" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = typeIcons[share.share_type] || FileText;
  const color = typeColors[share.share_type] || "bg-muted text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      <SEO title={share.custom_title || "Shared Content"} description={share.custom_message || "View shared content on StudentHub — the free student collaboration platform."} />
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 h-14 flex items-center px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-extrabold text-foreground">StudentHub</span>
        </Link>
        <div className="ml-auto">
          <Link to="/auth">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5">
              <User className="w-3.5 h-3.5" /> Sign In
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Share card */}
        <div className="card-campus overflow-hidden animate-fade-in">
          {/* Banner */}
          <div className="h-20 sm:h-24 gradient-primary relative">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-foreground/5 -translate-y-1/3 translate-x-1/4" />
          </div>

          <div className="px-4 sm:px-6 pb-6 -mt-8 relative z-10">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-4 border-card shadow-lg mb-4 ${color}`}>
              <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <Badge variant="secondary" className="text-[10px] mb-2">{share.share_type}</Badge>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
              {share.custom_title || `Shared ${share.share_type}`}
            </h1>

            {share.custom_message && (
              <div className="mt-3 p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/40">
                <p className="text-sm text-foreground leading-relaxed">{share.custom_message}</p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(share.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {isPrivacyError ? (
          <div className="card-campus p-6 sm:p-8 mt-4 text-center border border-primary/20 bg-primary/5 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary animate-pulse" />
            </div>

            {error === "auth_required_college" && (
              <>
                <h3 className="text-base font-bold text-foreground mb-2">College Student Access Only</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  The creator has restricted this share to verified student emails (@nbkrist.org, @srmap.edu.in, or general .edu/.edu.in domains). Please sign in to verify your access.
                </p>
                <Link to="/auth" state={{ from: window.location.pathname }}>
                  <Button className="gap-1.5 font-semibold h-11 px-5 rounded-xl">
                    <User className="w-4 h-4" /> Sign In to Verify
                  </Button>
                </Link>
              </>
            )}

            {error === "restricted_college" && (
              <>
                <h3 className="text-base font-bold text-destructive mb-2">Access Restricted</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  This shared resource is restricted to verified student emails. Your current email address (<span className="font-semibold text-foreground">{user?.email}</span>) is not permitted.
                </p>
                <Button variant="outline" onClick={() => supabase.auth.signOut()} className="gap-1.5 h-11 px-5 rounded-xl">
                  <ArrowLeft className="w-4 h-4" /> Sign Out / Change Account
                </Button>
              </>
            )}

            {error === "auth_required_selected" && (
              <>
                <h3 className="text-base font-bold text-foreground mb-2">Restricted Invited Access</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  The creator has restricted this share to specific email addresses. Please sign in to verify if your email is invited.
                </p>
                <Link to="/auth" state={{ from: window.location.pathname }}>
                  <Button className="gap-1.5 font-semibold h-11 px-5 rounded-xl">
                    <User className="w-4 h-4" /> Sign In to Verify
                  </Button>
                </Link>
              </>
            )}

            {error === "restricted_selected" && (
              <>
                <h3 className="text-base font-bold text-destructive mb-2">Access Denied</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Your email address (<span className="font-semibold text-foreground">{user?.email}</span>) is not authorized to view this share. Please contact the creator to request access.
                </p>
                <Button variant="outline" onClick={() => supabase.auth.signOut()} className="gap-1.5 h-11 px-5 rounded-xl">
                  <ArrowLeft className="w-4 h-4" /> Sign Out / Change Account
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Links */}
            {share.custom_links && share.custom_links.length > 0 && (
              <div className="card-campus p-4 sm:p-6 mt-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                  <Link2 className="w-4 h-4 text-primary" /> Shared Links
                </h3>
                <div className="space-y-2">
                  {share.custom_links.map((link: string, i: number) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/30 transition-colors group"
                    >
                      <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground truncate flex-1 group-hover:text-primary transition-colors">{link}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Code / Notes Content */}
            {share.custom_content && (
              <div className="card-campus p-4 sm:p-6 mt-4 animate-fade-in" style={{ animationDelay: "0.12s" }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    {share.content_type === "code" ? (
                      <Code className="w-4 h-4 text-primary" />
                    ) : (
                      <FileText className="w-4 h-4 text-primary" />
                    )}
                    {share.content_type === "code" ? "Shared Code" : "Shared Notes"}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-xs gap-1"
                    onClick={async () => {
                      await navigator.clipboard.writeText(share.custom_content);
                      setContentCopied(true);
                      setTimeout(() => setContentCopied(false), 2000);
                    }}
                  >
                    {contentCopied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </Button>
                </div>
                <div className={`rounded-xl p-4 overflow-x-auto border border-border/40 ${
                  share.content_type === "code"
                    ? "bg-zinc-950 text-emerald-400 font-mono text-xs leading-relaxed"
                    : "bg-muted/30 text-foreground text-sm leading-relaxed whitespace-pre-wrap"
                }`}>
                  <pre className="whitespace-pre-wrap break-words">{share.custom_content}</pre>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {share.custom_content.length.toLocaleString()} characters
                </p>
              </div>
            )}

            {refData && (
              <div className="card-campus p-4 sm:p-6 mt-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-primary" /> {share.share_type.charAt(0).toUpperCase() + share.share_type.slice(1)} Details
                </h3>

                {share.share_type === "resource" && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">{refData.title}</p>
                    <p className="text-xs text-muted-foreground">Subject: {refData.subject} {refData.course_code && `| ${refData.course_code}`}</p>
                    <p className="text-xs text-muted-foreground">File: {refData.file_name}</p>
                    {refData.file_path && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 mt-2"
                        onClick={() => {
                          const { data } = supabase.storage.from("resources").getPublicUrl(refData.file_path);
                          window.open(data.publicUrl, "_blank");
                        }}
                      >
                        <Download className="w-3.5 h-3.5" /> Download File
                      </Button>
                    )}
                  </div>
                )}

                {share.share_type === "project" && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">{refData.title}</p>
                    {refData.description && <p className="text-xs text-muted-foreground">{refData.description}</p>}
                    <Badge variant="secondary" className="text-[10px]">{refData.status?.toUpperCase()}</Badge>
                    {refData.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {refData.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {share.share_type === "opportunity" && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">{refData.title}</p>
                    <p className="text-xs text-muted-foreground">{refData.organization} {refData.location && `• ${refData.location}`}</p>
                    {refData.description && <p className="text-xs text-muted-foreground mt-1">{refData.description}</p>}
                    <Badge variant="secondary" className="text-[10px]">{refData.category?.toUpperCase()}</Badge>
                    {refData.deadline && (
                      <p className="text-xs text-muted-foreground mt-1">Deadline: {new Date(refData.deadline).toLocaleDateString()}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <p className="text-xs text-muted-foreground mb-3">Want to explore more?</p>
          <Link to="/auth">
            <Button className="gap-1.5 font-semibold">
              <GraduationCap className="w-4 h-4" /> Join StudentHub
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SharedView;
