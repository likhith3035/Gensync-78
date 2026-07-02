import SEO from "@/components/SEO";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import EventReminders from "@/components/EventReminders";
import { Calendar, MapPin, Clock, Plus, Users, ChevronLeft, ChevronRight, X, CheckCircle2, Trash2, Edit2, Filter, AlertCircle, Save, Grid } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, isPast } from "date-fns";
import CalendarView from "@/components/CalendarView";

const EVENT_CATEGORIES = ["general", "workshop", "hackathon", "seminar", "social", "career"];
const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-primary/10 text-primary",
  workshop: "bg-warning/10 text-warning",
  hackathon: "bg-accent text-accent-foreground",
  seminar: "bg-success/10 text-success",
  social: "bg-destructive/10 text-destructive",
  career: "bg-info/10 text-info",
};

type EventFilter = "all" | "upcoming" | "past" | "my-events" | "my-rsvps";

import { useSearchParams } from "react-router-dom";

const Events = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [filter, setFilter] = useState<EventFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [form, setForm] = useState({ title: "", description: "", location: "", event_date: "", end_date: "", category: "general" });
  const [editForm, setEditForm] = useState({ title: "", description: "", location: "", event_date: "", end_date: "", category: "general" });
  const [layoutMode, setLayoutMode] = useState<"list" | "calendar" | "grid">("list");

  const { data: events = [] } = useQuery({
    queryKey: ["events", searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: rsvps = [] } = useQuery({
    queryKey: ["event-rsvps"],
    queryFn: async () => {
      const { data, error } = await supabase.from("event_rsvps").select("*");
      if (error) throw error;
      return data;
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("events").insert({
        ...form,
        event_date: new Date(form.event_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event created!");
      setCreateOpen(false);
      setForm({ title: "", description: "", location: "", event_date: "", end_date: "", category: "general" });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Failed to create event"),
  });

  const updateEventMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("events").update({
        title: editForm.title,
        description: editForm.description || null,
        location: editForm.location || null,
        event_date: new Date(editForm.event_date).toISOString(),
        end_date: editForm.end_date ? new Date(editForm.end_date).toISOString() : null,
        category: editForm.category,
      }).eq("id", editEvent.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event updated!");
      setEditEvent(null);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Failed to update event"),
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      // Delete RSVPs first, then event
      await supabase.from("event_rsvps").delete().eq("event_id", eventId);
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event-rsvps"] });
    },
    onError: () => toast.error("Failed to delete event"),
  });

  const toggleRsvp = useMutation({
    mutationFn: async (eventId: string) => {
      const existing = rsvps.find((r: any) => r.event_id === eventId && r.user_id === user!.id);
      if (existing) {
        await supabase.from("event_rsvps").delete().eq("id", existing.id);
      } else {
        await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: user!.id, status: "going" });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event-rsvps"] }),
    onError: () => toast.error("Failed to update RSVP"),
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();

  const getEventsForDay = (day: Date) => events.filter((e: any) => isSameDay(new Date(e.event_date), day));

  const isEventPast = (event: any) => {
    const endDate = event.end_date ? new Date(event.end_date) : new Date(event.event_date);
    return isPast(endDate);
  };

  const canManageEvent = (event: any) => event.created_by === user?.id;

  // Apply filters
  const filteredEvents = (() => {
    let filtered = selectedDate
      ? events.filter((e: any) => isSameDay(new Date(e.event_date), selectedDate))
      : events.filter((e: any) => isSameMonth(new Date(e.event_date), currentMonth));

    if (categoryFilter !== "all") {
      filtered = filtered.filter((e: any) => e.category === categoryFilter);
    }

    let result = (() => {
      switch (filter) {
        case "upcoming":
          return filtered.filter((e: any) => !isEventPast(e));
        case "past":
          return filtered.filter((e: any) => isEventPast(e));
        case "my-events":
          return filtered.filter((e: any) => e.created_by === user?.id);
        case "my-rsvps":
          return filtered.filter((e: any) => rsvps.some((r: any) => r.event_id === e.id && r.user_id === user?.id));
        default:
          return filtered;
      }
    })();

    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase().trim();
      result = result.filter((e: any) => 
        e.title.toLowerCase().includes(lowerSearch) || 
        e.description?.toLowerCase().includes(lowerSearch) || 
        e.location?.toLowerCase().includes(lowerSearch)
      );
    }
    return result;
  })();

  const getRsvpCount = (eventId: string) => rsvps.filter((r: any) => r.event_id === eventId).length;
  const hasRsvped = (eventId: string) => rsvps.some((r: any) => r.event_id === eventId && r.user_id === user?.id);

  const openEditDialog = (event: any) => {
    setEditForm({
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      event_date: event.event_date ? format(new Date(event.event_date), "yyyy-MM-dd'T'HH:mm") : "",
      end_date: event.end_date ? format(new Date(event.end_date), "yyyy-MM-dd'T'HH:mm") : "",
      category: event.category,
    });
    setEditEvent(event);
  };

  const confirmDelete = (eventId: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This action cannot be undone.`)) {
      deleteEvent.mutate(eventId);
    }
  };

  const filters: { key: EventFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "my-events", label: "My Events" },
    { key: "my-rsvps", label: "My RSVPs" },
  ];

  const upcomingCount = events.filter((e: any) => !isEventPast(e)).length;
  const pastCount = events.filter((e: any) => isEventPast(e)).length;
  const myEventsCount = events.filter((e: any) => e.created_by === user?.id).length;

  return (
    <AppLayout>
      <SEO title="Campus Events" description="Discover upcoming campus events, workshops, hackathons, and career fairs on StudentHub. RSVP and never miss what matters." canonical="/events" keywords="campus events, student events, workshops, hackathons, studenthub events" />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-medium text-[#0F172A] tracking-tight font-serif-elegant">Events</h1>
            <p className="text-sm text-slate-500 mt-1.5">Discover and join campus events</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <button className="h-10 px-5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition-all">
                <Plus className="w-4 h-4" /> Create Event
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md">
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <input placeholder="Event title" className="oneui-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <textarea placeholder="Description (optional)" className="oneui-input min-h-[80px] resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <input placeholder="Location (optional)" className="oneui-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Start Date & Time</label>
                    <input type="datetime-local" className="oneui-input text-sm" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">End (optional)</label>
                    <input type="datetime-local" className="oneui-input text-sm" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>
                <select className="oneui-input text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                <button
                  onClick={() => createEventMutation.mutate()}
                  disabled={!form.title || !form.event_date || createEventMutation.isPending}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all disabled:opacity-50"
                >
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Event Reminders */}
        <EventReminders />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: "0.03s" }}>
          {[
            { label: "Upcoming", value: upcomingCount, color: "text-primary", bg: "bg-primary/10", icon: Calendar },
            { label: "Past Events", value: pastCount, color: "text-muted-foreground", bg: "bg-muted", icon: Clock },
            { label: "My Events", value: myEventsCount, color: "text-warning", bg: "bg-warning/10", icon: Users },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="stat-card text-center p-3 sm:p-4">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mx-auto mb-1.5`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-lg font-extrabold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>

        {searchQuery && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between animate-fade-in text-left">
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              Showing events matching <span className="font-extrabold text-primary">"{searchQuery}"</span>
            </p>
            <button 
              onClick={() => setSearchParams({})}
              className="text-xs hover:bg-slate-100/10 text-primary font-bold h-8 px-4 border border-primary/20 rounded-full transition-colors bg-white hover:bg-slate-50"
            >
              Clear Search
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="flex gap-1.5 p-1 bg-white border border-slate-100 rounded-full shadow-[0_2px_8px_rgba(15,23,42,0.01)]">
            {filters.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                  filter === key ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-4 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:border-slate-300 focus:outline-none transition-all"
          >
            <option value="all">All Categories</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>

          {/* Layout Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-100 rounded-full sm:ml-auto shadow-[0_2px_8px_rgba(15,23,42,0.01)]">
            <button
              onClick={() => setLayoutMode("list")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                layoutMode === "list" ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
              title="List View"
            >
              <Grid className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setLayoutMode("calendar")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                layoutMode === "calendar" ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
              title="Calendar View"
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar
            </button>
          </div>
        </div>

        {layoutMode === "calendar" ? (
          <CalendarView
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            categoryColors={CATEGORY_COLORS}
            getRsvpCount={getRsvpCount}
            hasRsvped={hasRsvped}
            toggleRsvp={toggleRsvp}
          />
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6">
            {/* Calendar */}
            <div className="card-premium-light bg-white p-5 animate-fade-in" style={{ animationDelay: "0.07s" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#0F172A]">{format(currentMonth, "MMMM yyyy")}</h2>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-9 h-9 rounded-xl hover:bg-muted/60 flex items-center justify-center transition-colors">
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => setCurrentMonth(new Date())} className="px-3 h-9 rounded-xl hover:bg-muted/60 text-xs font-semibold text-muted-foreground transition-colors">Today</button>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-9 h-9 rounded-xl hover:bg-muted/60 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider pb-2">{d}</div>
                ))}
                {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
                {daysInMonth.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(isSelected ? null : day)}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? "bg-slate-900 text-white font-bold"
                          : isToday(day)
                          ? "bg-slate-100 text-slate-950 font-bold border border-slate-200"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {day.getDate()}
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayEvents.slice(0, 3).map((e: any, i: number) => (
                            <span key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary-foreground/60" : "bg-primary"}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  {selectedDate ? format(selectedDate, "MMM d, yyyy") : "This Month"}
                  <span className="text-muted-foreground font-normal ml-1.5">({filteredEvents.length})</span>
                </h3>
                {selectedDate && (
                  <button onClick={() => setSelectedDate(null)} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              {filteredEvents.length === 0 ? (
                <div className="card-premium-light p-8 text-center bg-white">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">No events {selectedDate ? "on this day" : "match your filters"}</p>
                </div>
              ) : (
                filteredEvents.map((event: any) => {
                  const past = isEventPast(event);
                  const isMine = canManageEvent(event);
                  return (
                    <div key={event.id} className={`card-premium-light bg-white p-5 space-y-3 transition-opacity ${past ? "opacity-70" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.general}`}>
                              {event.category}
                            </span>
                            {past && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                Ended
                              </span>
                            )}
                            {isMine && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                Your Event
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-foreground mt-2">{event.title}</h4>
                          {event.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>}
                        </div>

                        {/* Edit/Delete buttons for event owner */}
                        {isMine && (
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => openEditDialog(event)}
                              className="w-8 h-8 rounded-xl hover:bg-muted/60 flex items-center justify-center transition-colors"
                              title="Edit event"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => confirmDelete(event.id, event.title)}
                              className="w-8 h-8 rounded-xl hover:bg-destructive/10 flex items-center justify-center transition-colors"
                              title="Delete event"
                              disabled={deleteEvent.isPending}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(event.event_date), "MMM d, h:mm a")}</span>
                        {event.end_date && (
                          <span className="flex items-center gap-1">→ {format(new Date(event.end_date), "h:mm a")}</span>
                        )}
                        {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>}
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {getRsvpCount(event.id)} going</span>
                      </div>

                      {!past ? (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => toggleRsvp.mutate(event.id)}
                            className={`w-full py-2.5 rounded-full text-xs font-semibold transition-all ${
                              hasRsvped(event.id)
                                ? "bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold"
                                : "bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                          >
                            {hasRsvped(event.id) ? (
                              <span className="flex items-center justify-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Going</span>
                            ) : "RSVP"}
                          </button>
                          {hasRsvped(event.id) && (
                            <a
                              href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${format(new Date(event.event_date), "yyyyMMdd'T'HHmmss")}/${event.end_date ? format(new Date(event.end_date), "yyyyMMdd'T'HHmmss") : format(new Date(new Date(event.event_date).getTime() + 3600000), "yyyyMMdd'T'HHmmss")}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.location || "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-slate-500 hover:text-primary font-bold text-center underline"
                            >
                              Export to Google Calendar
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="w-full py-2.5 rounded-full text-xs font-semibold text-center bg-slate-50 border border-slate-100 text-slate-400">
                          Event Ended
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={!!editEvent} onOpenChange={(open) => !open && setEditEvent(null)}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit2 className="w-5 h-5 text-primary" /> Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <input placeholder="Event title" className="oneui-input" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            <textarea placeholder="Description (optional)" className="oneui-input min-h-[80px] resize-none" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            <input placeholder="Location (optional)" className="oneui-input" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Start Date & Time</label>
                <input type="datetime-local" className="oneui-input text-sm" value={editForm.event_date} onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">End (optional)</label>
                <input type="datetime-local" className="oneui-input text-sm" value={editForm.end_date} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} />
              </div>
            </div>
            <select className="oneui-input text-sm" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => updateEventMutation.mutate()}
                disabled={!editForm.title || !editForm.event_date || updateEventMutation.isPending}
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> {updateEventMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setEditEvent(null)}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Events;