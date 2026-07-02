import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  event_date: string;
  end_date?: string;
  category: string;
  created_by: string;
}

interface CalendarViewProps {
  events: Event[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  categoryColors: Record<string, string>;
  getRsvpCount: (id: string) => number;
  hasRsvped: (id: string) => boolean;
  toggleRsvp: { mutate: (id: string) => void };
}

export default function CalendarView({
  events,
  selectedDate,
  onSelectDate,
  categoryColors,
  getRsvpCount,
  hasRsvped,
  toggleRsvp,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay(); // 0 = Sunday, 1 = Monday, etc.

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.event_date), day));

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDayClick = (day: Date) => {
    if (selectedDate && isSameDay(selectedDate, day)) {
      onSelectDate(null); // Toggle off if clicked again
    } else {
      onSelectDate(day);
    }
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center border-b border-slate-100 dark:border-slate-800 pb-2">
          {weekDays.map((d) => (
            <span key={d} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Padding days for start of month */}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}

          {/* Actual days */}
          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isSelected = selectedDate ? isSameDay(selectedDate, day) : false;
            const currentDayIsToday = isToday(day);

            return (
              <button
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md scale-105"
                    : currentDayIsToday
                    ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="text-xs font-extrabold">{format(day, "d")}</span>

                {/* Event Indicator Dots */}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 justify-center mt-0.5 max-w-full overflow-hidden px-1">
                    {dayEvents.slice(0, 3).map((e) => {
                      let dotColor = "bg-primary";
                      if (e.category === "workshop") dotColor = "bg-amber-500";
                      else if (e.category === "hackathon") dotColor = "bg-purple-500";
                      else if (e.category === "seminar") dotColor = "bg-emerald-500";
                      else if (e.category === "social") dotColor = "bg-rose-500";
                      else if (e.category === "career") dotColor = "bg-sky-500";

                      return (
                        <span
                          key={e.id}
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isSelected ? "bg-white dark:bg-slate-950" : dotColor
                          }`}
                        />
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className={`text-[7px] leading-none font-black ${isSelected ? "text-white" : "text-slate-400"}`}>
                        +
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Panel */}
      <div className="bg-white/80 backdrop-blur-md dark:bg-slate-900/80 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col min-h-[320px]">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
            {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {selectedDate ? `${selectedDayEvents.length} events scheduled` : "Choose a date to view events"}
          </p>
        </div>

        {selectedDate ? (
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-1">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => {
                const isGoing = hasRsvped(event.id);
                const rsvpsCount = getRsvpCount(event.id);
                return (
                  <div
                    key={event.id}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-left">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold mb-1.5 uppercase tracking-wider ${categoryColors[event.category] || "bg-slate-100 text-slate-700"}`}>
                          {event.category}
                        </span>
                        <h5 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs leading-snug">
                          {event.title}
                        </h5>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-normal">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-col gap-1 text-[9px] text-slate-400 dark:text-slate-500">
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {event.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {format(new Date(event.event_date), "h:mm a")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100/60 dark:border-slate-800/40 pt-2 mt-1">
                      <span className="text-[9px] font-extrabold text-slate-400">
                        {rsvpsCount} RSVP{rsvpsCount !== 1 && "s"}
                      </span>
                      <button
                        onClick={() => toggleRsvp.mutate(event.id)}
                        className={`h-7 px-3.5 rounded-full font-bold text-[9px] flex items-center gap-1 transition-all ${
                          isGoing
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {isGoing ? "Going ✓" : "RSVP"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center text-slate-400 gap-2">
                <span className="text-2xl">🍃</span>
                <p className="text-[10px] font-bold">No events for this day</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
            <CalendarIcon className="w-8 h-8 opacity-20" />
            <p className="text-[10px] font-bold">Select a date on the calendar to view its schedule</p>
          </div>
        )}
      </div>
    </div>
  );
}
