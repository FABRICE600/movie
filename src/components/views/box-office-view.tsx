"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { MOVIES } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Globe2, Trophy, ArrowUp, ArrowDown, Minus } from "lucide-react";

// Mock box office data — real deployments would integrate with TMDB movie lists
// or a dedicated box-office API (e.g., Box Office Mojo, The Numbers).
interface BoxOfficeEntry {
  rank: number;
  movie: (typeof MOVIES)[number];
  weekendGross: number; // USD millions
  totalGross: number; // USD millions
  change: number; // % wow
  weeks: number;
  markets: number;
}

const TOP_10_GLOBAL: BoxOfficeEntry[] = MOVIES.slice(0, 10).map((m, i) => ({
  rank: i + 1,
  movie: m,
  weekendGross: Math.round((250 - i * 18 + (Math.sin(i) * 7)) * 10) / 10,
  totalGross: Math.round((250 - i * 18) * (3 + i * 0.4) * 10) / 10,
  change: Math.round((Math.sin(i * 1.7) * 30) * 10) / 10,
  weeks: 1 + Math.floor(i / 2),
  markets: 75 - i * 4,
}));

const TOP_5_REGIONS = [
  { region: "North America", entries: TOP_10_GLOBAL.slice(0, 5), flag: "🇺🇸" },
  { region: "Europe (UK, FR, DE)", entries: TOP_10_GLOBAL.slice(2, 7).reverse(), flag: "🇪🇺" },
  { region: "East Asia (JP, KR, CN)", entries: TOP_10_GLOBAL.slice(4, 9), flag: "🌏" },
  { region: "Africa (NG, KE, ZA)", entries: TOP_10_GLOBAL.slice(6, 10).concat(TOP_10_GLOBAL.slice(0, 1)), flag: "🌍" },
];

export function BoxOfficeView() {
  const navigate = useAppStore((s) => s.navigate);
  const [tab, setTab] = useState<"global" | "regional">("global");

  const totalGlobal = TOP_10_GLOBAL.reduce((s, e) => s + e.weekendGross, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <DollarSign className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            Box Office
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tracking global and regional box office performance.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <TrendingUp className="h-4 w-4" /> Top 10 weekend
            </div>
            <div className="text-2xl font-bold mt-1">${totalGlobal.toFixed(1)}M</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Trophy className="h-4 w-4" /> #1 this week
            </div>
            <div className="text-lg font-bold mt-1 truncate">{TOP_10_GLOBAL[0].movie.title}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Globe2 className="h-4 w-4" /> Top markets
            </div>
            <div className="text-2xl font-bold mt-1">{TOP_10_GLOBAL[0].markets}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <TrendingUp className="h-4 w-4" /> Best new opener
            </div>
            <div className="text-lg font-bold mt-1 truncate">
              {TOP_10_GLOBAL.find((e) => e.weeks === 1)?.movie.title ?? "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab("global")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "global" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Global Top 10
        </button>
        <button
          onClick={() => setTab("regional")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "regional" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Regional breakdowns
        </button>
      </div>

      {tab === "global" ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left p-3 font-medium">#</th>
                <th className="text-left p-3 font-medium">Title</th>
                <th className="text-right p-3 font-medium">Weekend</th>
                <th className="text-right p-3 font-medium">Total</th>
                <th className="text-right p-3 font-medium">+/- Wow</th>
                <th className="text-right p-3 font-medium hidden sm:table-cell">Wks</th>
                <th className="text-right p-3 font-medium hidden sm:table-cell">Markets</th>
              </tr>
            </thead>
            <tbody>
              {TOP_10_GLOBAL.map((entry) => (
                <tr
                  key={entry.movie.id}
                  className="border-t border-border hover:bg-muted/40 cursor-pointer"
                  onClick={() => navigate("movie", { id: entry.movie.id })}
                >
                  <td className="p-3 font-bold">{entry.rank}</td>
                  <td className="p-3">
                    <div className="font-medium">{entry.movie.title}</div>
                    <div className="text-xs text-muted-foreground">{entry.movie.year} · {entry.movie.genreNames.slice(0, 2).join(", ")}</div>
                  </td>
                  <td className="p-3 text-right font-mono">${entry.weekendGross.toFixed(1)}M</td>
                  <td className="p-3 text-right font-mono">${entry.totalGross.toFixed(1)}M</td>
                  <td className="p-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-mono ${
                        entry.change > 0 ? "text-green-500" : entry.change < 0 ? "text-red-500" : "text-muted-foreground"
                      }`}
                    >
                      {entry.change > 0 ? <ArrowUp className="h-3 w-3" /> : entry.change < 0 ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      {Math.abs(entry.change)}%
                    </span>
                  </td>
                  <td className="p-3 text-right hidden sm:table-cell">{entry.weeks}</td>
                  <td className="p-3 text-right hidden sm:table-cell">{entry.markets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {TOP_5_REGIONS.map((region) => (
            <Card key={region.region} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{region.flag}</span>
                  <h3 className="font-bold">{region.region}</h3>
                </div>
                <ol className="space-y-2">
                  {region.entries.map((e, i) => (
                    <li
                      key={e.movie.id}
                      className="flex items-center justify-between gap-2 text-sm py-1 cursor-pointer hover:bg-muted/40 rounded px-2"
                      onClick={() => navigate("movie", { id: e.movie.id })}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-muted-foreground font-mono w-5">{i + 1}.</span>
                        <span className="truncate">{e.movie.title}</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">${e.weekendGross.toFixed(1)}M</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground border border-border rounded-lg p-3 bg-muted/30">
        <strong>Note:</strong> Box office figures shown are illustrative demo data. Real deployments should integrate
        with a dedicated box-office provider or TMDB&apos;s movie lists endpoint. Always cite the source of financial data.
      </p>
    </div>
  );
}
