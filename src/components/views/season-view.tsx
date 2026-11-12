"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TV_SHOWS } from "@/lib/mock-data";
import {
  ChevronLeft,
  Play,
  Star,
  Calendar,
  Clock,
  Users,
  Tv,
  ArrowRight,
} from "lucide-react";

interface Episode {
  id: number;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  overview: string;
  airDate: string;
  runtime: number;
  rating: number;
  stillUrl: string;
  guestStars: { id: number; name: string; character: string; profileUrl: string }[];
}

// Generate mock episode data for a TV show season.
// Real deployments would call TMDB /tv/{id}/season/{n}
function generateSeasonEpisodes(tvId: number, seasonNumber: number, totalEps: number): Episode[] {
  const show = TV_SHOWS.find((m) => m.id === tvId);
  const episodes: Episode[] = [];
  const baseDate = new Date(2020 + (seasonNumber % 5), 0, 7);

  for (let i = 1; i <= totalEps; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + (i - 1) * 7);
    episodes.push({
      id: tvId * 1000 + seasonNumber * 100 + i,
      episodeNumber: i,
      seasonNumber,
      title: `Episode ${i}: ${["Pilot", "Awakening", "Crossroads", "Echoes", "Betrayal", "Reckoning", "Rebirth", "Storm", "Reflection", "Resolution", "Aftermath", "Legacy"][i - 1] ?? `Chapter ${i}`}`,
      overview: show
        ? `${show.title} season ${seasonNumber} continues with episode ${i}. ${show.overview.slice(0, 120)}`
        : `Episode ${i} of season ${seasonNumber}.`,
      airDate: date.toISOString().slice(0, 10),
      runtime: 45 + (i % 3) * 5,
      rating: Math.max(5, Math.min(9.5, (show?.voteAverage ?? 8) - 0.3 + Math.sin(i + seasonNumber) * 0.5)),
      stillUrl: show?.backdropUrl ?? show?.posterUrl ?? "",
      guestStars: i % 3 === 0
        ? (show?.cast ?? []).slice(2, 4).map((c: any) => ({ id: c.id, name: c.name, character: c.character, profileUrl: c.profileUrl }))
        : [],
    });
  }
  return episodes;
}

export function SeasonDetailView() {
  const params = useAppStore((s) => s.params);
  const navigate = useAppStore((s) => s.navigate);
  const tvId = parseInt(String(params.tvId ?? params.id ?? "0"));
  const seasonNumber = parseInt(String(params.seasonNumber ?? params.season ?? "1"));

  const { data: show, isLoading } = useQuery({
    queryKey: ["tv-details", tvId],
    queryFn: () => tmdb.getTvDetails(tvId),
    enabled: !!tvId,
  });

  const episodes = useMemo(
    () => (show ? generateSeasonEpisodes(tvId, seasonNumber, Math.min(show.episodes ?? 10, show.episodes ? Math.max(1, Math.floor(show.episodes / Math.max(1, show.seasons ?? 1))) : 10)) : []),
    [show, tvId, seasonNumber]
  );

  if (isLoading || !show) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <button onClick={() => navigate("tv-details", { id: tvId })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to {show.title}
      </button>

      {/* Season header */}
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-32 sm:h-40 bg-muted">
            <img src={show.backdropUrl} alt={show.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Tv className="h-4 w-4 text-primary" />
                <Badge variant="secondary">{show.year}</Badge>
                <Badge variant="outline">Season {seasonNumber}</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{show.title} — Season {seasonNumber}</h1>
              <p className="text-sm text-muted-foreground mt-1">{episodes.length} episodes · Avg runtime ~{episodes[0]?.runtime ?? 45} min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Season navigation */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: show.seasons ?? 1 }).map((_, i) => {
          const n = i + 1;
          return (
            <Button
              key={n}
              variant={n === seasonNumber ? "default" : "outline"}
              size="sm"
              onClick={() => navigate("season", { tvId, seasonNumber: n })}
            >
              Season {n}
            </Button>
          );
        })}
      </div>

      {/* Episodes list */}
      <div className="space-y-3">
        {episodes.map((ep) => (
          <EpisodeCard
            key={ep.id}
            episode={ep}
            onPlay={() => navigate("episode", { tvId, seasonNumber, episodeNumber: ep.episodeNumber })}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground border border-border rounded-lg p-3 bg-muted/30">
        Episode-level data shown is illustrative demo data. Real deployments should fetch from TMDB&apos;s
        /tv/{`{id}`}/season/{`{n}`}/episode/{`{e}`} endpoints for canonical titles, overviews, stills, and guest stars.
      </p>
    </div>
  );
}

function EpisodeCard({ episode, onPlay }: { episode: Episode; onPlay: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-0">
        <div className="grid sm:grid-cols-[200px_1fr] gap-0">
          <button onClick={onPlay} className="relative aspect-video sm:aspect-auto bg-muted group">
            <img src={episode.stillUrl} alt={episode.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-4 w-4 fill-current ml-0.5" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-xs font-bold">
              E{episode.episodeNumber}
            </div>
          </button>
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <button onClick={onPlay} className="text-left">
                <h3 className="font-bold hover:text-primary transition-colors line-clamp-1">{episode.title}</h3>
              </button>
              <Badge variant="secondary" className="text-xs shrink-0">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                {episode.rating.toFixed(1)}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {new Date(episode.airDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {episode.runtime} min
              </span>
            </div>
            <p className={`text-sm text-muted-foreground ${expanded ? "" : "line-clamp-2"}`}>
              {episode.overview}
            </p>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-primary hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
            {episode.guestStars.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Guest stars
                </p>
                <div className="flex flex-wrap gap-3">
                  {episode.guestStars.map((g) => (
                    <div key={g.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={g.profileUrl} alt={g.name} />
                        <AvatarFallback className="text-[10px]">{g.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-xs font-medium">{g.name}</div>
                        <div className="text-[10px] text-muted-foreground">{g.character}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onPlay} className="gap-1 w-full sm:w-auto">
              <Play className="h-3 w-3 fill-current" /> View episode <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
