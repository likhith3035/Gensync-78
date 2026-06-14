import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2, Link2, KeyRound, Copy, Check, Plus, X, Send, Globe, Lock, Code, FileText as NoteIcon, Timer, GraduationCap
} from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareType: "resource" | "project" | "opportunity" | "custom";
  referenceId?: string;
  referenceTitle?: string;
}

const inputClass = "oneui-input";
const textareaClass = "w-full px-5 py-3.5 rounded-2xl bg-muted/60 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:bg-card transition-all duration-300 resize-none";

const ShareDialog = ({ open, onOpenChange, shareType, referenceId, referenceTitle }: ShareDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [accessMethod, setAccessMethod] = useState<"link" | "code" | "both">("both");
  const [customTitle, setCustomTitle] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [customLinks, setCustomLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [contentType, setContentType] = useState<"text" | "code">("text");
  const [expiration, setExpiration] = useState<"none" | "1h" | "1d" | "1w">("none");
  const [privacyType, setPrivacyType] = useState<"all" | "college" | "selected">("all");
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [result, setResult] = useState<{ token: string; code: string } | null>(null);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  const CONTENT_LIMIT = 50000; // ~50KB

  const addAllowedEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (trimmed && !allowedEmails.includes(trimmed) && trimmed.includes("@")) {
      setAllowedEmails([...allowedEmails, trimmed]);
      setEmailInput("");
    }
  };

  const createShare = useMutation({
    mutationFn: async () => {
      let expiresAt: string | null = null;
      if (expiration !== "none") {
        const now = new Date();
        if (expiration === "1h") now.setHours(now.getHours() + 1);
        else if (expiration === "1d") now.setDate(now.getDate() + 1);
        else if (expiration === "1w") now.setDate(now.getDate() + 7);
        expiresAt = now.toISOString();
      }

      const { data, error } = await supabase
        .from("shares")
        .insert({
          user_id: user!.id,
          share_type: shareType,
          reference_id: referenceId || null,
          custom_title: shareType === "custom" ? customTitle : referenceTitle || null,
          custom_message: customMessage || null,
          custom_links: customLinks.length > 0 ? customLinks : [],
          custom_content: customContent || null,
          content_type: contentType,
          access_method: accessMethod,
          expires_at: expiresAt,
          privacy_type: privacyType,
          allowed_emails: allowedEmails,
        })
        .select("share_token, access_code")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResult({ token: data.share_token, code: data.access_code || "" });
      queryClient.invalidateQueries({ queryKey: ["my-shares"] });
      toast.success("Share created!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const shareUrl = result ? `${window.location.origin}/shared/${result.token}` : "";

  const copyToClipboard = async (text: string, type: "link" | "code") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const addLink = () => {
    const trimmed = newLink.trim();
    if (trimmed && !customLinks.includes(trimmed)) {
      setCustomLinks([...customLinks, trimmed]);
      setNewLink("");
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setResult(null);
      setCustomTitle("");
      setCustomMessage("");
      setCustomLinks([]);
      setNewLink("");
      setCustomContent("");
      setContentType("text");
      setExpiration("none");
      setCopied(null);
      setPrivacyType("all");
      setAllowedEmails([]);
      setEmailInput("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            {result ? "Share Created!" : "Share with Students"}
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 mt-2">
            {/* What's being shared */}
            {shareType !== "custom" && referenceTitle && (
              <div className="p-3 rounded-xl bg-accent/50 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Sharing</p>
                <p className="text-sm font-semibold text-foreground">{referenceTitle}</p>
                <Badge variant="secondary" className="mt-1.5 text-[10px]">{shareType}</Badge>
              </div>
            )}

            {/* Custom share fields */}
            {shareType === "custom" && (
              <>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Title *</label>
                  <input
                    placeholder="What are you sharing?"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Links</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      placeholder="Paste a link"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                      className={inputClass}
                    />
                    <Button type="button" size="sm" onClick={addLink} className="shrink-0 h-11 px-4">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {customLinks.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs">
                        <Link2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate flex-1 text-foreground">{link}</span>
                        <button onClick={() => setCustomLinks(customLinks.filter((_, j) => j !== i))}>
                          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Code / Notes Content */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Share Code or Notes (optional)
              </label>
              <div className="flex gap-2 mb-2">
                {[
                  { val: "text" as const, icon: NoteIcon, label: "Notes" },
                  { val: "code" as const, icon: Code, label: "Code" },
                ].map(({ val, icon: Icon, label }) => (
                  <button
                    key={val}
                    onClick={() => setContentType(val)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      contentType === val
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/60 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
              <textarea
                placeholder={contentType === "code" ? "Paste your code here..." : "Write your notes here..."}
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value.slice(0, CONTENT_LIMIT))}
                rows={5}
                className={`${textareaClass} ${contentType === "code" ? "font-mono text-xs" : ""}`}
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {customContent.length.toLocaleString()} / {CONTENT_LIMIT.toLocaleString()} chars
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Message (optional)</label>
              <textarea
                placeholder="Add a note for the recipient..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={2}
                maxLength={500}
                className={textareaClass}
              />
            </div>

            {/* Access method */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Access Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: "link" as const, icon: Globe, label: "Link Only" },
                  { val: "code" as const, icon: Lock, label: "Code Only" },
                  { val: "both" as const, icon: Share2, label: "Both" },
                ].map(({ val, icon: Icon, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAccessMethod(val)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      accessMethod === val
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/60 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy / Visibility */}
            <div className="space-y-2.5">
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
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      privacyType === val
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/60 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {privacyType === "all" && (
                <p className="text-[11px] text-muted-foreground/80 leading-normal">
                  Anyone with the link or access code can view this shared content.
                </p>
              )}

              {privacyType === "college" && (
                <p className="text-[11px] text-muted-foreground/80 leading-normal">
                  Only authenticated users with student email domains (@nbkrist.org, @srmap.edu.in, or .edu/.edu.in educational domains) can view.
                </p>
              )}

              {privacyType === "selected" && (
                <div className="space-y-2 mt-2 p-3.5 rounded-2xl bg-muted/40 border border-border/40 animate-fade-in">
                  <p className="text-[11px] text-muted-foreground/80 leading-normal mb-2">
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
                      className={`${inputClass} flex-1 h-10`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addAllowedEmail}
                      className="shrink-0 h-10 px-3.5 rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2 max-h-[120px] overflow-y-auto p-1">
                    {allowedEmails.map((email, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="gap-1 py-1 pl-2.5 pr-1.5 rounded-lg text-[11px] font-medium bg-background text-foreground border border-border/80"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => setAllowedEmails(allowedEmails.filter((_, idx) => idx !== i))}
                          className="rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </Badge>
                    ))}
                    {allowedEmails.length === 0 && (
                      <span className="text-[11px] text-muted-foreground/60 italic">No email addresses added yet.</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Expiration */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" /> Expires After
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: "none" as const, label: "Never" },
                  { val: "1h" as const, label: "1 Hour" },
                  { val: "1d" as const, label: "1 Day" },
                  { val: "1w" as const, label: "1 Week" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setExpiration(val)}
                    className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      expiration === val
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/60 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full gap-1.5 font-semibold"
              onClick={() => createShare.mutate()}
              disabled={createShare.isPending || (shareType === "custom" && !customTitle.trim())}
            >
              <Send className="w-4 h-4" />
              {createShare.isPending ? "Creating..." : "Create Share"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="p-4 rounded-xl bg-success/5 border border-success/20 text-center">
              <Check className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Your share is ready!</p>
              <p className="text-xs text-muted-foreground mt-1">Send the link or code to your classmates</p>
            </div>

            {/* Share link */}
            {(accessMethod === "link" || accessMethod === "both") && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" /> Share Link
                </label>
                <div className="flex gap-2">
                  <input value={shareUrl} readOnly className={`${inputClass} text-xs`} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-11 px-4"
                    onClick={() => copyToClipboard(shareUrl, "link")}
                  >
                    {copied === "link" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Access code */}
            {(accessMethod === "code" || accessMethod === "both") && result.code && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> Access Code
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 h-11 flex items-center justify-center rounded-xl border border-border/60 bg-muted/30 font-mono text-2xl font-extrabold tracking-[0.4em] text-primary">
                    {result.code}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-11 px-4"
                    onClick={() => copyToClipboard(result.code, "code")}
                  >
                    {copied === "code" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
