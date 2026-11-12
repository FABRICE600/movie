"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { MOVIES, TV_SHOWS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight, Film, Tv, Bell } from "lucide-react";
import { toast } from "sonner";

interface ReleaseItem {
  id: number;
  title: string;
  date: string;
  mediaType: "MOVIE" | "TV";
  posterUrl: string;
  genreNames: string[];
}

// Build a 90-day release calendar starting today
function buildReleases(): ReleaseItem[] {
  const today = new Date();
  const items: ReleaseItem[] = [];
  const combined = [...MOVIES, ...TV_SHOWS];

  combined.forEach((m, i) => {
    // Distribute releases across the next 90 days
    const dayOffset = (i * 7 + (m.id % 5)) % 90;
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    items.push({
      id: m.id,
      title: m.title,
      date: date.toISOString().slice(0, 10),
      mediaType: m.mediaType,
      posterUrl: m.posterUrl,
      genreNames: m.genreNames,
    });
  });
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function CalendarView() {
  const navigate = useAppStore((s) => s.navigate);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const releases = useMemo(() => buildReleases(), []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const releasesThisMonth = releases.filter((r) => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const releasesByDay: Record<number, ReleaseItem[]> = {};
  releasesThisMonth.forEach((r) => {
    const day = new Date(r.date).getDate();
    if (!releasesByDay[day]) releasesByDay[day] = [];
    releasesByDay[day].push(r);
  });

  const upcoming = releases.slice(0, 8);

  const setReminder = (item: ReleaseItem) => {
    toast.success(`Reminder set for "${item.title}" on ${new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <CalendarDays className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Release Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Upcoming theatrical and streaming premieres.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar grid */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-bold">{MONTHS[month]} {year}</h2>
              <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`pre-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const items = releasesByDay[day] ?? [];
                const todayDate = new Date();
                const isToday =
                  todayDate.getFullYear() === year &&
                  todayDate.getMonth() === month &&
                  todayDate.getDate() === day;
                return (
                  <div
                    key={day}
                    className={`aspect-square p-1 border border-border rounded text-xs ${
                      isToday ? "bg-primary/10 border-primary" : "bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className={`font-semibold ${isToday ? "text-primary" : ""}`}>{day}</div>
                    <div className="mt-0.5 space-y-0.5 overflow-hidden">
                      {items.slice(0, 2).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => navigate(item.mediaType === "TV" ? "tv-details" : "movie", { id: item.id })}
                          className="block w-full text-left truncate text-[10px] px-1 rounded bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                          title={item.title}
                        >
                          {item.title}
                        </button>
                      ))}
                      {items.length > 2 && (
                        <div className="text-[9px] text-muted-foreground px-1">+{items.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming list */}
        <aside className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Releasing soon</h3>
            <Badge variant="secondary">{upcoming.length}</Badge>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {upcoming.map((item) => {
              const Icon = item.mediaType === "TV" ? Tv : Film;
              const d = new Date(item.date);
              return (
                <Card key={item.id} className="bg-card border-border">
                  <CardContent className="p-3 flex gap-3">
                    <button
                      onClick={() => navigate(item.mediaType === "TV" ? "tv-details" : "movie", { id: item.id })}
                      className="shrink-0"
                    >
                      <img src={item.posterUrl} alt={item.title} className="h-16 w-12 rounded object-cover bg-muted" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item.mediaType}</span>
                      </div>
                      <button
                        onClick={() => navigate(item.mediaType === "TV" ? "tv-details" : "movie", { id: item.id })}
                        className="block text-sm font-semibold text-left hover:text-primary truncate w-full"
                      >
                        {item.title}
                      </button>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 mt-1.5 text-[10px] gap-1"
                        onClick={() => setReminder(item)}
                      >
                        <Bell className="h-3 w-3" /> Remind me
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </aside>
      </div>

      <p className="text-xs text-muted-foreground border border-border rounded-lg p-3 bg-muted/30">
        <strong>Note:</strong> Release dates shown are illustrative demo data spread across the next 90 days. Real
        deployments should pull upcoming releases from TMDB&apos;s /movie/upcoming and /tv/airing_today endpoints.
      </p>
    </div>
  );
}
