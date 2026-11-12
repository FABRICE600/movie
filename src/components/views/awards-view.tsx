"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { MOVIES, TV_SHOWS, PEOPLE } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Medal, Star, Film, Tv, Users, Calendar } from "lucide-react";

interface AwardEvent {
  id: string;
  name: string;
  organizer: string;
  category: "FILM" | "TV" | "FESTIVAL";
  nextCeremony: string;
  country: string;
  description: string;
}

interface AwardNominee {
  categoryId: string;
  category: string;
  year: number;
  winnerId: number;
  winnerTitle: string;
  winnerType: "MOVIE" | "TV" | "PERSON";
  nominees: { id: number; title: string }[];
}

const AWARD_EVENTS: AwardEvent[] = [
  {
    id: "oscars",
    name: "Academy Awards (Oscars)",
    organizer: "Academy of Motion Picture Arts and Sciences",
    category: "FILM",
    nextCeremony: "2026-03-22",
    country: "United States",
    description: "The most prestigious film award, honoring cinematic achievement since 1929.",
  },
  {
    id: "golden-globes",
    name: "Golden Globe Awards",
    organizer: "Hollywood Foreign Press Association",
    category: "FILM",
    nextCeremony: "2026-01-11",
    country: "United States",
    description: "Honoring excellence in film and television, voted by international journalists.",
  },
  {
    id: "bafta",
    name: "BAFTA Awards",
    organizer: "British Academy of Film and Television Arts",
    category: "FILM",
    nextCeremony: "2026-02-15",
    country: "United Kingdom",
    description: "The leading British awards for film, television, and games.",
  },
  {
    id: "emmy",
    name: "Primetime Emmy Awards",
    organizer: "Academy of Television Arts & Sciences",
    category: "TV",
    nextCeremony: "2026-09-13",
    country: "United States",
    description: "Recognizing excellence in American primetime television programming.",
  },
  {
    id: "cannes",
    name: "Cannes Film Festival",
    organizer: "Festival de Cannes",
    category: "FESTIVAL",
    nextCeremony: "2026-05-13",
    country: "France",
    description: "The world's most prestigious film festival, with the Palme d'Or as its top prize.",
  },
  {
    id: "venice",
    name: "Venice Film Festival",
    organizer: "La Biennale di Venezia",
    category: "FESTIVAL",
    nextCeremony: "2026-09-02",
    country: "Italy",
    description: "The oldest film festival in the world, awarding the Golden Lion.",
  },
  {
    id: "berlinale",
    name: "Berlin International Film Festival",
    organizer: "Berlinale",
    category: "FESTIVAL",
    nextCeremony: "2026-02-19",
    country: "Germany",
    description: "One of the world's leading film festivals, awarding the Golden Bear.",
  },
  {
    id: "africa-movie-academy",
    name: "Africa Movie Academy Awards (AMAAs)",
    organizer: "Africa Film Academy",
    category: "FILM",
    nextCeremony: "2026-10-25",
    country: "Nigeria",
    description: "Honoring excellence in African cinema, celebrating the continent's storytelling.",
  },
  {
    id: "sagg",
    name: "Screen Actors Guild Awards",
    organizer: "SAG-AFTRA",
    category: "FILM",
    nextCeremony: "2026-02-28",
    country: "United States",
    description: "Peer-voted awards recognizing outstanding performances in film and television.",
  },
];

