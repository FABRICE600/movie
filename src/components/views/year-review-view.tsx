"use client";

import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { MOVIES, TV_SHOWS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarHeart,
  Trophy,
  Star,
  Clock,
  TrendingUp,
  Sparkles,
  Film,
  Tv,
  Award,
  Heart,
  Bookmark,
} from "lucide-react";

export function YearReviewView() {
  const { user } = useAuthStore();
  const navigate = useAppStore((s) => s.navigate);
  const year = new Date().getFullYear();

  const allItems = [...MOVIES, ...TV_SHOWS];
  const topRatedThisYear = [...allItems].sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 5);
  const mostPopularThisYear = [...allItems].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
  const longestMovie = [...MOVIES].sort((a, b) => (b.runtime ?? 0) - (a.runtime ?? 0))[0];
  const highestRevenue = [...MOVIES].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))[0];

  // Mock personal stats — real deployment would aggregate from ViewingHistory, Rating, Watchlist tables
  const personalStats = {
    titlesWatched: 142,
    hoursWatched: 248,
    avgRating: 7.4,
    topGenre: "Drama",
    favoriteDecade: "2010s",
    reviewsWritten: 18,
    watchlistAdds: 67,
  };

  const milestones = [
    { count: 10, label: "First 10 titles", icon: Film, earned: true },
    { count: 50, label: "50-title milestone", icon: TrendingUp, earned: true },
    { count: 100, label: "Centurion (100 titles)", icon: Trophy, earned: true },
    { count: 250, label: "Cinephile (250 titles)", icon: Sparkles, earned: false },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <CalendarHeart className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user ? `${user.username}'s` : "Your"} {year} in Review
          </h1>
          <p className="text-sm text-muted-foreground mt-1">A personalized summary of your year in movies and TV.</p>
        </div>
      </div>

      {/* Hero summary card */}
      <Card className="bg-gradient-to-br from-primary/15 via-card to-card border-border overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Your year at a glance</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBlock icon={Film} value={personalStats.titlesWatched} label="Titles watched" />
            <StatBlock icon={Clock} value={`${personalStats.hoursWatched}h`} label="Hours watched" />
            <StatBlock icon={Star} value={personalStats.avgRating.toFixed(1)} label="Avg rating given" />
            <StatBlock icon={Bookmark} value={personalStats.watchlistAdds} label="Watchlist adds" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-border">
            <StatSmall icon={Heart} value={personalStats.topGenre} label="Top genre" />
            <StatSmall icon={Award} value={personalStats.favoriteDecade} label="Favorite decade" />
            <StatSmall icon={TrendingUp} value={personalStats.reviewsWritten} label="Reviews written" />
          </div>
        </CardContent>
      </Card>

      {/* Top 5 rated titles this year */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" /> Top rated of {year}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topRatedThisYear.map((item, i) => (
            <Card key={item.id} className="bg-card border-border overflow-hidden cursor-pointer" onClick={() => navigate(item.mediaType === "TV" ? "tv-details" : "movie", { id: item.id })}>
              <CardContent className="p-0">
                <div className="relative aspect-[2/3] bg-muted">
                  <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {item.voteAverage.toFixed(1)}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold line-clamp-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.year}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Most popular */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Most talked about
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {mostPopularThisYear.map((item) => (
            <Card key={item.id} className="bg-card border-border cursor-pointer" onClick={() => navigate(item.mediaType === "TV" ? "tv-details" : "movie", { id: item.id })}>
              <CardContent className="p-3 flex gap-3">
                <img src={item.posterUrl} alt={item.title} className="h-16 w-12 rounded object-cover bg-muted shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold line-clamp-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.year} · {item.genreNames[0]}</p>
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    {item.mediaType === "TV" ? <Tv className="h-3 w-3 mr-1" /> : <Film className="h-3 w-3 mr-1" />}
                    {item.mediaType}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Records */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" /> Catalog records
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="bg-card border-border cursor-pointer" onClick={() => longestMovie && navigate("movie", { id: longestMovie.id })}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Longest runtime</p>
                <p className="font-bold truncate">{longestMovie?.title}</p>
                <p className="text-sm text-muted-foreground">{longestMovie?.runtime} minutes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border cursor-pointer" onClick={() => highestRevenue && navigate("movie", { id: highestRevenue.id })}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-yellow-500/15 text-yellow-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Highest revenue</p>
                <p className="font-bold truncate">{highestRevenue?.title}</p>
                <p className="text-sm text-muted-foreground">${((highestRevenue?.revenue ?? 0) / 1e6).toFixed(0)}M</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Milestones */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" /> Achievement milestones
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {milestones.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.label} className={`bg-card border-border ${m.earned ? "" : "opacity-50"}`}>
                <CardContent className="p-4 text-center space-y-2">
                  <div className={`h-10 w-10 rounded-full mx-auto flex items-center justify-center ${m.earned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold">{m.count}+</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  {m.earned ? (
                    <Badge variant="secondary" className="text-[10px]">Earned</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Locked</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <Card className="bg-gradient-to-br from-card to-primary/10 border-border">
          <CardContent className="p-6 text-center space-y-3">
            <h3 className="text-lg font-bold">See your real year in review</h3>
            <p className="text-sm text-muted-foreground">
              Sign in to track your viewing activity and get a personalized year-end report based on what you actually watched.
            </p>
            <Button onClick={() => navigate("profile")}>View profile</Button>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground border border-border rounded-lg p-3 bg-muted/30">
        Personal viewing statistics shown are illustrative demo data. Real deployments aggregate from ViewingHistory,
        Rating, and Watchlist records. Users can disable tracking in Settings → Privacy.
      </p>
    </div>
  );
}

function StatBlock({ icon: Icon, value, label }: { icon: typeof Film; value: string | number; label: string }) {
  return (
    <div>
      <Icon className="h-5 w-5 text-primary mb-1" />
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function StatSmall({ icon: Icon, value, label }: { icon: typeof Film; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="text-sm font-semibold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
