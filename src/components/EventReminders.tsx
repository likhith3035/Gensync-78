import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Calendar, Clock, MapPin, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { differenceInHours, differenceInMinutes, format, isPast } from "date-fns";

interface EventReminder {
  id: string;
  title: string;
  event_date: string;
  end_date: string | null;
  location: string | null;
  category: string;
  urgency: "now" | "soon" | "upcoming";
}

const URGENCY_STYLES: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  now: {
    bg: "bg-destructive/5",
    border: "border-destructive/20",
    badge: "bg-destructive/10 text-destructive",
    text: "text-destructive",
  },
  soon: {
    bg: "bg-warning/5",
    border: "border-warning/20",
    badge: "bg-warning/10 text-warning",
    text: "text-warning",
  },
  upcoming: {
    bg: "bg-primary/5",
    border: "border-primary/20",
    badge: "bg-primary/10 text-primary",
    text: "text-primary",
  },
};

const EventReminders = ({ compact = false }: { compact?: boolean }) => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data: rsvps = [] } = useQuery({
    queryKey: ["reminder-rsvps", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("event_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const rsvpEventIds = useMemo(() => rsvps.map((r) => r.event_id), [rsvps]);

  const { data: events = [] } = useQuery({
    queryKey: ["reminder-events", rsvpEventIds],
    queryFn: async () => {
      if (rsvpEventIds.length === 0) return [];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("id", rsvpEventIds)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: rsvpEventIds.length > 0,
  });

  const reminders: EventReminder[] = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => {
        const eventDate = new Date(e.event_date);
        const endDate = e.end_date ? new Date(e.end_date) : eventDate;
        // Show reminders for events within 48h or currently happening
        return !isPast(endDate) && differenceInHours(eventDate, now) <= 48;
      })
      .map((e) => {
        const eventDate = new Date(e.event_date);
        const hoursUntil = differenceInHours(eventDate, now);
        let urgency: "now" | "soon" | "upcoming";
        if (hoursUntil <= 0) urgency = "now";
        else if (hoursUntil <= 6) urgency = "soon";
        else urgency = "upcoming";

        return { ...e, urgency };
      })
      .filter((e) => !dismissed.has(e.id));
  }, [events, dismissed]);

  const getTimeLabel = (dateStr: string) => {
    const now = new Date();
    const eventDate = new Date(dateStr);
    const mins = differenceInMinutes(eventDate, now);
    if (mins <= 0) return "Happening now!";
    if (mins < 60) return `Starts in ${mins}m`;
    const hrs = differenceInHours(eventDate, now);
    if (hrs < 24) return `Starts in ${hrs}h`;
    return `Tomorrow at ${format(eventDate, "h:mm a")}`;
  };

  if (reminders.length === 0) return null;

  if (compact) {
    return (
      <div className="space-y-2">
        {reminders.slice(0, 3).map((event) => {
          const style = URGENCY_STYLES[event.urgency];
          return (
            <Link
              key={event.id}
              to="/events"
              className={`flex items-center gap-3 p-3 rounded-2xl border ${style.bg} ${style.border} transition-all hover:scale-[1.01]`}
            >
              <div className={`w-8 h-8 rounded-xl ${style.badge} flex items-center justify-center shrink-0`}>
                {event.urgency === "now" ? (
                  <Bell className="w-4 h-4 animate-bounce" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{event.title}</p>
                <p className={`text-[10px] font-semibold ${style.text}`}>{getTimeLabel(event.event_date)}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center">
          <Bell className="w-4 h-4 text-warning" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Event Reminders</h3>
          <p className="text-[10px] text-muted-foreground">{reminders.length} upcoming RSVP'd event{reminders.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {reminders.map((event) => {
        const style = URGENCY_STYLES[event.urgency];
        return (
          <div
            key={event.id}
            className={`relative p-4 rounded-2xl border ${style.bg} ${style.border} transition-all`}
          >
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(event.id))}
              className="absolute top-3 right-3 w-6 h-6 rounded-lg hover:bg-muted/60 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${style.badge} flex items-center justify-center shrink-0 mt-0.5`}>
                {event.urgency === "now" ? (
                  <Bell className="w-5 h-5 animate-bounce" />
                ) : (
                  <Calendar className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
                    {event.urgency === "now" ? "Live Now" : event.urgency === "soon" ? "Starting Soon" : "Coming Up"}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">{event.title}</h4>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  <span className={`font-semibold ${style.text}`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {getTimeLabel(event.event_date)}
                  </span>
                  <span>
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {format(new Date(event.event_date), "MMM d, h:mm a")}
                  </span>
                  {event.location && (
                    <span>
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventReminders;
