import SEO from "@/components/SEO";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Heart, MessageCircle, Send, Plus, ArrowLeft, Image as ImageIcon, Sparkles, Smile, X, Compass, ChevronRight, UserPlus, ShieldAlert, Award, Flame, MoreHorizontal, Bookmark, BookmarkCheck, Copy, Trash2, Flag, MapPin, Hash, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  created_at: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    department: string | null;
  };
  likes_count?: number;
  has_liked?: boolean;
  comments?: any[];
}

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "text";
  content?: string;
  created_at: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Empty defaults — no fake data, only real user content
const MOCK_STORIES: Story[] = [];
const MOCK_POSTS: Post[] = [];


export default function SocialFeed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Persist the fallback flag so we don't re-probe on every render
  const [useLocalFallback, setUseLocalFallback] = useState(() => {
    return localStorage.getItem("sh_social_fallback") === "true";
  });

  // Helper that sets both React state and localStorage
  const enableFallback = () => {
    localStorage.setItem("sh_social_fallback", "true");
    setUseLocalFallback(true);
  };

  // On mount, probe whether the social tables exist.
  // Also clear any previously cached mock data.
  useEffect(() => {
    // One-time cleanup of old mock data
    const cleanOldMocks = () => {
      ["sh_posts", "sh_stories"].forEach((key) => {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const arr = JSON.parse(raw);
            // Remove entries with fake mock IDs (p1, p2, s1, s2, s3, u1, u2, u3)
            const cleaned = arr.filter((item: any) =>
              !["p1", "p2", "s1", "s2", "s3"].includes(item.id) &&
              !["u1", "u2", "u3"].includes(item.user_id)
            );
            localStorage.setItem(key, JSON.stringify(cleaned));
          } catch { /* ignore parse errors */ }
        }
      });
    };
    cleanOldMocks();

    if (useLocalFallback) return; // already in fallback mode
    const probe = async () => {
      const { error } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true });
      if (error) {
        console.warn("Social tables not found – using localStorage mode.", error.message);
        enableFallback();
      }
    };
    probe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Story state
  const [activeStoryGroup, setActiveStoryGroup] = useState<Story[] | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [viewedStories, setViewedStories] = useState<string[]>([]);

  // Post Creator State
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [postImage, setPostImage] = useState<string>("");
  const [postCaption, setPostCaption] = useState("");
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postCategory, setPostCategory] = useState("general");
  const [postTagInput, setPostTagInput] = useState("");
  const [postTags, setPostTags] = useState<string[]>([]);
  const [postLocation, setPostLocation] = useState("");

  // Post card state
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>(() => {
    const saved = localStorage.getItem("sh_bookmarked_posts");
    return saved ? JSON.parse(saved) : [];
  });
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);

  // Story Creator State
  const [storyCreatorOpen, setStoryCreatorOpen] = useState(false);
  const [storyType, setStoryType] = useState<"image" | "text">("text");
  const [storyImage, setStoryImage] = useState<string>("");
  const [storyText, setStoryText] = useState("");

  // Comment input state
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [openComments, setOpenComments] = useState<{ [postId: string]: boolean }>({});

  // Streak state
  const [streak, setStreak] = useState(3); // default mock

  // Double tap like animator
  const [doubleTapPostId, setDoubleTapPostId] = useState<string | null>(null);

  // Fetch posts query
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      if (useLocalFallback) {
        const local = localStorage.getItem("sh_posts");
        return local ? JSON.parse(local) : MOCK_POSTS;
      }
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(`
            *,
            profiles:user_id (
              username,
              full_name,
              avatar_url,
              department
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Fetch likes and comments for each post
        const enrichedPosts = await Promise.all(
          data.map(async (post) => {
            const { count: likesCount } = await supabase
              .from("post_likes")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id);

            const { data: userLike } = await supabase
              .from("post_likes")
              .select("id")
              .eq("post_id", post.id)
              .eq("user_id", user?.id)
              .maybeSingle();

            const { data: comments } = await supabase
              .from("post_comments")
              .select(`
                id,
                content,
                created_at,
                user_id,
                profiles:user_id (username)
              `)
              .eq("post_id", post.id)
              .order("created_at", { ascending: true });

            return {
              ...post,
              likes_count: likesCount || 0,
              has_liked: !!userLike,
              comments: comments?.map((c: any) => ({
                id: c.id,
                user_id: c.user_id,
                user_name: c.profiles?.username || "student",
                content: c.content,
                created_at: c.created_at
              })) || []
            };
          })
        );
        return enrichedPosts as Post[];
      } catch (err) {
        console.warn("Supabase fetch failed, enabling local fallback.", err);
        enableFallback();
        const local = localStorage.getItem("sh_posts");
        return local ? JSON.parse(local) : MOCK_POSTS;
      }
    }
  });

  // Fetch stories query
  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      if (useLocalFallback) {
        const local = localStorage.getItem("sh_stories");
        return local ? JSON.parse(local) : MOCK_STORIES;
      }
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
        const { data, error } = await supabase
          .from("stories")
          .select(`
            *,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          `)
          .gt("created_at", twentyFourHoursAgo)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return data as Story[];
      } catch (err) {
        enableFallback();
        const local = localStorage.getItem("sh_stories");
        return local ? JSON.parse(local) : MOCK_STORIES;
      }
    }
  });

  // Fetch current user's profile for streak checks
  useEffect(() => {
    const checkStreak = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("streak_count, last_active_date")
          .eq("user_id", user.id)
          .maybeSingle();

        // If the query errored (e.g. columns don't exist), fall back to localStorage
        if (error || !data) {
          const today = new Date().toISOString().split("T")[0];
          const localLastActive = localStorage.getItem("sh_last_active");
          let localStreakVal = parseInt(localStorage.getItem("sh_streak") || "0");

          if (localLastActive !== today) {
            if (localLastActive) {
              const diffTime = Math.abs(new Date(today).getTime() - new Date(localLastActive).getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              localStreakVal = diffDays > 1 ? 1 : localStreakVal + 1;
            } else {
              localStreakVal = 1;
            }
            localStorage.setItem("sh_streak", String(localStreakVal));
            localStorage.setItem("sh_last_active", today);
          }
          setStreak(localStreakVal);
          return;
        }

        setStreak(data.streak_count || 0);
        
        // Verify if streak needs updating
        const today = new Date().toISOString().split("T")[0];
        const lastActive = data.last_active_date;
        if (lastActive !== today) {
          let newStreak = (data.streak_count || 0) + 1;
          if (lastActive) {
            const diffTime = Math.abs(new Date(today).getTime() - new Date(lastActive).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 1) {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }

          await supabase
            .from("profiles")
            .update({ streak_count: newStreak, last_active_date: today })
            .eq("user_id", user.id);
          setStreak(newStreak);
        }
      } catch (err) {
        // Fallback streak from localStorage
        const localStreak = localStorage.getItem("sh_streak") || "1";
        setStreak(parseInt(localStreak));
      }
    };
    checkStreak();
  }, [user]);

  // Helper: save post to localStorage
  const savePostLocally = () => {
    const local = localStorage.getItem("sh_posts");
    const current = local ? JSON.parse(local) : MOCK_POSTS;
    const newPost = {
      id: "p_" + Date.now(),
      user_id: user?.id || "u_me",
      image_url: postImage || null,
      caption: postCaption,
      created_at: new Date().toISOString(),
      category: postCategory,
      tags: postTags,
      location: postLocation || null,
      profiles: {
        username: user?.email?.split("@")[0] || "myself",
        full_name: user?.user_metadata?.full_name || "Myself",
        avatar_url: null,
        department: "Computer Science"
      },
      likes_count: 0,
      has_liked: false,
      comments: []
    };
    localStorage.setItem("sh_posts", JSON.stringify([newPost, ...current]));
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (useLocalFallback) {
        savePostLocally();
        return;
      }

      try {
        const { data, error } = await supabase
          .from("posts")
          .insert({
            user_id: user?.id,
            image_url: postImage,
            caption: postCaption
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn("Supabase posts insert failed, using localStorage fallback.", err);
        enableFallback();
        savePostLocally();
      }
    },
    onSuccess: () => {
      toast.success("Post shared successfully! 🚀");
      setPostDialogOpen(false);
      setPostCaption("");
      setPostImage("");
      setPostImageFile(null);
      setPostCategory("general");
      setPostTags([]);
      setPostTagInput("");
      setPostLocation("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e) => {
      console.error(e);
      toast.error("Failed to share post");
    }
  });

  // Helper: save story to localStorage
  const saveStoryLocally = () => {
    const local = localStorage.getItem("sh_stories");
    const current = local ? JSON.parse(local) : MOCK_STORIES;
    const newStory: Story = {
      id: "s_" + Date.now(),
      user_id: user?.id || "u_me",
      media_url: storyImage,
      media_type: storyType,
      content: storyText,
      created_at: new Date().toISOString(),
      profiles: {
        username: user?.email?.split("@")[0] || "myself",
        full_name: user?.user_metadata?.full_name || "Myself",
        avatar_url: null
      }
    };
    localStorage.setItem("sh_stories", JSON.stringify([...current, newStory]));
  };

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async () => {
      if (useLocalFallback) {
        saveStoryLocally();
        return;
      }

      try {
        const { data, error } = await supabase
          .from("stories")
          .insert({
            user_id: user?.id,
            media_url: storyImage,
            media_type: storyType,
            content: storyText
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn("Supabase stories insert failed, using localStorage fallback.", err);
        enableFallback();
        saveStoryLocally();
      }
    },
    onSuccess: () => {
      toast.success("Story shared successfully! ✨");
      setStoryCreatorOpen(false);
      setStoryImage("");
      setStoryText("");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: (e) => {
      console.error(e);
      toast.error("Failed to share story");
    }
  });

  // Helper: toggle like in localStorage
  const toggleLikeLocally = (postId: string, currentLiked: boolean) => {
    const local = localStorage.getItem("sh_posts");
    const current = local ? JSON.parse(local) : MOCK_POSTS;
    const updated = current.map((p: Post) => {
      if (p.id === postId) {
        return {
          ...p,
          has_liked: !currentLiked,
          likes_count: (p.likes_count || 0) + (currentLiked ? -1 : 1)
        };
      }
      return p;
    });
    localStorage.setItem("sh_posts", JSON.stringify(updated));
    queryClient.setQueryData(["posts"], updated);
  };

  // Like / Unlike Post
  const handleLikePost = async (postId: string, currentLiked: boolean) => {
    if (useLocalFallback) {
      toggleLikeLocally(postId, currentLiked);
      return;
    }

    try {
      if (currentLiked) {
        await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user?.id);
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: user?.id });
      }
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (e) {
      console.warn("Supabase like failed, using localStorage fallback.", e);
      enableFallback();
      toggleLikeLocally(postId, currentLiked);
    }
  };

  // Double tap post to like
  const handleDoubleTap = (postId: string, currentLiked: boolean) => {
    setDoubleTapPostId(postId);
    setTimeout(() => setDoubleTapPostId(null), 1000);
    if (!currentLiked) {
      handleLikePost(postId, false);
    }
  };

  // Helper: add comment to localStorage
  const addCommentLocally = (postId: string, content: string) => {
    const local = localStorage.getItem("sh_posts");
    const current = local ? JSON.parse(local) : MOCK_POSTS;
    const updated = current.map((p: Post) => {
      if (p.id === postId) {
        const newComment = {
          id: "c_" + Date.now(),
          user_id: user?.id || "u_me",
          user_name: user?.email?.split("@")[0] || "myself",
          content,
          created_at: new Date().toISOString()
        };
        return {
          ...p,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    });
    localStorage.setItem("sh_posts", JSON.stringify(updated));
    queryClient.setQueryData(["posts"], updated);
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  // Add Comment
  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    if (useLocalFallback) {
      addCommentLocally(postId, content);
      return;
    }

    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: user?.id,
        content
      });
      if (error) throw error;
      setCommentInputs({ ...commentInputs, [postId]: "" });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (e) {
      console.warn("Supabase comment failed, using localStorage fallback.", e);
      enableFallback();
      addCommentLocally(postId, content);
    }
  };

  // Group stories by user
  const groupedStories: { [username: string]: Story[] } = {};
  stories.forEach((story: Story) => {
    const username = story.profiles?.username || "anonymous";
    if (!groupedStories[username]) {
      groupedStories[username] = [];
    }
    groupedStories[username].push(story);
  });

  const openStoryGroup = (group: Story[]) => {
    setActiveStoryGroup(group);
    setCurrentStoryIndex(0);
    setStoryDialogOpen(true);
    // Mark as viewed
    setViewedStories([...viewedStories, group[0]?.profiles?.username || ""]);
  };

  const handleNextStory = () => {
    if (!activeStoryGroup) return;
    if (currentStoryIndex < activeStoryGroup.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setStoryDialogOpen(false);
    }
  };

  const handlePrevStory = () => {
    if (!activeStoryGroup) return;
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  // Image Upload helper (base64)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isPost: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isPost) {
          setPostImage(reader.result as string);
        } else {
          setStoryImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppLayout>
      <SEO title="Social Feed" description="Check posts, share updates, certificates, and view stories from classmates on StudentHub." canonical="/feed" />

      <div className="max-w-xl mx-auto pb-16 pt-3 px-4">
        {/* Main Header / Top Action bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-1.5">
              Campus Feed <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </h1>
            <p className="text-xs text-muted-foreground">What's happening around your college</p>
          </div>

          {/* Quick stats and Add Post */}
          <div className="flex items-center gap-3">
            {/* Streak flame indicator */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold text-xs shadow-sm">
              <span>🔥</span>
              <span>{streak} Days</span>
            </div>

            <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center justify-center w-10 h-10 rounded-full gradient-primary text-white hover:scale-105 transition-all shadow-md">
                  <Plus className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl border-border/40 sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-extrabold text-foreground">Create Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-3">
                  {/* Image preview / upload zone */}
                  {postImage ? (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border/40">
                      <img src={postImage} alt="Post preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setPostImage("")}
                        className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md rounded-full p-1.5 hover:bg-black/80 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border/70 hover:border-primary/50 rounded-2xl p-8 text-center cursor-pointer transition-colors relative bg-muted/10">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, true)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Add a photo (optional)</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Supports PNG, JPG, or WEBP • Text-only posts are allowed</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Caption input */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Caption *</label>
                    <textarea
                      placeholder="What's on your mind? Share updates, ask questions..."
                      className="oneui-input h-24 pt-2 resize-none"
                      value={postCaption}
                      onChange={(e) => setPostCaption(e.target.value)}
                      maxLength={500}
                    />
                    <p className="text-[9px] text-muted-foreground text-right mt-0.5">{postCaption.length}/500</p>
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "general", label: "💬 General" },
                        { key: "academic", label: "📚 Academic" },
                        { key: "achievement", label: "🏆 Achievement" },
                        { key: "event", label: "🎉 Event" },
                        { key: "meme", label: "😂 Meme" },
                        { key: "help", label: "🤝 Help" },
                      ].map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setPostCategory(cat.key)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                            postCategory === cat.key
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-muted/20 text-muted-foreground border-border/40 hover:border-primary/40"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags input */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Tags</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                        <input
                          type="text"
                          placeholder="Add a tag and press Enter"
                          className="oneui-input text-xs h-9 pl-8"
                          value={postTagInput}
                          onChange={(e) => setPostTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const tag = postTagInput.trim().replace(/^#/, "");
                              if (tag && !postTags.includes(tag) && postTags.length < 5) {
                                setPostTags([...postTags, tag]);
                                setPostTagInput("");
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    {postTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {postTags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[10px] font-bold">
                            #{tag}
                            <button onClick={() => setPostTags(postTags.filter(t => t !== tag))} className="hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[9px] text-muted-foreground mt-1">{postTags.length}/5 tags</p>
                  </div>

                  {/* Location (optional) */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Location (optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                      <input
                        type="text"
                        placeholder="e.g. Library, Lab 3, Cafeteria"
                        className="oneui-input text-xs h-9 pl-8"
                        value={postLocation}
                        onChange={(e) => setPostLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    disabled={!postCaption.trim() || createPostMutation.isPending}
                    onClick={() => createPostMutation.mutate()}
                    className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm hover:opacity-95 transition-opacity disabled:opacity-40"
                  >
                    {createPostMutation.isPending ? "Sharing..." : "Share Post"}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* =============================================
            STORIES BAR
           ============================================= */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 border-b border-border/10 scrollbar-none">
          {/* Add story circular button */}
          <div className="flex flex-col items-center shrink-0">
            <button
              onClick={() => { setStoryType("text"); setStoryCreatorOpen(true); }}
              className="w-16 h-16 rounded-full border border-dashed border-border/80 flex items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors relative group"
            >
              <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-md">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </button>
            <span className="text-[10px] font-semibold text-muted-foreground mt-1.5">Add Story</span>
          </div>

          {/* Render grouped stories */}
          {Object.keys(groupedStories).map((username) => {
            const group = groupedStories[username];
            const isViewed = viewedStories.includes(username);
            const firstStory = group[0];
            const avatarChar = username[0].toUpperCase();

            return (
              <button
                key={username}
                onClick={() => openStoryGroup(group)}
                className="flex flex-col items-center shrink-0"
              >
                <div className={`p-[2.5px] rounded-full ${
                  isViewed 
                    ? "bg-muted-foreground/30" 
                    : "bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500"
                }`}>
                  <div className="w-15 h-15 rounded-full border-2 border-background overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-primary shadow-sm text-sm">
                    {firstStory.profiles?.avatar_url ? (
                      <img src={firstStory.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      avatarChar
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-foreground mt-1.5 tracking-tight truncate max-w-[70px]">
                  @{username}
                </span>
              </button>
            );
          })}
        </div>

        {/* =============================================
            POSTS FEED LIST
           ============================================= */}
        {postsLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-primary/25 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase animate-pulse">Loading Feed...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="card-campus p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                  <Compass className="w-7 h-7 text-primary/40" />
                </div>
                <h3 className="text-base font-extrabold text-foreground">Welcome to the Campus Feed!</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Be the first to share an update, notes preview, or certificate to light up the campus feed.
                </p>
                <button
                  onClick={() => setPostDialogOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-primary text-white font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              posts.map((post) => {
                const username = post.profiles?.username || "student";
                const fullName = post.profiles?.full_name || "Student";
                const isDoubleTapped = doubleTapPostId === post.id;

                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="card-campus overflow-hidden shadow-sm"
                  >
                    {/* Post Header */}
                    <div className="p-4 flex items-center justify-between border-b border-border/10">
                      <div className="flex items-center gap-3">
                        <Link to={`/profile?user=${post.user_id}`} className="w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center font-bold text-primary shadow-sm text-sm shrink-0 overflow-hidden">
                          {post.profiles?.avatar_url ? (
                            <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            username[0].toUpperCase()
                          )}
                        </Link>
                        <div>
                          <Link to={`/profile?user=${post.user_id}`} className="text-sm font-extrabold text-foreground hover:text-primary transition-colors flex items-center gap-1 leading-none">
                            {fullName}
                          </Link>
                          <span className="text-[10px] text-muted-foreground mt-1 block">
                            @{username} • {post.profiles?.department || "Campus"} • {(() => {
                              const diff = Date.now() - new Date(post.created_at).getTime();
                              const mins = Math.floor(diff / 60000);
                              if (mins < 1) return "now";
                              if (mins < 60) return `${mins}m`;
                              const hrs = Math.floor(mins / 60);
                              if (hrs < 24) return `${hrs}h`;
                              const days = Math.floor(hrs / 24);
                              return `${days}d`;
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* 3-dot menu */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/40 transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <AnimatePresence>
                          {openMenuPostId === post.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -5 }}
                              className="absolute right-0 top-10 z-30 w-48 bg-card border border-border/40 rounded-2xl shadow-xl overflow-hidden"
                            >
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/feed#${post.id}`);
                                  toast.success("Link copied to clipboard!");
                                  setOpenMenuPostId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors flex items-center gap-2.5"
                              >
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Copy Link
                              </button>
                              <button
                                onClick={() => {
                                  const isBookmarked = bookmarkedPosts.includes(post.id);
                                  const updated = isBookmarked
                                    ? bookmarkedPosts.filter(id => id !== post.id)
                                    : [...bookmarkedPosts, post.id];
                                  setBookmarkedPosts(updated);
                                  localStorage.setItem("sh_bookmarked_posts", JSON.stringify(updated));
                                  toast.success(isBookmarked ? "Removed from saved" : "Post saved!");
                                  setOpenMenuPostId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors flex items-center gap-2.5"
                              >
                                {bookmarkedPosts.includes(post.id)
                                  ? <><BookmarkCheck className="w-3.5 h-3.5 text-primary" /> Unsave Post</>
                                  : <><Bookmark className="w-3.5 h-3.5 text-muted-foreground" /> Save Post</>}
                              </button>
                              <Link
                                to={`/profile?user=${post.user_id}`}
                                onClick={() => setOpenMenuPostId(null)}
                                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors flex items-center gap-2.5"
                              >
                                <UserPlus className="w-3.5 h-3.5 text-muted-foreground" /> View Profile
                              </Link>
                              {post.user_id === user?.id && (
                                <button
                                  onClick={() => {
                                    // Delete post from localStorage
                                    const local = localStorage.getItem("sh_posts");
                                    if (local) {
                                      const arr = JSON.parse(local).filter((p: any) => p.id !== post.id);
                                      localStorage.setItem("sh_posts", JSON.stringify(arr));
                                    }
                                    queryClient.invalidateQueries({ queryKey: ["posts"] });
                                    toast.success("Post deleted");
                                    setOpenMenuPostId(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2.5 border-t border-border/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete Post
                                </button>
                              )}
                              {post.user_id !== user?.id && (
                                <button
                                  onClick={() => {
                                    toast.success("Post reported. Thank you for keeping campus safe.");
                                    setOpenMenuPostId(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2.5 border-t border-border/10"
                                >
                                  <Flag className="w-3.5 h-3.5" /> Report Post
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Post Image with Double Tap Like (or text-only card) */}
                    {post.image_url ? (
                      <div
                        className="relative w-full aspect-square bg-slate-900 flex items-center justify-center cursor-pointer select-none overflow-hidden"
                        onDoubleClick={() => handleDoubleTap(post.id, post.has_liked || false)}
                      >
                        <img src={post.image_url} alt="Post content" className="w-full h-full object-cover" />
                        <AnimatePresence>
                          {isDoubleTapped && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1.3, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.3, type: "spring" }}
                              className="absolute z-10 p-4 bg-white/20 backdrop-blur-md rounded-full shadow-2xl"
                            >
                              <Heart className="w-12 h-12 text-pink-500 fill-pink-500 filter drop-shadow-lg" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : null}

                    {/* Post actions */}
                    <div className="p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <button
                          onClick={() => handleLikePost(post.id, post.has_liked || false)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Heart className={`w-6 h-6 ${post.has_liked ? "text-pink-500 fill-pink-500 animate-pulse" : "text-muted-foreground"}`} />
                        </button>
                        <button
                          onClick={() => setOpenComments({ ...openComments, [post.id]: !openComments[post.id] })}
                          className="hover:scale-110 transition-transform"
                        >
                          <MessageCircle className="w-6 h-6 text-muted-foreground" />
                        </button>
                        <Link
                          to={`/messages?user=${post.user_id}`}
                          className="hover:scale-110 transition-transform"
                        >
                          <Send className="w-5 h-5 text-muted-foreground" />
                        </Link>
                        <button
                          onClick={() => {
                            const isBookmarked = bookmarkedPosts.includes(post.id);
                            const updated = isBookmarked
                              ? bookmarkedPosts.filter(id => id !== post.id)
                              : [...bookmarkedPosts, post.id];
                            setBookmarkedPosts(updated);
                            localStorage.setItem("sh_bookmarked_posts", JSON.stringify(updated));
                            toast.success(isBookmarked ? "Removed from saved" : "Post saved! 🔖");
                          }}
                          className="hover:scale-110 transition-transform ml-auto"
                        >
                          {bookmarkedPosts.includes(post.id)
                            ? <BookmarkCheck className="w-5.5 h-5.5 text-primary fill-primary" />
                            : <Bookmark className="w-5.5 h-5.5 text-muted-foreground" />}
                        </button>
                      </div>

                      {/* Likes count */}
                      <p className="text-xs font-extrabold text-foreground mb-1.5">
                        {post.likes_count || 0} likes
                      </p>

                      {/* Caption */}
                      <p className="text-xs text-foreground/90 leading-relaxed mb-2">
                        <span className="font-extrabold mr-1.5">@{username}</span>
                        {post.caption}
                      </p>

                      {/* Tags & Location */}
                      {((post as any).tags?.length > 0 || (post as any).location) && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {(post as any).tags?.map((tag: string) => (
                            <span key={tag} className="text-[10px] font-bold text-primary">#{tag}</span>
                          ))}
                          {(post as any).location && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" /> {(post as any).location}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Category badge */}
                      {(post as any).category && (post as any).category !== "general" && (
                        <div className="mb-3">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15">
                            {(post as any).category}
                          </span>
                        </div>
                      )}

                      {/* Comment section toggler */}
                      {post.comments && post.comments.length > 0 && (
                        <button
                          onClick={() => setOpenComments({ ...openComments, [post.id]: !openComments[post.id] })}
                          className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors block mb-3"
                        >
                          {openComments[post.id] ? "Hide comments" : `View all ${post.comments.length} comments`}
                        </button>
                      )}

                      {/* Render comments inline if open */}
                      <AnimatePresence>
                        {openComments[post.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-2 border-t border-border/10 pt-3 mb-3 overflow-hidden"
                          >
                            {post.comments?.map((comment) => (
                              <div key={comment.id} className="text-xs leading-normal">
                                <span className="font-extrabold mr-1.5">@{comment.user_name}</span>
                                <span className="text-muted-foreground">{comment.content}</span>
                              </div>
                            ))}
                            {(!post.comments || post.comments.length === 0) && (
                              <p className="text-[10px] text-muted-foreground/60 italic">No comments yet. Write one below!</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Add comment input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="oneui-input text-xs h-9 flex-1"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors text-primary font-bold text-xs"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* =============================================
          STORIES SLIDESHOW MODAL
         ============================================= */}
      <Dialog open={storyDialogOpen} onOpenChange={setStoryDialogOpen}>
        <DialogContent className="p-0 border-none max-w-lg aspect-[9/16] bg-black text-white rounded-3xl overflow-hidden relative sm:max-w-md">
          {activeStoryGroup && activeStoryGroup.length > 0 && (
            <div className="h-full flex flex-col justify-between p-4 relative">
              {/* Progress bars indicator */}
              <div className="absolute top-3 left-4 right-4 flex gap-1 z-20">
                {activeStoryGroup.map((story, i) => (
                  <div key={story.id} className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                    <div 
                      className={`h-full bg-white transition-all duration-350 ${
                        i < currentStoryIndex ? "w-full" : i === currentStoryIndex ? "w-full animate-progress" : "w-0"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Story Header */}
              <div className="flex items-center justify-between z-20 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-xs">
                    {activeStoryGroup[currentStoryIndex].profiles?.avatar_url ? (
                      <img src={activeStoryGroup[currentStoryIndex].profiles?.avatar_url || ""} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (activeStoryGroup[currentStoryIndex].profiles?.username || "A")[0].toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-extrabold">
                    @{activeStoryGroup[currentStoryIndex].profiles?.username || "student"}
                  </span>
                  <span className="text-[10px] text-white/60">
                    {new Date(activeStoryGroup[currentStoryIndex].created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <button onClick={() => setStoryDialogOpen(false)}>
                  <X className="w-5 h-5 text-white/80 hover:text-white" />
                </button>
              </div>

              {/* Story Content */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950 p-6">
                {activeStoryGroup[currentStoryIndex].media_type === "image" ? (
                  <img 
                    src={activeStoryGroup[currentStoryIndex].media_url} 
                    alt="Story Content" 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <div className="w-full text-center max-w-xs space-y-4">
                    <p className="text-xl font-extrabold tracking-tight leading-relaxed italic text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300">
                      "{activeStoryGroup[currentStoryIndex].content}"
                    </p>
                  </div>
                )}
              </div>

              {/* Story Navigation Controls */}
              <div className="absolute inset-0 z-15 flex">
                <div className="w-1/3 h-full cursor-left" onClick={handlePrevStory} />
                <div className="w-2/3 h-full cursor-right" onClick={handleNextStory} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* =============================================
          STORY CREATOR DIALOG
         ============================================= */}
      <Dialog open={storyCreatorOpen} onOpenChange={setStoryCreatorOpen}>
        <DialogContent className="rounded-3xl border-border/40 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-foreground">Add Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-3">
            {/* Story Type Selector */}
            <div className="flex gap-2 p-1 bg-muted/60 rounded-2xl">
              <button
                onClick={() => setStoryType("text")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  storyType === "text" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Text Status
              </button>
              <button
                onClick={() => setStoryType("image")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  storyType === "image" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Photo Story
              </button>
            </div>

            {storyType === "image" ? (
              /* Image Story Upload */
              storyImage ? (
                <div className="relative aspect-[9/16] max-h-72 w-full rounded-2xl overflow-hidden border border-border/40 bg-zinc-950 flex items-center justify-center">
                  <img src={storyImage} alt="Story preview" className="h-full object-contain" />
                  <button
                    onClick={() => setStoryImage("")}
                    className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md rounded-full p-1.5 hover:bg-black/80 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border/70 hover:border-primary/50 rounded-2xl p-8 text-center cursor-pointer transition-colors relative bg-muted/10">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, false)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Select a photo for your story</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Will expire in 24 hours</p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Text Story Content */
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Status Message</label>
                <textarea
                  placeholder="What's on your mind? Share a quick update..."
                  className="oneui-input h-28 pt-2 resize-none text-center text-sm font-semibold"
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  maxLength={120}
                />
                <span className="text-[9px] text-muted-foreground text-right block mt-1">
                  {storyText.length}/120 characters
                </span>
              </div>
            )}

            <button
              disabled={
                (storyType === "image" && !storyImage) ||
                (storyType === "text" && !storyText.trim()) ||
                createStoryMutation.isPending
              }
              onClick={() => createStoryMutation.mutate()}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm hover:opacity-95 transition-opacity disabled:opacity-40"
            >
              Share Story
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
