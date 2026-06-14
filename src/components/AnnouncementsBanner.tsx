import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, Pin, ChevronRight } from "lucide-react";
import { useState } from "react";

const categoryStyle: Record<string, string> = {
  general: "border-primary/20 bg-primary/5",
  urgent: "border-destructive/30 bg-destructive/5",
  academic: "border-success/20 bg-success/5",
  event: "border-warning/20 bg-warning/5",
};

const categoryBadge: Record<string, string> = {
  general: "bg-primary/10 text-primary",
  urgent: "bg-destructive/10 text-destructive",
  academic: "bg-success/10 text-success",
  event: "bg-warning/10 text-warning",
};

const AnnouncementsBanner = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements-banner"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Megaphone className="w-4 h-4 text-primary" />
        <h3 className="text-xs sm:text-sm font-bold text-foreground">Announcements</h3>
      </div>
      {announcements.map((a: any) => (
        <div
          key={a.id}
          className={`rounded-xl border p-3 sm:p-4 cursor-pointer transition-all hover:shadow-sm ${
            categoryStyle[a.category] || categoryStyle.general
          }`}
          onClick={() => setExpanded(expanded === a.id ? null : a.id)}
        >
          <div className="flex items-start gap-2.5">
            {a.is_pinned && <Pin className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                  categoryBadge[a.category] || categoryBadge.general
                }`}>
                  {a.category}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">{a.title}</p>
              {expanded === a.id && (
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{a.content}</p>
              )}
            </div>
            <ChevronRight
              className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
                expanded === a.id ? "rotate-90" : ""
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementsBanner;
