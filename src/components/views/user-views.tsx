"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { MovieGrid, MovieGridSkeleton } from "@/components/site/movie-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Heart, Star, LogIn, Trash2, Bell, Check, BellOff, Clock, Users, Settings, Trophy, Lock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function WatchlistView() {
  const user = useAuthStore((s) => s.user);
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const navigate = useAppStore((s) => s.navigate);
  const queryClient = useQueryClient();

  const watchlistQuery = useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const res = await fetch("/api/watchlist");
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: !!user,
  });

  const items = (watchlistQuery.data?.items ?? [])
    .map((w: any) => {
      const media = tmdb.getMovieDetails(w.tmdbId);
      return media ? { ...media, status: w.status } : null;
    })
    .filter(Boolean);

  const removeMutation = useMutation({
    mutationFn: async (tmdbId: number, mediaType: string) => {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType, action: "remove" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Removed from watchlist");
    },
  });

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Your watchlist is waiting</h1>
        <p className="text-sm text-muted-foreground mt-2">Sign in to save movies and TV shows you want to watch.</p>
        <Button className="mt-6" onClick={() => setAuthOpen(true, "login")}>
          <LogIn className="h-4 w-4 mr-2" /> Sign in
        </Button>
      </div>
    );
  }

  const statuses = ["WATCHING", "PENDING", "COMPLETED", "ABANDONED"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-primary" /> My Watchlist
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} titles saved.</p>
        </div>
      </div>

      {watchlistQuery.isLoading ? (
        <MovieGridSkeleton count={6} />
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">Your watchlist is empty.</p>
          <Button className="mt-4" onClick={() => navigate("discover")}>Discover titles</Button>
        </div>
      ) : (
        <Tabs defaultValue="ALL">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="ALL">All ({items.length})</TabsTrigger>
            {statuses.map((s) => {
              const count = items.filter((i: any) => i.status === s).length;
              if (!count) return null;
              return (
                <TabsTrigger key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>
          <TabsContent value="ALL" className="mt-4">
            <Grid items={items} onRemove={(id, mt) => removeMutation.mutate(id, mt)} navigate={navigate} />
          </TabsContent>
          {statuses.map((s) => {
            const sub = items.filter((i: any) => i.status === s);
            if (!sub.length) return null;
            return (
              <TabsContent key={s} value={s} className="mt-4">
                <Grid items={sub} onRemove={(id, mt) => removeMutation.mutate(id, mt)} navigate={navigate} />
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}

function Grid({ items, onRemove, navigate }: { items: any[]; onRemove: (id: number, mt: string) => void; navigate: (v: any, p?: any) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {items.map((item) => (
        <div key={item.id} className="group rounded-lg overflow-hidden bg-card border border-border">
          <button onClick={() => navigate(item.mediaType === "TV" ? "tv-details" : "movie", { id: item.id })} className="block w-full">
            <div className="aspect-[2/3] relative bg-muted">
              { }
              <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
              {item.status && (
                <Badge variant="secondary" className="absolute top-2 left-2 bg-black/60 text-white border-0">
                  {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                </Badge>
              )}
            </div>
          </button>
          <div className="p-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium truncate flex-1">{item.title}</p>
            <button
              onClick={() => onRemove(item.id, item.mediaType)}
              className="text-muted-foreground hover:text-destructive shrink-0"
              aria-label="Remove from watchlist"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FavoritesView() {
  const user = useAuthStore((s) => s.user);
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const navigate = useAppStore((s) => s.navigate);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("MOVIE");

  const favQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: async (tmdbId: number, mediaType: string) => {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType, action: "remove" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Removed from favorites");
    },
  });

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Your favorites live here</h1>
        <p className="text-sm text-muted-foreground mt-2">Sign in to start collecting your most-loved titles.</p>
        <Button className="mt-6" onClick={() => setAuthOpen(true, "login")}>
          <LogIn className="h-4 w-4 mr-2" /> Sign in
        </Button>
      </div>
    );
  }

  const items = (favQuery.data?.items ?? [])
    .map((f: any) => {
      if (f.mediaType === "PERSON") {
        return null; // skip person for now (different shape)
      }
      const media = tmdb.getMovieDetails(f.tmdbId);
      return media ? { ...media } : null;
    })
    .filter(Boolean);

  const movies = items.filter((i: any) => i.mediaType === "MOVIE");
  const tv = items.filter((i: any) => i.mediaType === "TV");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" /> My Favorites
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{items.length} titles you love.</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="MOVIE">Movies ({movies.length})</TabsTrigger>
          <TabsTrigger value="TV">TV ({tv.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="MOVIE" className="mt-4">
          {movies.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {movies.map((item: any) => (
                <FavCard key={item.id} item={item} onRemove={(id, mt) => removeMutation.mutate(id, mt)} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No favorite movies yet.</div>
          )}
        </TabsContent>
        <TabsContent value="TV" className="mt-4">
          {tv.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {tv.map((item: any) => (
                <FavCard key={item.id} item={item} onRemove={(id, mt) => removeMutation.mutate(id, mt)} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No favorite TV shows yet.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FavCard({ item, onRemove, navigate }: { item: any; onRemove: (id: number, mt: string) => void; navigate: (v: any, p?: any) => void }) {
  return (
    <div className="group rounded-lg overflow-hidden bg-card border border-border">
      <button onClick={() => navigate(item.mediaType === "TV" ? "tv-details" : "movie", { id: item.id })} className="block w-full">
        <div className="aspect-[2/3] bg-muted">
          { }
          <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
        </div>
      </button>
      <div className="p-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium truncate flex-1">{item.title}</p>
        <button
          onClick={() => onRemove(item.id, item.mediaType)}
          className="text-muted-foreground hover:text-destructive shrink-0"
          aria-label="Remove from favorites"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function ProfileView() {
  const user = useAuthStore((s) => s.user);
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const navigate = useAppStore((s) => s.navigate);
  const params = useAppStore((s) => s.params);
  const initialTab = String(params.tab ?? "overview");
  const [tab, setTab] = useState(initialTab);
  const queryClient = useQueryClient();

  const ratingsQuery = useQuery({
    queryKey: ["myRatings"],
    queryFn: async () => {
      const res = await fetch("/api/ratings");
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: !!user,
  });
  const reviewsQuery = useQuery({
    queryKey: ["myReviews"],
    queryFn: async () => {
      const res = await fetch("/api/reviews?mine=1");
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: !!user,
  });
  const notifsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-2">Please sign in to view your profile.</p>
        <Button className="mt-6" onClick={() => setAuthOpen(true, "login")}>Sign in</Button>
      </div>
    );
  }

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAll" }),
    });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
          {user.username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user.name ?? user.username}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
            {user.country && <Badge variant="outline">{user.country}</Badge>}
            {user.preferredLang && <Badge variant="outline">{user.preferredLang.toUpperCase()}</Badge>}
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ratings">My ratings</TabsTrigger>
          <TabsTrigger value="reviews">My reviews</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications {notifsQuery.data?.unread > 0 && <Badge variant="default" className="ml-1 text-[10px]">{notifsQuery.data.unread}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid sm:grid-cols-3 gap-3">
          <button onClick={() => setTab("ratings")} className="text-left p-4 rounded-lg bg-card border border-border">
            <Star className="h-5 w-5 text-yellow-400 mb-2" />
            <div className="text-2xl font-bold">{ratingsQuery.data?.items?.length ?? 0}</div>
            <div className="text-xs text-muted-foreground">Ratings</div>
          </button>
          <button onClick={() => setTab("reviews")} className="text-left p-4 rounded-lg bg-card border border-border">
            <Bookmark className="h-5 w-5 text-primary mb-2" />
            <div className="text-2xl font-bold">{reviewsQuery.data?.items?.length ?? 0}</div>
            <div className="text-xs text-muted-foreground">Reviews</div>
          </button>
          <button onClick={() => navigate("watchlist")} className="text-left p-4 rounded-lg bg-card border border-border">
            <Heart className="h-5 w-5 text-primary mb-2" />
            <div className="text-2xl font-bold">View list</div>
            <div className="text-xs text-muted-foreground">Watchlist</div>
          </button>
          <button onClick={() => navigate("history")} className="text-left p-4 rounded-lg bg-card border border-border">
            <Clock className="h-5 w-5 text-primary mb-2" />
            <div className="text-2xl font-bold">History</div>
            <div className="text-xs text-muted-foreground">Viewing & search</div>
          </button>
          <button onClick={() => navigate("social")} className="text-left p-4 rounded-lg bg-card border border-border">
            <Users className="h-5 w-5 text-primary mb-2" />
            <div className="text-2xl font-bold">Social</div>
            <div className="text-xs text-muted-foreground">Followers & following</div>
          </button>
          <button onClick={() => navigate("settings")} className="text-left p-4 rounded-lg bg-card border border-border">
            <Settings className="h-5 w-5 text-primary mb-2" />
            <div className="text-2xl font-bold">Settings</div>
            <div className="text-xs text-muted-foreground">Account & privacy</div>
          </button>
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          <AchievementsPanel />
        </TabsContent>

        <TabsContent value="ratings" className="mt-4 space-y-2">
          {(ratingsQuery.data?.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No ratings yet.</p>
          ) : (
            (ratingsQuery.data?.items ?? []).map((r: any) => {
              const m = tmdb.getMovieDetails(r.tmdbId);
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                  {m && (
                    <button onClick={() => navigate(m.mediaType === "TV" ? "tv-details" : "movie", { id: m.id })} className="flex items-center gap-3 flex-1 text-left">
                      { }
                      <img src={m.posterUrl} alt={m.title} className="h-12 w-8 rounded object-cover" />
                      <div>
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.year}</p>
                      </div>
                    </button>
                  )}
                  <Badge variant="default">{r.score}/10</Badge>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4 space-y-2">
          {(reviewsQuery.data?.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            (reviewsQuery.data?.items ?? []).map((r: any) => (
              <div key={r.id} className="p-3 rounded-lg bg-card border border-border">
                <p className="font-semibold text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground mb-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                <p className="text-xs line-clamp-2">{r.content}</p>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{notifsQuery.data?.items?.length ?? 0} notifications</p>
            {notifsQuery.data?.unread > 0 && (
              <Button variant="outline" size="sm" onClick={markAll}>
                <Check className="h-3.5 w-3.5 mr-1" /> Mark all read
              </Button>
            )}
          </div>
          {(notifsQuery.data?.items ?? []).map((n: any) => (
            <div key={n.id} className={`p-3 rounded-lg border ${n.read ? "bg-card border-border" : "bg-primary/5 border-primary/30"}`}>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  {n.read ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={async () => {
                      await fetch("/api/notifications", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "markOne", id: n.id }),
                      });
                      queryClient.invalidateQueries({ queryKey: ["notifications"] });
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AchievementsPanel() {
  const query = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const res = await fetch("/api/achievements");
      if (!res.ok) return { achievements: [], earnedCount: 0, totalCount: 0 };
      return res.json();
    },
  });

  const achievements: {
    id: string; slug: string; name: string; description: string; icon: string; tier: string;
    earned: boolean; earnedAt: string | null;
  }[] = query.data?.achievements ?? [];

  if (query.isLoading) {
    return <div className="text-sm text-muted-foreground">Loading achievements...</div>;
  }

  if (achievements.length === 0) {
    return (
      <Card className="bg-card border-dashed border-border">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No achievements available yet. Earn them by watching, rating, reviewing, and engaging with the community.
        </CardContent>
      </Card>
    );
  }

  const tierColors: Record<string, string> = {
    BRONZE: "from-orange-700/30 to-orange-900/10 border-orange-700/40 text-orange-400",
    SILVER: "from-slate-400/30 to-slate-700/10 border-slate-400/40 text-slate-300",
    GOLD: "from-yellow-500/30 to-yellow-700/10 border-yellow-500/40 text-yellow-400",
    PLATINUM: "from-cyan-400/30 to-blue-700/10 border-cyan-400/40 text-cyan-300",
  };

  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-700/10 flex items-center justify-center">
          <Trophy className="h-6 w-6 text-yellow-500" />
        </div>
        <div>
          <p className="text-2xl font-bold">{earned.length} / {achievements.length}</p>
          <p className="text-xs text-muted-foreground">Achievements earned</p>
        </div>
      </div>

      {earned.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Earned</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {earned.map((a) => (
              <Card key={a.id} className={`bg-gradient-to-br ${tierColors[a.tier] ?? tierColors.BRONZE} border-2`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Trophy className="h-8 w-8 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                      <Badge variant="secondary" className="text-[10px] mt-2">{a.tier}</Badge>
                      {a.earnedAt && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Earned {new Date(a.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Locked ({locked.length})</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 opacity-60">
            {locked.map((a) => (
              <Card key={a.id} className="bg-card border-border border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="h-8 w-8 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                      <Badge variant="outline" className="text-[10px] mt-2">{a.tier}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
