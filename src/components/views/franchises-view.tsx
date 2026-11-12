"use client";

import { useAppStore } from "@/store/app-store";
import { MOVIES, TV_SHOWS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, Film, Tv, ChevronRight, Flame, TrendingUp } from "lucide-react";

interface Franchise {
  id: string;
  name: string;
  description: string;
  totalTitles: number;
  totalRevenue: number; // millions
  avgRating: number;
  status: "ACTIVE" | "COMPLETED" | "HIATUS";
  movies: { id: number; title: string; year: string; posterUrl: string; revenue?: number; rating: number }[];
  timeline: { year: string; event: string }[];
}

// Build franchises by grouping movies
function buildFranchises(): Franchise[] {
  const all = [...MOVIES, ...TV_SHOWS];

  const franchiseDefs = [
    {
      id: "echoes-of-tomorrow",
      name: "Echoes of Tomorrow Saga",
      description: "A multi-film science fiction epic exploring humanity's relationship with time and memory.",
      matcher: (m: typeof all[number]) => m.title.toLowerCase().includes("echoes") || m.id === 102,
    },
    {
      id: "northern-crown",
      name: "Northern Crown Chronicles",
      description: "A sweeping historical fantasy series spanning decades of dynastic conflict.",
      matcher: (m: typeof all[number]) => m.title.toLowerCase().includes("northern") || m.id === 103,
    },
    {
      id: "kigali-nights",
      name: "Kigali Stories",
      description: "A celebrated series of East African cinema exploring life, music, and identity in modern Rwanda.",
      matcher: (m: typeof all[number]) => m.title.toLowerCase().includes("kigali") || m.id === 115,
    },
    {
      id: "neon-lotus",
      name: "Neon Lotus Universe",
      description: "A cyberpunk franchise spanning film and television.",
      matcher: (m: typeof all[number]) => m.title.toLowerCase().includes("neon") || m.id === 207,
    },
  ];

  return franchiseDefs.map((def) => {
    const matched = all.filter(def.matcher);
    // Pad with related titles if needed
    const padded = matched.length < 3 ? [...matched, ...all.filter((m) => !matched.includes(m)).slice(0, 4 - matched.length)] : matched;
    const totalRevenue = padded.reduce((s, m) => s + (m.revenue ?? 0), 0) / 1e6;
    const avgRating = padded.length ? padded.reduce((s, m) => s + m.voteAverage, 0) / padded.length : 0;
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      totalTitles: padded.length,
      totalRevenue: Math.round(totalRevenue),
      avgRating: Math.round(avgRating * 10) / 10,
      status: "ACTIVE" as const,
      movies: padded.slice(0, 6).map((m) => ({
        id: m.id,
        title: m.title,
        year: m.year,
        posterUrl: m.posterUrl,
        revenue: m.revenue,
        rating: m.voteAverage,
      })),
      timeline: padded.slice(0, 6).map((m, i) => ({
        year: m.year,
        event: `${m.title} released`,
      })),
    };
  });
}

export function FranchisesView() {
  const navigate = useAppStore((s) => s.navigate);
  const franchises = buildFranchises();

  const watchOrder = (movies: Franchise["movies"]) => {
    // Sort by year — chronological watch order
    return [...movies].sort((a, b) => parseInt(a.year) - parseInt(b.year));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Movie Franchises</h1>
          <p className="text-sm text-muted-foreground mt-1">Explore cinematic universes and franchise watch orders.</p>
        </div>
      </div>

      {/* Franchise cards */}
      <div className="space-y-6">
        {franchises.map((franchise) => {
          const chronological = watchOrder(franchise.movies);
          return (
            <Card key={franchise.id} className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                {/* Header banner */}
                <div className="relative h-32 sm:h-40 bg-gradient-to-br from-primary/30 to-accent/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
                  <div className="relative p-5 sm:p-6">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black">{franchise.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{franchise.description}</p>
                      </div>
                      <Badge variant="secondary">
                        {franchise.status === "ACTIVE" && <Flame className="h-3 w-3 mr-1" />}
                        {franchise.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                  <div className="p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Titles</div>
                    <div className="text-lg font-bold">{franchise.totalTitles}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Total revenue</div>
                    <div className="text-lg font-bold">${franchise.totalRevenue}M</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Avg rating</div>
                    <div className="text-lg font-bold flex items-center justify-center gap-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      {franchise.avgRating.toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Titles grid + watch order */}
                <div className="grid lg:grid-cols-[1fr_280px] gap-4 p-5">
                  <div>
                    <h3 className="text-sm font-bold mb-3">Films in franchise</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {franchise.movies.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => navigate("movie", { id: m.id })}
                          className="text-left group"
                        >
                          <div className="aspect-[2/3] rounded overflow-hidden bg-muted border border-border">
                            <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <p className="text-xs mt-1.5 line-clamp-1">{m.title}</p>
                          <p className="text-[10px] text-muted-foreground">{m.year}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chronological watch order */}
                  <aside className="bg-muted/30 rounded-lg p-3">
                    <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
                      <ChevronRight className="h-4 w-4 text-primary" /> Watch order
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">Chronological</p>
                    <ol className="space-y-2">
                      {chronological.map((m, i) => (
                        <li key={m.id}>
                          <button
                            onClick={() => navigate("movie", { id: m.id })}
                            className="flex items-center gap-2 w-full text-left hover:bg-muted/60 rounded p-1.5"
                          >
                            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                              {i + 1}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium truncate">{m.title}</div>
                              <div className="text-[10px] text-muted-foreground">{m.year}</div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ol>
                  </aside>
                </div>

                {/* Timeline */}
                <div className="border-t border-border p-5">
                  <h3 className="text-sm font-bold mb-3">Franchise timeline</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {chronological.map((m, i) => (
                      <div key={m.id} className="min-w-[140px] flex items-start gap-2">
                        <div className="flex flex-col items-center pt-1">
                          <div className={`h-3 w-3 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground"} ring-4 ring-muted/40`} />
                          {i < chronological.length - 1 && <div className="w-px flex-1 bg-border mt-1" style={{ minHeight: 20 }} />}
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{m.year}</div>
                          <div className="text-xs font-medium">{m.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground border border-border rounded-lg p-3 bg-muted/30">
        Franchise groupings are illustrative demo data built from the catalog. Real deployments should use TMDB&apos;s
        /collection/{`{id}`} endpoints to fetch canonical franchise data with verified titles and ordering.
      </p>
    </div>
  );
}
