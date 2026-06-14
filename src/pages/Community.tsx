import SEO from "@/components/SEO";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { rtdb } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";
import { 
  ref, 
  push, 
  set, 
  onValue, 
  remove, 
  update 
} from "firebase/database";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  MessageSquare, ThumbsUp, Plus, Search, X, Users, MessageCircle, Clock, Send, ChevronRight, Lock, Globe, Building, CalendarDays,
  Trash2, Share2, UserPlus, ExternalLink, Paperclip
} from "lucide-react";

const categories = [
  { val: "all", label: "All Discussions" },
  { val: "general", label: "General" },
  { val: "academics", label: "Academics" },
  { val: "career", label: "Career & Internships" },
  { val: "tech", label: "Technology" },
  { val: "campus_life", label: "Campus Life" },
];

const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
  general: { bg: "bg-primary/10 text-primary", text: "text-primary", gradient: "from-primary/5 to-accent" },
  academics: { bg: "bg-emerald-500/10 text-emerald-500", text: "text-emerald-500", gradient: "from-emerald-500/5 to-emerald-500/10" },
  career: { bg: "bg-sky-500/10 text-sky-500", text: "text-sky-500", gradient: "from-sky-500/5 to-sky-500/10" },
  tech: { bg: "bg-indigo-500/10 text-indigo-500", text: "text-indigo-500", gradient: "from-indigo-500/5 to-indigo-500/10" },
  campus_life: { bg: "bg-amber-500/10 text-amber-500", text: "text-amber-500", gradient: "from-amber-500/5 to-amber-500/10" },
};

const admins = ["kamilikhith@gmail.com", "uppumanogna@gmail.com", "luckylucky12h@gmail.com", "limaaiuse@gmail.com"];

interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  user_email: string;
  user_name: string;
  upvotes_count: number;
  upvoted_users: string[];
  comments_count: number;
  created_at: any;
  visibility?: "all" | "college" | "selected" | "event";
  college_domain?: string;
  allowed_emails?: string[];
  event_id?: string;
  event_title?: string;
}

interface Comment {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  content: string;
  created_at: any;
  resource_title?: string;
  resource_url?: string;
}