// Build mock nominees for top awards
const WINNERS_2025: AwardNominee[] = [
  { categoryId: "best-picture", category: "Best Picture", year: 2025, winnerId: 102, winnerTitle: MOVIES.find((m) => m.id === 102)?.title ?? "—", winnerType: "MOVIE", nominees: MOVIES.slice(0, 5).map((m) => ({ id: m.id, title: m.title })) },
  { categoryId: "best-director", category: "Best Director", year: 2025, winnerId: 1, winnerTitle: PEOPLE[0]?.name ?? "—", winnerType: "PERSON", nominees: PEOPLE.slice(0, 5).map((p) => ({ id: p.id, title: p.name })) },
  { categoryId: "best-actor", category: "Best Actor", year: 2025, winnerId: 2, winnerTitle: PEOPLE[1]?.name ?? "—", winnerType: "PERSON", nominees: PEOPLE.slice(1, 6).map((p) => ({ id: p.id, title: p.name })) },
  { categoryId: "best-actress", category: "Best Actress", year: 2025, winnerId: 3, winnerTitle: PEOPLE[2]?.name ?? "—", winnerType: "PERSON", nominees: PEOPLE.slice(2, 7).map((p) => ({ id: p.id, title: p.name })) },
  { categoryId: "best-supporting", category: "Best Supporting Actor", year: 2025, winnerId: 4, winnerTitle: PEOPLE[3]?.name ?? "—", winnerType: "PERSON", nominees: PEOPLE.slice(3, 8).map((p) => ({ id: p.id, title: p.name })) },
  { categoryId: "best-drama-tv", category: "Best Drama Series", year: 2025, winnerId: 201, winnerTitle: TV_SHOWS[0]?.title ?? "—", winnerType: "TV", nominees: TV_SHOWS.slice(0, 5).map((t) => ({ id: t.id, title: t.title })) },
];

export function AwardsView() {
  const navigate = useAppStore((s) => s.navigate);
  const [selectedEvent, setSelectedEvent] = useState<AWARD_EVENTS>(AWARD_EVENTS);
  const [filter, setFilter] = useState<"ALL" | "FILM" | "TV" | "FESTIVAL">("ALL");

  const filteredEvents = AWARD_EVENTS.filter((e) => filter === "ALL" || e.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-yellow-500/15 text-yellow-500 flex items-center justify-center">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Awards & Festivals</h1>
          <p className="text-sm text-muted-foreground mt-1">Track winners, nominees, and upcoming ceremonies worldwide.</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "FILM", "TV", "FESTIVAL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              filter === f ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border hover:bg-muted"
            }`}
          >
            {f === "ALL" ? "All awards" : f === "FILM" ? "Film awards" : f === "TV" ? "TV awards" : "Festivals"}
          </button>
        ))}
      </div>

      {/* Award events grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event) => {
          const Icon = event.category === "TV" ? Tv : event.category === "FESTIVAL" ? Film : Award;
          return (
            <Card
              key={event.id}
              className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => navigate("discover", { q: event.name })}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/15 text-yellow-500 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm leading-tight">{event.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{event.organizer}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="secondary" className="text-[10px]">{event.country}</Badge>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Next: {new Date(event.nextCeremony).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 2025 winners showcase */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Medal className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg sm:text-xl font-bold">2025 winners spotlight</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WINNERS_2025.map((w) => {
            const Icon = w.winnerType === "PERSON" ? Users : w.winnerType === "TV" ? Tv : Film;
            return (
              <Card key={w.categoryId} className="bg-gradient-to-br from-card to-yellow-500/5 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-muted-foreground">{w.category} · {w.year}</span>
                  </div>
                  <button
                    onClick={() => navigate(w.winnerType === "TV" ? "tv-details" : w.winnerType === "PERSON" ? "person" : "movie", { id: w.winnerId })}
                    className="text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-bold hover:text-primary transition-colors">{w.winnerTitle}</span>
                    </div>
                  </button>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Also nominated</p>
                    <div className="flex flex-wrap gap-1">
                      {w.nominees
                        .filter((n) => n.id !== w.winnerId)
                        .slice(0, 4)
                        .map((n) => (
                          <Badge key={n.id} variant="outline" className="text-[10px]">{n.title}</Badge>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <p className="text-xs text-muted-foreground border border-border rounded-lg p-3 bg-muted/30">
        <strong>Note:</strong> Awards data shown is illustrative demo data. Real deployments should integrate with
        a curated awards dataset or external API. Always verify official results from the awarding organization.
      </p>
    </div>
  );
}
