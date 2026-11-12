"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { MOVIES, TV_SHOWS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitCompare, Star, Clock, DollarSign, TrendingUp, Calendar, Globe, Users, Trophy, X } from "lucide-react";

const ALL = [...MOVIES, ...TV_SHOWS];

export function CompareView() {
  const navigate = useAppStore((s) => s.navigate);
  const [aId, setAId] = useState<number>(MOVIES[0]?.id ?? 0);
  const [bId, setBId] = useState<number>(MOVIES[1]?.id ?? 0);

  const a = ALL.find((m) => m.id === aId);
  const b = ALL.find((m) => m.id === bId);

  if (!a || !b) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-muted-foreground">Select two titles to compare.</div>;
  }

  const winner = (aVal: number, bVal: number, higher = true) => {
    if (aVal === bVal) return "tie";
    return higher ? (aVal > bVal ? "a" : "b") : (aVal < bVal ? "a" : "b");
  };

  const rows: { label: string; icon: typeof Star; a: string | number; b: string | number; aVal: number; bVal: number; higher?: boolean }[] = [
    { label: "Rating", icon: Star, a: a.voteAverage.toFixed(1), b: b.voteAverage.toFixed(1), aVal: a.voteAverage, bVal: b.voteAverage },
    { label: "Vote count", icon: Users, a: a.voteCount.toLocaleString(), b: b.voteCount.toLocaleString(), aVal: a.voteCount, bVal: b.voteCount },
    { label: "Popularity", icon: TrendingUp, a: Math.round(a.popularity).toLocaleString(), b: Math.round(b.popularity).toLocaleString(), aVal: a.popularity, bVal: b.popularity },
    { label: "Runtime", icon: Clock, a: a.runtime ? `${a.runtime} min` : "—", b: b.runtime ? `${b.runtime} min` : "—", aVal: a.runtime ?? 0, bVal: b.runtime ?? 0 },
    { label: "Budget", icon: DollarSign, a: a.budget ? `$${(a.budget / 1e6).toFixed(0)}M` : "—", b: b.budget ? `$${(b.budget / 1e6).toFixed(0)}M` : "—", aVal: a.budget ?? 0, bVal: b.budget ?? 0 },
    { label: "Revenue", icon: DollarSign, a: a.revenue ? `$${(a.revenue / 1e6).toFixed(0)}M` : "—", b: b.revenue ? `$${(b.revenue / 1e6).toFixed(0)}M` : "—", aVal: a.revenue ?? 0, bVal: b.revenue ?? 0 },
    { label: "Release year", icon: Calendar, a: a.year, b: b.year, aVal: parseInt(a.year), bVal: parseInt(b.year) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <GitCompare className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Movie Comparison</h1>
          <p className="text-sm text-muted-foreground mt-1">Side-by-side comparison of any two titles.</p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Title A</label>
          <Select value={String(aId)} onValueChange={(v) => setAId(parseInt(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALL.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>{m.title} ({m.year})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Title B</label>
          <Select value={String(bId)} onValueChange={(v) => setBId(parseInt(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALL.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>{m.title} ({m.year})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Swap button */}
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={() => { setAId(bId); setBId(aId); }}>
          <X className="h-4 w-4 rotate-90" /> Swap A & B
        </Button>
      </div>

      {/* Comparison cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[a, b].map((item, idx) => (
          <Card key={idx} className="bg-card border-border overflow-hidden">
            <button onClick={() => navigate(item.mediaType === "TV" ? "tv-details" : "movie", { id: item.id })} className="block w-full text-left">
              <div className="relative aspect-video bg-muted">
                <img src={item.backdropUrl} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <Badge className="mb-1">{idx === 0 ? "A" : "B"}</Badge>
                  <h2 className="text-xl font-bold">{item.title}</h2>
                  <p className="text-xs text-white/80">{item.year} · {item.genreNames.slice(0, 3).join(", ")}</p>
                </div>
              </div>
            </button>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{item.overview}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.genreNames.map((g) => (
                  <Badge key={g} variant="outline" className="text-[10px]">{g}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left p-3 font-medium">Metric</th>
                  <th className="text-right p-3 font-medium">{a.title}</th>
                  <th className="text-right p-3 font-medium">{b.title}</th>
                  <th className="text-center p-3 font-medium hidden sm:table-cell">Winner</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const Icon = row.icon;
                  const w = winner(row.aVal, row.bVal, row.higher);
                  return (
                    <tr key={row.label} className="border-t border-border">
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon className="h-4 w-4" /> {row.label}
                        </div>
                      </td>
                      <td className={`p-3 text-right font-mono ${w === "a" ? "text-primary font-bold" : ""}`}>{row.a}</td>
                      <td className={`p-3 text-right font-mono ${w === "b" ? "text-primary font-bold" : ""}`}>{row.b}</td>
                      <td className="p-3 text-center hidden sm:table-cell">
                        {w === "tie" ? (
                          <span className="text-muted-foreground text-xs">tie</span>
                        ) : (
                          <Trophy className={`h-4 w-4 inline ${w === "a" ? "text-primary" : "text-primary"}`} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cast comparison */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[a, b].map((item, idx) => (
          <Card key={idx} className="bg-card border-border">
            <CardContent className="p-4">
              <h3 className="font-bold text-sm mb-3">Top cast</h3>
              <div className="space-y-2">
                {item.cast.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate("person", { id: c.id })}
                    className="flex items-center gap-2 w-full text-left hover:bg-muted/40 rounded p-1"
                  >
                    <img src={c.profileUrl} alt={c.name} className="h-8 w-8 rounded-full object-cover bg-muted" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.character}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