const Community = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);

  // Gated Discussion States
  const [visibility, setVisibility] = useState<"all" | "college" | "selected" | "event">("all");
  const [invitedEmailsStr, setInvitedEmailsStr] = useState("");
  const [linkedEventId, setLinkedEventId] = useState("");
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [userRsvps, setUserRsvps] = useState<string[]>([]);

  // Resource Attachment States
  const [attachResource, setAttachResource] = useState(false);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");

  // Manage Invite States
  const [addPeopleOpen, setAddPeopleOpen] = useState(false);
  const [newEmailsStr, setNewEmailsStr] = useState("");

  // Detailed view state
  const [selectedPost, setSelectedPost] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch campus events and user RSVPs from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchEventsAndRsvps = async () => {
      try {
        // Fetch active events
        const { data: eventsData, error: eventsErr } = await supabase
          .from("events")
          .select("id, title")
          .order("event_date", { ascending: true });
        
        if (eventsErr) throw eventsErr;
        setEvents(eventsData || []);

        // Fetch current user RSVPs
        const { data: rsvpsData, error: rsvpsErr } = await supabase
          .from("event_rsvps")
          .select("event_id")
          .eq("user_id", user.id);
        
        if (rsvpsErr) throw rsvpsErr;
        setUserRsvps(rsvpsData?.map((r: any) => r.event_id) || []);
      } catch (err: any) {
        console.error("Error loading events and RSVPs from Supabase:", err);
      }
    };

    fetchEventsAndRsvps();
  }, [user]);

  // Subscribe to discussions in real-time
  useEffect(() => {
    const discussionsRef = ref(rtdb, "discussions");
    const unsubscribe = onValue(discussionsRef, (snapshot) => {
      const data = snapshot.val();
      const list: Discussion[] = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          const item = data[key];
          list.push({
            id: key,
            title: item.title || "",
            content: item.content || "",
            category: item.category || "general",
            user_id: item.user_id || "",
            user_email: item.user_email || "",
            user_name: item.user_name || "Anonymous",
            upvotes_count: item.upvotes_count || 0,
            upvoted_users: item.upvoted_users ? Object.keys(item.upvoted_users) : [],
            comments_count: item.comments_count || 0,
            created_at: item.created_at,
            visibility: item.visibility || "all",
            college_domain: item.college_domain || "",
            allowed_emails: item.allowed_emails ? Object.values(item.allowed_emails) : [],
            event_id: item.event_id || "",
            event_title: item.event_title || "",
          });
        });
        // Sort by created_at desc
        list.sort((a, b) => b.created_at - a.created_at);
      }
      setDiscussions(list);
    }, (error) => {
      console.error("Error listening to discussions: ", error);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to comments in real-time when a post is selected
  useEffect(() => {
    if (!selectedPost) {
      setComments([]);
      return;
    }

    const commentsRef = ref(rtdb, `comments/${selectedPost.id}`);
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      const list: Comment[] = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          const item = data[key];
          list.push({
            id: key,
            user_id: item.user_id || "",
            user_email: item.user_email || "",
            user_name: item.user_name || "Anonymous",
            content: item.content || "",
            created_at: item.created_at,
            resource_title: item.resource_title || "",
            resource_url: item.resource_url || "",
          });
        });
        // Sort by created_at asc
        list.sort((a, b) => a.created_at - b.created_at);
      }
      setComments(list);
    });

    return () => unsubscribe();
  }, [selectedPost]);

  // Synchronize URL query parameter with selected post
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("post");
    if (postId && discussions.length > 0) {
      const found = discussions.find((d) => d.id === postId);
      if (found) {
        setSelectedPost(found);
      }
    }
  }, [discussions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedPost) {
      params.set("post", selectedPost.id);
    } else {
      params.delete("post");
    }
    const newPath = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
    window.history.pushState(null, "", newPath);
  }, [selectedPost]);

  const getEmailDomain = (emailStr: string) => {
    return emailStr.split("@")[1]?.toLowerCase() || "";
  };

  const getCollegeName = (emailStr: string) => {
    const domain = getEmailDomain(emailStr);
    if (domain === "nbkrist.org") return "NBKRIST";
    if (domain === "srmap.edu.in") return "SRMAP";
    if (domain.endsWith(".edu") || domain.endsWith(".edu.in")) {
      const parts = domain.split(".");
      return parts[parts.length - 3]?.toUpperCase() || "College Partner";
    }
    return "Campus";
  };

  const hasAccess = (post: Discussion) => {
    if (!user) return false;
    const lowerUserEmail = user.email?.toLowerCase().trim() || "";
    
    // Admins always have access
    if (admins.includes(lowerUserEmail)) return true;

    // Creator always has access
    if (post.user_id === user.id) return true;

    const vis = post.visibility || "all";
    if (vis === "all") return true;

    if (vis === "college") {
      const creatorDomain = post.college_domain || getEmailDomain(post.user_email);
      const userDomain = getEmailDomain(lowerUserEmail);
      return creatorDomain === userDomain;
    }

    if (vis === "selected") {
      const allowed = post.allowed_emails || [];
      const lowerAllowed = allowed.map(e => e.toLowerCase().trim());
      return lowerAllowed.includes(lowerUserEmail);
    }

    if (vis === "event") {
      if (!post.event_id) return true; // fallback
      return userRsvps.includes(post.event_id);
    }

    return false;
  };

  const handleRsvpToEvent = async (eventId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("event_rsvps")
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: "going"
        });
      if (error) throw error;
      
      setUserRsvps(prev => [...prev, eventId]);
      toast.success("RSVP'd successfully! Chat unlocked.");
    } catch (err: any) {
      toast.error("Failed to RSVP: " + err.message);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSubmitting(true);

    try {
      const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
      
      // Gated properties
      const postCollegeDomain = getEmailDomain(user!.email!);
      const parsedAllowedEmails = visibility === "selected"
        ? invitedEmailsStr.split(",").map(em => em.trim().toLowerCase()).filter(Boolean)
        : [];
      
      if (visibility === "selected" && !parsedAllowedEmails.includes(user!.email!.toLowerCase())) {
        parsedAllowedEmails.push(user!.email!.toLowerCase());
      }

      const selectedEventObj = visibility === "event"
        ? events.find(ev => ev.id === linkedEventId)
        : null;

      const discussionsRef = ref(rtdb, "discussions");
      const newPostRef = push(discussionsRef);
      await set(newPostRef, {
        title,
        content,
        category,
        user_id: user!.id,
        user_email: user!.email,
        user_name: displayName,
        upvotes_count: 0,
        comments_count: 0,
        created_at: Date.now(),
        visibility,
        college_domain: visibility === "college" ? postCollegeDomain : "",
        allowed_emails: visibility === "selected" ? parsedAllowedEmails : [],
        event_id: visibility === "event" ? linkedEventId : "",
        event_title: visibility === "event" ? (selectedEventObj?.title || "Event Chat") : "",
      });

      toast.success("Discussion started!");
      setNewPostOpen(false);
      setTitle("");
      setContent("");
      setCategory("general");
      setVisibility("all");
      setInvitedEmailsStr("");
      setLinkedEventId("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create discussion.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (post: Discussion, e: React.MouseEvent) => {
    e.stopPropagation();
    const upvotedUsersRef = ref(rtdb, `discussions/${post.id}/upvoted_users/${user!.id}`);
    const hasUpvoted = post.upvoted_users?.includes(user!.id);

    try {
      if (hasUpvoted) {
        await remove(upvotedUsersRef);
        await update(ref(rtdb, `discussions/${post.id}`), {
          upvotes_count: Math.max(0, (post.upvotes_count || 1) - 1),
        });
      } else {
        await set(upvotedUsersRef, true);
        await update(ref(rtdb, `discussions/${post.id}`), {
          upvotes_count: (post.upvotes_count || 0) + 1,
        });
      }
    } catch (error: any) {
      toast.error("Failed to update upvote: " + error.message);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPost) return;
    setSubmittingComment(true);

    try {
      const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
      const commentsRef = ref(rtdb, `comments/${selectedPost.id}`);
      const newCommentRef = push(commentsRef);

      await set(newCommentRef, {
        user_id: user!.id,
        user_email: user!.email,
        user_name: displayName,
        content: newComment,
        created_at: Date.now(),
        resource_title: attachResource ? resourceTitle : "",
        resource_url: attachResource ? resourceUrl : "",
      });

      // Update comment counter in parent document
      await update(ref(rtdb, `discussions/${selectedPost.id}`), {
        comments_count: (selectedPost.comments_count || 0) + 1,
      });

      setNewComment("");
      setAttachResource(false);
      setResourceTitle("");
      setResourceUrl("");
      toast.success("Reply posted!");
    } catch (error: any) {
      toast.error("Failed to add reply: " + error.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const copyShareLink = (postId: string) => {
    const shareUrl = `${window.location.origin}/community?post=${postId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Direct link copied to clipboard!");
    }).catch((err) => {
      toast.error("Failed to copy link: " + err.message);
    });
  };

  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this discussion? All replies will be deleted permanently.")) return;
    try {
      await remove(ref(rtdb, `discussions/${postId}`));
      await remove(ref(rtdb, `comments/${postId}`));
      toast.success("Discussion deleted successfully!");
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
    } catch (error: any) {
      toast.error("Failed to delete discussion: " + error.message);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    try {
      await remove(ref(rtdb, `comments/${postId}/${commentId}`));
      if (selectedPost) {
        await update(ref(rtdb, `discussions/${postId}`), {
          comments_count: Math.max(0, (selectedPost.comments_count || 1) - 1)
        });
      }
      toast.success("Reply deleted.");
    } catch (error: any) {
      toast.error("Failed to delete reply: " + error.message);
    }
  };

  const handleAddInvitedEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newEmailsStr.trim()) return;
    try {
      const newEmails = newEmailsStr.split(",").map(em => em.trim().toLowerCase()).filter(Boolean);
      const currentAllowed = selectedPost.allowed_emails || [];
      const updatedAllowed = Array.from(new Set([...currentAllowed, ...newEmails]));

      await update(ref(rtdb, `discussions/${selectedPost.id}`), {
        allowed_emails: updatedAllowed
      });

      setSelectedPost(prev => prev ? { ...prev, allowed_emails: updatedAllowed } : null);

      toast.success("Invited students list updated!");
      setAddPeopleOpen(false);
      setNewEmailsStr("");
    } catch (error: any) {
      toast.error("Failed to add emails: " + error.message);
    }
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline font-semibold break-all inline-flex items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {part} <ExternalLink className="w-3 h-3 inline" />
          </a>
        );
      }
      return part;
    });
  };

  // Filtered discussions
  const filteredDiscussions = discussions.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.content.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesCategory || !matchesSearch) return false;

    // College & selected posts are completely hidden for non-permitted users
    const vis = p.visibility || "all";
    if (vis === "all" || vis === "event") {
      return true;
    }
    return hasAccess(p);
  });


  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const accessAllowed = selectedPost ? hasAccess(selectedPost) : false;

  return (
    <AppLayout>
      <SEO 
        title="Community Discussions" 
        description="Connect and discuss with campus peers. Ask questions, share advice, and stay updated in real-time."
        canonical="/community"
        keywords="student discussion, college forum, Q&A campus, campus social feed, student community"
      />
      
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 animate-fade-in">
            <div className="page-header mb-0">
              <h1 className="page-title">Student Forums & Q&A</h1>
              <p className="page-subtitle">Ask questions, share student life updates, and help peers in real-time</p>
            </div>
            
            <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1.5 font-semibold shadow-md shrink-0">
                  <Plus className="w-4 h-4" /> Start Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Start a New Discussion</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePost} className="space-y-4 mt-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Title *</label>
                    <input 
                      placeholder="What is your question or topic?" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      required 
                      className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Category *</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)} 
                      className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all capitalize"
                    >
                      {categories.filter(c => c.val !== "all").map((cat) => (
                        <option key={cat.val} value={cat.val}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Who can access? *</label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setVisibility("all")}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          visibility === "all"
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Globe className="w-3.5 h-3.5" /> Public
                        </div>
                        <span className="text-[10px] text-muted-foreground leading-normal">Open to all students</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setVisibility("college")}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          visibility === "college"
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                          <Building className="w-3.5 h-3.5 shrink-0" /> My College
                        </div>
                        <span className="text-[10px] text-muted-foreground leading-normal truncate">
                          Only {getCollegeName(user?.email || "")}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisibility("selected")}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          visibility === "selected"
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Lock className="w-3.5 h-3.5" /> Invited Only
                        </div>
                        <span className="text-[10px] text-muted-foreground leading-normal">Select specific emails</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisibility("event")}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          visibility === "event"
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <CalendarDays className="w-3.5 h-3.5" /> Event Chat
                        </div>
                        <span className="text-[10px] text-muted-foreground leading-normal">Link to campus event</span>
                      </button>
                    </div>
                  </div>

                  {visibility === "selected" && (
                    <div className="animate-fade-in space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Invited Email Addresses (comma separated) *</label>
                      <input 
                        placeholder="e.g. friend1@college.edu, friend2@gmail.com" 
                        value={invitedEmailsStr} 
                        onChange={(e) => setInvitedEmailsStr(e.target.value)} 
                        required={visibility === "selected"}
                        className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" 
                      />
                    </div>
                  )}

                  {visibility === "event" && (
                    <div className="animate-fade-in space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Link to Campus Event *</label>
                      {events.length === 0 ? (
                        <div className="p-3 bg-muted/30 border border-border/50 text-xs text-muted-foreground rounded-xl text-center italic">
                          No campus events created yet. Create an event first to link a chat.
                        </div>
                      ) : (
                        <select 
                          value={linkedEventId} 
                          onChange={(e) => setLinkedEventId(e.target.value)} 
                          required={visibility === "event"}
                          className="w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all capitalize"
                        >
                          <option value="" disabled>Select an Event</option>
                          {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>{ev.title}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Content *</label>
                    <textarea 
                      placeholder="Provide details about your topic..." 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      rows={5}
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none" 
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 font-semibold" disabled={submitting}>
                    {submitting ? "Posting..." : "Create Post"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input 
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Horizontal */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {categories.map((c) => (
              <button
                key={c.val}
                onClick={() => setActiveCategory(c.val)}
                className={`filter-pill shrink-0 ${activeCategory === c.val ? "filter-pill-active" : "filter-pill-inactive"}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Discussions Feed */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            {filteredDiscussions.length === 0 ? (
              <div className="empty-state py-16">
                <div className="w-16 h-16 rounded-2xl gradient-card flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-primary/40" />
                </div>
                <p className="font-bold text-foreground text-lg">No discussions found</p>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  {searchQuery ? "Try checking spelling or changing filters." : "Be the first to start a conversation!"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setNewPostOpen(true)} className="gap-1.5">
                    <Plus className="w-4 h-4" /> Start First Topic
                  </Button>
                )}
              </div>
            ) : (
              filteredDiscussions.map((post) => {
                const colors = categoryColors[post.category] || categoryColors.general;
                const initials = getInitials(post.user_name);
                const hasUpvoted = post.upvoted_users?.includes(user!.id);
                const dateText = post.created_at
                  ? new Date(post.created_at).toLocaleDateString()
                  : "Just now";

                return (
                  <div 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    className="card-campus p-5 cursor-pointer hover:border-primary/25 hover:shadow-md transition-all duration-300 flex gap-4 group"
                  >
                    {/* Voting Column */}
                    <div className="flex flex-col items-center gap-1 shrink-0 bg-muted/40 rounded-xl px-2.5 py-2 h-fit border border-border/20">
                      <button
                        onClick={(e) => handleUpvote(post, e)}
                        className={`p-1 rounded hover:bg-muted transition-colors ${
                          hasUpvoted ? "text-primary scale-110" : "text-muted-foreground/60 hover:text-foreground"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4 fill-current stroke-2" />
                      </button>
                      <span className="text-xs font-bold text-foreground">{post.upvotes_count}</span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${colors.bg}`}>
                          {post.category.replace("_", " ")}
                        </span>
                        
                        {/* Gated Badges */}
                        {post.visibility === "college" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center gap-1">
                            <Building className="w-3 h-3" /> {getCollegeName(post.user_email)} Only
                          </span>
                        )}
                        {post.visibility === "selected" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Invited
                          </span>
                        )}
                        {post.visibility === "event" && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                            hasAccess(post)
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-muted-foreground/10 text-muted-foreground"
                          }`}>
                            {hasAccess(post) ? <CalendarDays className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            Event Chat: {post.event_title || "Event Group"}
                          </span>
                        )}

                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto animate-fade-in">
                          <Clock className="w-3 h-3" /> {dateText}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
                            {initials}
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground/90 truncate max-w-[150px]">
                            {post.user_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyShareLink(post.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Copy share link"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          
                          {(user?.id === post.user_id || admins.includes(user?.email?.toLowerCase().trim() || "")) && (
                            <button
                              type="button"
                              onClick={(e) => handleDeletePost(post.id, e)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                              title="Delete discussion"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold bg-muted/30 px-3 py-1 rounded-lg border border-border/20">
                            <MessageSquare className="w-3.5 h-3.5 text-primary/70" />
                            <span>{post.comments_count} replies</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Side Panel: Selected Post Q&A Detail */}
        {selectedPost && (
          <div className="w-[22rem] shrink-0 hidden lg:flex flex-col bg-card border border-border/40 rounded-2xl h-[calc(100vh-8.5rem)] sticky top-20 overflow-hidden shadow-sm animate-fade-in">
            {/* Post details header */}
            <div className="p-4 border-b border-border/40 flex items-start gap-3 bg-muted/30">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Badge variant="secondary" className="text-[9px] py-0 px-2 uppercase font-bold">
                    {selectedPost.category.replace("_", " ")}
                  </Badge>
                  {selectedPost.visibility === "event" && (
                    <Badge variant="outline" className="text-[9px] py-0 px-2 uppercase font-bold border-amber-500/30 text-amber-500 bg-amber-500/5">
                      Event Chat
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleDateString() : "Just now"}
                  </span>
                </div>
                <h4 className="font-extrabold text-foreground text-sm line-clamp-2">{selectedPost.title}</h4>
                <p className="text-xs text-muted-foreground/90 mt-1">Started by <span className="font-semibold text-foreground">{selectedPost.user_name}</span></p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <button
                    onClick={() => copyShareLink(selectedPost.id)}
                    className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/80 px-2 py-1 rounded transition-colors border border-border/20"
                  >
                    <Share2 className="w-3 h-3" /> Share Chat
                  </button>
                  
                  {selectedPost.visibility === "selected" && (selectedPost.user_id === user?.id || admins.includes(user?.email?.toLowerCase().trim() || "")) && (
                    <Dialog open={addPeopleOpen} onOpenChange={setAddPeopleOpen}>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary-foreground hover:bg-primary/95 bg-primary/10 px-2 py-1 rounded transition-colors border border-primary/20">
                          <UserPlus className="w-3 h-3" /> Invite Peers
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-base font-bold">Add Students to Discussion</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddInvitedEmails} className="space-y-4 mt-2">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            This discussion is private. Enter comma-separated emails of student peers to grant them access to read and reply in this chat.
                          </p>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Student Emails *</label>
                            <input 
                              placeholder="e.g. peer1@college.edu, peer2@gmail.com" 
                              value={newEmailsStr} 
                              onChange={(e) => setNewEmailsStr(e.target.value)} 
                              required
                              className="w-full h-10 px-3 rounded-xl border border-border/60 bg-muted/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" 
                            />
                          </div>
                          <Button type="submit" className="w-full h-10 text-xs font-semibold">
                            Add Peer(s)
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!accessAllowed ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-muted/5">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-foreground">Discussion Gated</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                    This discussion is locked. You must RSVP to the event <span className="font-semibold text-foreground">"{selectedPost.event_title}"</span> to join the chat.
                  </p>
                </div>
                <Button 
                  onClick={() => handleRsvpToEvent(selectedPost.event_id!)}
                  className="w-full gap-1.5 font-semibold bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Plus className="w-4 h-4" /> RSVP to Unlock Chat
                </Button>
              </div>
            ) : (
              <>
                {/* Post Body & Comments Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Original Post content */}
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 mb-2">
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{renderTextWithLinks(selectedPost.content)}</p>
                  </div>

                  {/* Replies Divider */}
                  <div className="relative py-1 flex items-center">
                    <div className="flex-1 border-t border-border/30" />
                    <span className="bg-card px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Replies ({comments.length})</span>
                    <div className="flex-1 border-t border-border/30" />
                  </div>

                  {/* Comments list */}
                  <div className="space-y-3">
                    {comments.map((comment) => {
                      const commInitials = getInitials(comment.user_name);
                      const dateVal = comment.created_at 
                        ? new Date(comment.created_at).toLocaleDateString() 
                        : "Just now";
                      
                      return (
                        <div key={comment.id} className="p-3 bg-muted/20 border border-border/10 rounded-xl space-y-2 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground">
                                {commInitials}
                              </div>
                              <span className="text-[11px] font-semibold text-foreground truncate max-w-[110px]">{comment.user_name}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-muted-foreground">{dateVal}</span>
                              {(user?.id === comment.user_id || user?.id === selectedPost.user_id || admins.includes(user?.email?.toLowerCase().trim() || "")) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                                  className="text-muted-foreground hover:text-red-500 transition-colors p-0.5 rounded"
                                  title="Delete reply"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground leading-normal whitespace-pre-wrap">{renderTextWithLinks(comment.content)}</p>
                          
                          {comment.resource_title && comment.resource_url && (
                            <a 
                              href={comment.resource_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="mt-2 block p-2 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group/res"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-2">
                                <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-foreground group-hover/res:text-primary transition-colors truncate">
                                    {comment.resource_title}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground truncate">
                                    {comment.resource_url}
                                  </p>
                                </div>
                              </div>
                            </a>
                          )}
                        </div>
                      );
                    })}
                    {comments.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-xs text-muted-foreground italic">No replies yet. Be the first to answer!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resource Attachment Preview/Inputs */}
                {attachResource && (
                  <div className="p-3 border-t border-border/40 bg-muted/20 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Attach Link/Resource</span>
                      <button type="button" onClick={() => setAttachResource(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Resource Title (e.g. Lecture Notes)"
                        value={resourceTitle}
                        onChange={(e) => setResourceTitle(e.target.value)}
                        className="h-8 px-2 rounded-lg border border-border/50 bg-background text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="url"
                        placeholder="URL (https://...)"
                        value={resourceUrl}
                        onChange={(e) => setResourceUrl(e.target.value)}
                        className="h-8 px-2 rounded-lg border border-border/50 bg-background text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddComment} className="p-3 border-t border-border/40 bg-muted/10 flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => setAttachResource(!attachResource)}
                    className={`p-2 rounded-xl border shrink-0 transition-colors ${
                      attachResource 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-border/50 hover:bg-muted text-muted-foreground"
                    }`}
                    title="Attach resource link"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Write your reply..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    className="flex-1 h-9 px-3.5 rounded-xl border border-border/50 bg-background text-xs placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="h-9 w-9 rounded-xl shrink-0 p-0 flex items-center justify-center"
                    disabled={submittingComment || !newComment.trim() || (attachResource && (!resourceTitle.trim() || !resourceUrl.trim()))}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile Drawer view for comments when screen is small */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
          <DialogContent className="lg:hidden sm:max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader className="border-b border-border/40 pb-3">
              <DialogTitle className="text-base font-bold flex flex-col gap-1 text-left">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize w-fit ${
                    categoryColors[selectedPost.category]?.bg || categoryColors.general.bg
                  }`}>
                    {selectedPost.category.replace("_", " ")}
                  </span>
                  {selectedPost.visibility === "event" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                      Event Chat
                    </span>
                  )}
                </div>
                {selectedPost.title}
              </DialogTitle>
            </DialogHeader>

            {!accessAllowed ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-foreground">Discussion Gated</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                    This discussion is locked. You must RSVP to the event <span className="font-semibold text-foreground">"{selectedPost.event_title}"</span> to join the chat.
                  </p>
                </div>
                <Button 
                  onClick={() => handleRsvpToEvent(selectedPost.event_id!)}
                  className="w-full gap-1.5 font-semibold bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Plus className="w-4 h-4" /> RSVP to Unlock Chat
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{renderTextWithLinks(selectedPost.content)}</p>
                  <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-primary/10">
                    <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-[9px] font-bold text-primary-foreground">
                      {getInitials(selectedPost.user_name)}
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {selectedPost.user_name} • {selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleDateString() : "Just now"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-foreground">Replies ({comments.length})</h4>
                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-muted/20 border border-border/10 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">{comment.user_name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-muted-foreground">
                              {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : "Just now"}
                            </span>
                            {(user?.id === comment.user_id || user?.id === selectedPost.user_id || admins.includes(user?.email?.toLowerCase().trim() || "")) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-0.5 rounded"
                                title="Delete reply"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-normal whitespace-pre-wrap">{renderTextWithLinks(comment.content)}</p>
                        
                        {comment.resource_title && comment.resource_url && (
                          <a 
                            href={comment.resource_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 block p-2 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-foreground truncate">
                                  {comment.resource_title}
                                </p>
                                <p className="text-[9px] text-muted-foreground truncate">
                                  {comment.resource_url}
                                </p>
                              </div>
                            </div>
                          </a>
                        )}
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-4">No replies yet.</p>
                    )}
                  </div>
                </div>

                {/* Resource Attachment Preview/Inputs in Mobile */}
                {attachResource && (
                  <div className="p-3 border border-border/40 rounded-xl bg-muted/20 space-y-2 animate-fade-in w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Attach Link/Resource</span>
                      <button type="button" onClick={() => setAttachResource(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Title (e.g. Slide deck)"
                        value={resourceTitle}
                        onChange={(e) => setResourceTitle(e.target.value)}
                        className="h-8 px-2 rounded-lg border border-border/50 bg-background text-[11px] focus:outline-none"
                      />
                      <input
                        type="url"
                        placeholder="URL (https://...)"
                        value={resourceUrl}
                        onChange={(e) => setResourceUrl(e.target.value)}
                        className="h-8 px-2 rounded-lg border border-border/50 bg-background text-[11px] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddComment} className="flex gap-2 pt-2 items-center w-full">
                  <button
                    type="button"
                    onClick={() => setAttachResource(!attachResource)}
                    className={`p-2 rounded-xl border shrink-0 transition-colors ${
                      attachResource 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-border/50 hover:bg-muted text-muted-foreground"
                    }`}
                    title="Attach resource link"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Write your reply..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    className="flex-1 h-10 px-3.5 rounded-xl border border-border/50 bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <Button 
                    type="submit" 
                    className="h-10 px-4 font-semibold"
                    disabled={submittingComment || !newComment.trim() || (attachResource && (!resourceTitle.trim() || !resourceUrl.trim()))}
                  >
                    Reply
                  </Button>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
};

export default Community;
