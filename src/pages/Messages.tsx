import SEO from "@/components/SEO";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { MessageCircle, Send, Plus, ArrowLeft, Users, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

interface Conversation {
  id: string;
  name: string | null;
  is_group: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
}

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const targetUserParam = searchParams.get("user");

  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showConvoList, setShowConvoList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user,
  });

  // Fetch all members for user's conversations
  const { data: allMembers = [] } = useQuery({
    queryKey: ["conversation-members"],
    queryFn: async () => {
      if (conversations.length === 0) return [];
      const ids = conversations.map((c) => c.id);
      const { data, error } = await supabase
        .from("conversation_members")
        .select("*")
        .in("conversation_id", ids);
      if (error) throw error;
      return data as ConversationMember[];
    },
    enabled: conversations.length > 0,
  });

  // Fetch profiles for members
  const memberUserIds = [...new Set(allMembers.map((m) => m.user_id))];
  const { data: memberProfiles = [] } = useQuery({
    queryKey: ["member-profiles", memberUserIds.join(",")],
    queryFn: async () => {
      if (memberUserIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, avatar_url, bio, department, username, full_name")
        .in("user_id", memberUserIds);
      if (error) throw error;
      return data;
    },
    enabled: memberUserIds.length > 0,
  });

  // Search profiles in real-time
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("user_id, username, full_name, avatar_url")
            .neq("user_id", user?.id)
            .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
            .limit(5);
          
          if (!error && data) {
            setSearchResults(data);
          } else {
            // Fallback if username column doesn't exist yet
            const { data: fallbackData } = await supabase
              .from("profiles")
              .select("user_id, full_name, avatar_url")
              .neq("user_id", user?.id)
              .ilike("full_name", `%${searchQuery}%`)
              .limit(5);
            if (fallbackData) setSearchResults(fallbackData);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user]);

  // Handle routing param user redirect
  useEffect(() => {
    if (targetUserParam && conversations.length > 0 && allMembers.length > 0) {
      const existing = allMembers.filter((m) => m.user_id === targetUserParam);
      const myConvos = conversations.map((c) => c.id);
      const match = existing.find((m) => myConvos.includes(m.conversation_id));
      if (match) {
        setActiveConvo(match.conversation_id);
        setShowConvoList(false);
      } else {
        startConversation.mutate(targetUserParam);
      }
    }
  }, [targetUserParam, conversations, allMembers]);

  // Fetch messages for active convo
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", activeConvo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConvo!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!activeConvo,
  });

  // Fetch last messages for conversation list
  const { data: lastMessages = [] } = useQuery({
    queryKey: ["last-messages", conversations.map(c => c.id).join(",")],
    queryFn: async () => {
      if (conversations.length === 0) return [];
      // Get last message per conversation
      const promises = conversations.map(async (c) => {
        const { data } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1);
        return data?.[0] || null;
      });
      return (await Promise.all(promises)).filter(Boolean) as Message[];
    },
    enabled: conversations.length > 0,
  });

  // Realtime subscription
  useEffect(() => {
    if (!activeConvo) return;
    const channel = supabase
      .channel(`messages-${activeConvo}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${activeConvo}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages", activeConvo] });
        queryClient.invalidateQueries({ queryKey: ["last-messages"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo, queryClient]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!messageText.trim() || !activeConvo) return;
      const { error } = await supabase.from("messages").insert({
        conversation_id: activeConvo,
        sender_id: user!.id,
        content: messageText.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["messages", activeConvo] });
      queryClient.invalidateQueries({ queryKey: ["last-messages"] });
    },
    onError: () => toast.error("Failed to send message"),
  });

  // Start new conversation
  const startConversation = useMutation({
    mutationFn: async (targetUserId: string) => {
      // Find if we already have a 1-to-1 conversation with this user
      const existingMembers = allMembers.filter((m) => m.user_id === targetUserId);
      if (existingMembers.length > 0) {
        const myConversations = conversations.map((c) => c.id);
        const match = existingMembers.find((m) => myConversations.includes(m.conversation_id));
        if (match) {
          return conversations.find((c) => c.id === match.conversation_id);
        }
      }

      // Fetch user profile info
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("user_id", targetUserId)
        .single();
      
      const chatName = profile ? (profile.username ? `@${profile.username}` : profile.full_name) : "Direct Chat";

      // Create conversation
      const { data: convo, error: convoError } = await supabase
        .from("conversations")
        .insert({ created_by: user!.id, name: chatName })
        .select()
        .single();
      if (convoError) throw convoError;

      // Add creator as member
      await supabase.from("conversation_members").insert({
        conversation_id: convo.id,
        user_id: user!.id,
      });

      // Add target user as member
      await supabase.from("conversation_members").insert({
        conversation_id: convo.id,
        user_id: targetUserId,
      });

      return convo;
    },
    onSuccess: (convo) => {
      setDialogOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation-members"] });
      if (convo) {
        setActiveConvo(convo.id);
        setShowConvoList(false);
      }
    },
    onError: (e: any) => toast.error(e.message || "Failed to create conversation"),
  });

  const getConvoDisplayName = (convo: Conversation) => {
    const members = allMembers.filter((m) => m.conversation_id === convo.id && m.user_id !== user?.id);
    if (members.length > 0) {
      const profile = memberProfiles.find((p) => p.user_id === members[0].user_id);
      if (profile) {
        return (profile as any).username ? `@${(profile as any).username}` : ((profile as any).full_name || profile.department || `User`);
      }
    }
    return convo.name || "Chat";
  };

  const getLastMessage = (convoId: string) => {
    return lastMessages.find((m) => m.conversation_id === convoId);
  };

  const getInitials = (senderId: string) => {
    if (senderId === user?.id) return "You";
    const profile = memberProfiles.find((p) => p.user_id === senderId);
    if (profile) {
      const name = (profile as any).full_name || (profile as any).username || profile.department || "??";
      return name.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <AppLayout>
      <SEO title="Messages" description="Chat with classmates and project teams on StudentHub. Real-time messaging for students." canonical="/messages" noindex />
      <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
        <div className="flex h-full card-campus overflow-hidden">
          {/* Conversation List */}
          <div className={`${activeConvo && !showConvoList ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 border-r border-border/20`}>
            <div className="p-4 pb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Messages</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <button className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <Plus className="w-5 h-5 text-primary" />
                  </button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                  <DialogHeader>
                    <DialogTitle>New Conversation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                      <input
                        type="text"
                        placeholder="Search by username or name..."
                        className="oneui-input pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {searchResults.map((p) => (
                        <button
                          key={p.user_id}
                          onClick={() => startConversation.mutate(p.user_id)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-muted/40 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                            {p.avatar_url ? (
                              <img src={p.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              (p.username ? p.username[0] : p.full_name ? p.full_name[0] : "S").toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {p.full_name || "Student"}
                            </p>
                            {p.username && (
                              <p className="text-xs text-muted-foreground truncate">
                                @{p.username}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                      {searchQuery.length >= 2 && searchResults.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">No users found</p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input type="text" placeholder="Search conversations..." className="oneui-input pl-10 text-sm" />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <MessageCircle className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Start a new chat to begin messaging</p>
                </div>
              ) : (
                conversations.map((convo) => {
                  const last = getLastMessage(convo.id);
                  const isActive = activeConvo === convo.id;
                  return (
                    <button
                      key={convo.id}
                      onClick={() => { setActiveConvo(convo.id); setShowConvoList(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                        isActive ? "bg-primary/8" : "hover:bg-muted/30"
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
                        {convo.is_group ? (
                          <Users className="w-5 h-5 text-primary-foreground" />
                        ) : (
                          <span className="text-sm font-bold text-primary-foreground">
                            {getConvoDisplayName(convo).slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-foreground truncate">{getConvoDisplayName(convo)}</h3>
                          {last && <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{formatTime(last.created_at)}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {last ? last.content : "No messages yet"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className={`${!activeConvo || showConvoList ? "hidden md:flex" : "flex"} flex-col flex-1`}>
            {activeConvo ? (
              <>
                {/* Chat Header */}
                <div className="h-16 px-4 flex items-center gap-3 border-b border-border/20">
                  <button
                    onClick={() => { setShowConvoList(true); }}
                    className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">
                      {getConvoDisplayName(conversations.find((c) => c.id === activeConvo)!).slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {getConvoDisplayName(conversations.find((c) => c.id === activeConvo)!)}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {allMembers.filter((m) => m.conversation_id === activeConvo).length} members
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
                    </div>
                  )}
                  {messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-3xl ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-lg"
                            : "bg-muted/60 text-foreground rounded-bl-lg"
                        }`}>
                          {!isMine && (
                            <p className="text-[10px] font-semibold text-primary mb-1">{getInitials(msg.sender_id)}</p>
                          )}
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border/20">
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage.mutate(); }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="oneui-input flex-1"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || sendMessage.isPending}
                      className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
                    >
                      <Send className="w-[18px] h-[18px] text-primary-foreground" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-primary/8 flex items-center justify-center mb-5">
                  <MessageCircle className="w-9 h-9 text-primary/40" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Your Messages</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Select a conversation or start a new one to begin chatting with other students.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Messages;
