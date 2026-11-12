"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, Eye, Trash2, LogIn, Clock, Film, Tv, ChevronRight } from "lucide-react";
import { tmdb } from "@/lib/tmdb";

export function HistoryView() {
  const { user } = useAuthStore();
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const navigate = useAppStore((s) => s.navigate);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("viewing");

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Your activity history</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign in to see what you&apos;ve watched and the searches you&apos;ve made.
        </p>
        <Button className="mt-6" onClick={() => setAuthOpen(true, "login")}>
          <LogIn className="h-4 w-4 mr-2" /> Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Activity history</h1>
          <p className="text-sm text-muted-foreground mt-1">Your viewing history and search history.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="viewing" className="gap-1"><Eye className="h-4 w-4" /> Viewing</TabsTrigger>
          <TabsTrigger value="search" className="gap-1"><Search className="h-4 w-4" /> Search</TabsTrigger>
        </TabsList>

        <TabsContent value="viewing" className="mt-4">
          <ViewingHistoryTab />
        </TabsContent>
        <TabsContent value="search" className="mt-4">
          <SearchHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );

  function ViewingHistoryTab() {
    const query = useQuery({
      queryKey: ["viewing-history"],
      queryFn: async () => {
        const res = await fetch("/api/viewing-history");
        if (!res.ok) return { history: [] };
        return res.json();
      },
    });

    const clearAll = useMutation({
      mutationFn: async () => {
        await fetch("/api/viewing-history", { method: "DELETE" });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["viewing-history"] });
        toast.success("Viewing history cleared");
      },
    });

    const history: { id: string; tmdbId: number; mediaType: string; watchedAt: string; duration: number | null }[] = query.data?.history ?? [];

    if (query.isLoading) {
      return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
    }

    if (history.length === 0) {
      return (
        <Card className="bg-card border-dashed border-border">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
            You haven&apos;t marked anything as watched yet. Open any movie or TV show and click &quot;Mark as watched&quot; to start tracking.
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{history.length} items in your viewing history</p>
          <Button variant="ghost" size="sm" onClick={() => clearAll.mutate()} className="gap-1 text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </Button>
        </div>
        {history.map((h) => {
          const media = h.mediaType === "TV" ? tmdb.getTvDetails(h.tmdbId) : tmdb.getMovieDetails(h.tmdbId);
          if (!media) {
            return (
              <Card key={h.id} className="bg-card border-border">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-14 w-10 bg-muted rounded" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Title #{h.tmdbId}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.watchedAt).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            );
          }
          const Icon = h.mediaType === "TV" ? Tv : Film;
          return (
            <Card key={h.id} className="bg-card border-border hover:border-primary/40 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <button onClick={() => navigate(h.mediaType === "TV" ? "tv-details" : "movie", { id: h.tmdbId })}>
                  <img src={media.posterUrl} alt={media.title} className="h-14 w-10 rounded object-cover bg-muted" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-[10px]">{h.mediaType}</Badge>
                  </div>
                  <button
                    onClick={() => navigate(h.mediaType === "TV" ? "tv-details" : "movie", { id: h.tmdbId })}
                    className="block text-sm font-semibold text-left hover:text-primary truncate w-full"
                  >
                    {media.title}
                  </button>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(h.watchedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(h.mediaType === "TV" ? "tv-details" : "movie", { id: h.tmdbId })}
                  className="gap-1"
                >
                  View <ChevronRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  function SearchHistoryTab() {
    const query = useQuery({
      queryKey: ["search-history"],
      queryFn: async () => {
        const res = await fetch("/api/search-history");
        if (!res.ok) return { history: [] };
        return res.json();
      },
    });

    const clearAll = useMutation({
      mutationFn: async () => {
        await fetch("/api/search-history", { method: "DELETE" });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["search-history"] });
        toast.success("Search history cleared");
      },
    });

    const removeOne = useMutation({
      mutationFn: async (id: string) => {
        await fetch(`/api/search-history?id=${id}`, { method: "DELETE" });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["search-history"] });
      },
    });

    const history: { id: string; query: string; resultsCount: number; createdAt: string }[] = query.data?.history ?? [];

    if (query.isLoading) {
      return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
    }

    if (history.length === 0) {
      return (
        <Card className="bg-card border-dashed border-border">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No searches yet. Use the search bar in the navbar to find movies, TV shows, or people.
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{history.length} recent searches</p>
          <Button variant="ghost" size="sm" onClick={() => clearAll.mutate()} className="gap-1 text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </Button>
        </div>
        <div className="space-y-1.5">
          {history.map((h) => (
            <Card key={h.id} className="bg-card border-border hover:border-primary/40 transition-colors group">
              <CardContent className="p-3 flex items-center gap-3">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <button
                  onClick={() => navigate("search", { q: h.query })}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="text-sm font-medium truncate">{h.query}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    {h.resultsCount > 0 && ` · ${h.resultsCount} results`}
                  </div>
                </button>
                <button
                  onClick={() => removeOne.mutate(h.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
}
