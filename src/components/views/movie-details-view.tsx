"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { tmdb, type MediaItem } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Plus, Check, Heart, Share2, Play, Clock, Calendar, Globe, DollarSign, Users, MessageSquare, ThumbsUp, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MOVIES, TV_SHOWS } from "@/lib/mock-data";

export function MovieDetailsView({ mediaType }: { mediaType: "MOVIE" | "TV" }) {
  const params = useAppStore((s) => s.params);
  const id = parseInt(String(params.id ?? "0"));
  const { data: item, isLoading } = useQuery({
    queryKey: ["details", id],
    queryFn: () => (mediaType === "TV" ? tmdb.getTvDetails(id) : tmdb.getMovieDetails(id)),
    enabled: !!id,
  });
  const similar = useQuery({
    queryKey: ["similar", id],
    queryFn: () => tmdb.getSimilar(id),
    enabled: !!id,
  });
  const recommendations = useQuery({
    queryKey: ["recommendations", id],
    queryFn: () => tmdb.getRecommendations(id),
    enabled: !!id,
  });

  if (isLoading || !item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-[60vh] w-full rounded-lg" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return <DetailsContent item={item} similar={similar.data ?? []} recommendations={recommendations.data ?? []} />;
}

function DetailsContent({ item, similar, recommendations }: { item: MediaItem; similar: MediaItem[]; recommendations: MediaItem[] }) {
  const navigate = useAppStore((s) => s.navigate);
  const pushRecentlyViewed = useAppStore((s) => s.pushRecentlyViewed);
  const user = useAuthStore((s) => s.user);
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const queryClient = useQueryClient();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Watchlist state
  const watchlistQuery = useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      if (!user) return { items: [] as { tmdbId: number; mediaType: string; status: string }[] };
      const res = await fetch("/api/watchlist");
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: !!user,
  });
  const inWatchlist = watchlistQuery.data?.items?.some((w) => w.tmdbId === item.id && w.mediaType === item.mediaType) ?? false;

  const favQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      if (!user) return { items: [] as { tmdbId: number; mediaType: string }[] };
      const res = await fetch("/api/favorites");
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: !!user,
  });
  const isFav = favQuery.data?.items?.some((f) => f.tmdbId === item.id && f.mediaType === item.mediaType) ?? false;

  const ratingQuery = useQuery({
    queryKey: ["rating", item.id, item.mediaType],
    queryFn: async () => {
      if (!user) return { score: null as number | null };
      const res = await fetch(`/api/ratings?tmdbId=${item.id}&mediaType=${item.mediaType}`);
      if (!res.ok) return { score: null };
      return res.json();
    },
    enabled: !!user,
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", item.id, item.mediaType],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?tmdbId=${item.id}&mediaType=${item.mediaType}`);
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });

  useEffect(() => {
    pushRecentlyViewed({
      id: item.id,
      mediaType: item.mediaType,
      title: item.title,
      posterUrl: item.posterUrl,
    });
  }, [item, pushRecentlyViewed]);

  const watchlistMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("UNAUTHORIZED");
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: item.id,
          mediaType: item.mediaType,
          action: inWatchlist ? "remove" : "add",
        }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(inWatchlist ? "Removed from watchlist" : `Added "${item.title}" to your watchlist`);
    },
    onError: () => {
      if (!user) {
        setAuthOpen(true, "login");
        toast.info("Please sign in to use your watchlist");
      } else {
        toast.error("Could not update watchlist");
      }
    },
  });

  const favMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("UNAUTHORIZED");
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: item.id,
          mediaType: item.mediaType,
          action: isFav ? "remove" : "add",
        }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(isFav ? "Removed from favorites" : "Added to favorites");
    },
    onError: () => {
      if (!user) {
        setAuthOpen(true, "login");
        toast.info("Please sign in to favorite");
      } else {
        toast.error("Could not update favorites");
      }
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (score: number) => {
      if (!user) throw new Error("UNAUTHORIZED");
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId: item.id, mediaType: item.mediaType, score }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: (_data, score) => {
      queryClient.invalidateQueries({ queryKey: ["rating", item.id, item.mediaType] });
      queryClient.invalidateQueries({ queryKey: ["myRatings"] });
      toast.success(`You rated this ${score}/10`);
    },
    onError: () => {
      if (!user) {
        setAuthOpen(true, "login");
        toast.info("Please sign in to rate");
      }
    },
  });

  const providers = tmdb.getProvidersForMedia(item.id);

  const fmtMoney = (n?: number) =>
    n ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n) : null;

  return (
    <div className="pb-12">
      {/* Backdrop hero */}
      <div className="relative h-[50vh] min-h-[380px] w-full overflow-hidden">
        {!imgError ? (
          <Image
            src={item.backdropUrl}
            alt={item.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-card to-background" />
        )}
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10">
        <div className="grid md:grid-cols-[260px_1fr] gap-6">
          {/* Poster */}
          <div className="space-y-3">
            <div className="aspect-[2/3] rounded-lg overflow-hidden border border-border bg-muted shadow-xl">
              { }
              <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={inWatchlist ? "default" : "outline"}
                onClick={() => watchlistMutation.mutate()}
                disabled={watchlistMutation.isPending}
                className="gap-1.5"
              >
                {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {inWatchlist ? "In list" : "Watchlist"}
              </Button>
              <Button
                variant={isFav ? "default" : "outline"}
                onClick={() => favMutation.mutate()}
                disabled={favMutation.isPending}
                className="gap-1.5"
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                {isFav ? "Loved" : "Favorite"}
              </Button>
            </div>
            <Button variant="outline" onClick={() => setShareOpen(true)} className="w-full gap-1.5">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>

          {/* Main content */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-primary text-primary-foreground">{item.mediaType === "TV" ? "TV Series" : "Movie"}</Badge>
                {item.certification && <Badge variant="outline">{item.certification}</Badge>}
                {item.status && <Badge variant="secondary">{item.status}</Badge>}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-balance">{item.title}</h1>
              {item.originalTitle !== item.title && (
                <p className="text-sm text-muted-foreground italic mt-1">Original: {item.originalTitle}</p>
              )}
              {item.tagline && <p className="text-lg italic text-muted-foreground mt-2">{item.tagline}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-base">{item.voteAverage.toFixed(1)}</span>
                <span className="text-muted-foreground">({item.voteCount.toLocaleString()} votes)</span>
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" /> {item.releaseDate}
              </span>
              {item.runtime && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" /> {Math.floor(item.runtime / 60)}h {item.runtime % 60}m
                </span>
              )}
              {item.seasons && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Play className="h-4 w-4" /> {item.seasons} season{item.seasons > 1 ? "s" : ""} · {item.episodes} eps
                </span>
              )}
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Globe className="h-4 w-4" /> {item.originalLanguage.toUpperCase()}
              </span>
            </div>

            {/* Rating action */}
            <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap items-center gap-4 justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                    <button
                      key={s}
                      onClick={() => ratingMutation.mutate(s)}
                      disabled={ratingMutation.isPending}
                      className={`h-7 w-7 rounded text-xs font-bold transition-colors ${
                        ratingQuery.data?.score === s
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/70"
                      }`}
                      aria-label={`Rate ${s}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {ratingQuery.data?.score && (
                  <p className="text-xs mt-1 text-muted-foreground">
                    You rated this <strong className="text-foreground">{ratingQuery.data.score}/10</strong>
                  </p>
                )}
              </div>
              <Button onClick={() => setTrailerOpen(true)} className="gap-2">
                <Play className="h-4 w-4 fill-current" /> Watch Trailer
              </Button>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold">Overview</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.overview}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {item.genreNames.map((g) => (
                <Badge key={g} variant="secondary">{g}</Badge>
              ))}
              {item.keywords.slice(0, 6).map((k) => (
                <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
              ))}
            </div>

            {/* Facts grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-card border border-border rounded-lg p-4">
              {[
                { icon: DollarSign, label: "Budget", value: fmtMoney(item.budget) ?? "—" },
                { icon: DollarSign, label: "Revenue", value: fmtMoney(item.revenue) ?? "—" },
                { icon: Globe, label: "Country", value: item.originCountry.join(", ") },
                { icon: Globe, label: "Language", value: item.originalLanguage.toUpperCase() },
                { icon: Users, label: "Production", value: item.productionCompanies.map((c) => c.name).join(", ") || "—" },
                { icon: Play, label: "IMDb", value: item.imdbId ?? "—" },
              ].map((f) => (
                <div key={f.label} className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <f.icon className="h-3.5 w-3.5" /> {f.label}
                  </div>
                  <div className="text-sm font-medium">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="cast">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="providers">Where to Watch</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews <Badge variant="secondary" className="ml-1 text-[10px]">{reviewsQuery.data?.items?.length ?? 0}</Badge>
              </TabsTrigger>
              <TabsTrigger value="similar">Similar</TabsTrigger>
              <TabsTrigger value="recommendations">Recommended</TabsTrigger>
            </TabsList>

            <TabsContent value="cast" className="mt-4 space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Top billed cast</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {item.cast.slice(0, 12).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        const person = PEOPLE_FROM_MEDIA.find((p) => p.name === c.name);
                        if (person) navigate("person", { id: person.id });
                      }}
                      className="text-left group"
                    >
                      <div className="aspect-square rounded-full overflow-hidden bg-muted border border-border">
                        { }
                        <img src={c.profileUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-xs mt-1.5 font-medium line-clamp-1">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{c.character}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Crew</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {item.crew.map((c) => (
                    <button
                      key={`${c.id}-${c.job}`}
                      onClick={() => {
                        const person = PEOPLE_FROM_MEDIA.find((p) => p.name === c.name);
                        if (person) navigate("person", { id: person.id });
                      }}
                      className="text-left p-3 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors flex items-center gap-3"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={c.profileUrl} alt={c.name} />
                        <AvatarFallback>{c.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.job} · {c.department}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Backdrops</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[item.backdropUrl, ...item.images].map((src, i) => (
                    <div key={i} className="aspect-video rounded-lg overflow-hidden bg-muted">
                      { }
                      <img src={src} alt={`${item.title} backdrop ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Poster</h3>
                <div className="max-w-[240px]">
                  { }
                  <img src={item.posterUrl} alt={item.title} className="w-full rounded-lg border border-border" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="providers" className="mt-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Streaming availability</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {providers.map((p) => (
                    <div key={`${p.id}-${p.type}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                      <div
                        className="h-10 w-10 rounded flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.type.toLowerCase()}{("price" in p && p.price) ? ` · ${p.price}` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Availability is illustrative demo data. Real integration requires the Watchmode API.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <ReviewsPanel item={item} reviews={reviewsQuery.data?.items ?? []} refetch={() => queryClient.invalidateQueries({ queryKey: ["reviews", item.id, item.mediaType] })} />
            </TabsContent>

            <TabsContent value="similar" className="mt-4">
              {similar.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {similar.map((s) => (
                    <SimilarCard key={s.id} item={s} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No similar titles available.</p>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4">
              {recommendations.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {recommendations.map((s) => (
                    <SimilarCard key={s.id} item={s} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recommendations available.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Trailer modal */}
      <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
        <DialogContent className="sm:max-w-3xl bg-black border-border p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-border">
            <DialogTitle className="text-white">{item.title} — Trailer</DialogTitle>
            <DialogDescription>Official trailer via YouTube embed.</DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-black">
            {item.trailerYoutubeId && (
              <iframe
                src={`https://www.youtube.com/embed/${item.trailerYoutubeId}`}
                title={`${item.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share modal */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this title</DialogTitle>
            <DialogDescription>Spread the word about {item.title}.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {["Facebook", "WhatsApp", "X (Twitter)", "Telegram", "Copy link", "Embed"].map((s) => (
              <Button
                key={s}
                variant="outline"
                onClick={() => {
                  if (s === "Copy link") {
                    navigator.clipboard?.writeText(typeof window !== "undefined" ? window.location.href : "");
                    toast.success("Link copied to clipboard");
                  } else {
                    toast.info(`${s} sharing is available in production builds.`);
                  }
                }}
              >
                {s}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SimilarCard({ item }: { item: MediaItem }) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <button
      onClick={() => navigate(item.mediaType === "TV" ? "tv-details" : "movie", { id: item.id })}
      className="text-left group"
    >
      <div className="aspect-[2/3] rounded overflow-hidden bg-muted border border-border">
        { }
        <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>
      <p className="text-xs mt-1.5 font-medium line-clamp-2">{item.title}</p>
      <p className="text-[10px] text-muted-foreground">{item.year} · ★ {item.voteAverage.toFixed(1)}</p>
    </button>
  );
}

function ReviewsPanel({ item, reviews, refetch }: { item: MediaItem; reviews: any[]; refetch: () => void }) {
  const user = useAuthStore((s) => s.user);
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthOpen(true, "login");
      toast.info("Please sign in to write a review");
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: item.id,
          mediaType: item.mediaType,
          title: title.trim(),
          content: content.trim(),
          spoiler,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Could not post review");
        return;
      }
      toast.success("Review posted!");
      setTitle("");
      setContent("");
      setSpoiler(false);
      refetch();
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (id: string) => {
    if (!user) {
      setAuthOpen(true, "login");
      return;
    }
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "helpful" }),
    });
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Write review */}
      <form onSubmit={submit} className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Write a review
        </h3>
        <div className="space-y-1.5">
          <Label htmlFor="review-title">Title</Label>
          <Input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A short, catchy headline"
            maxLength={200}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="review-content">Your review</Label>
          <Textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts on the story, performances, direction..."
            rows={4}
            maxLength={5000}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={spoiler} onCheckedChange={(v) => setSpoiler(Boolean(v))} />
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" /> Contains spoilers
            </span>
          </label>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Posting..." : "Post review"}
          </Button>
        </div>
      </form>

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No reviews yet. Be the first to share your thoughts!
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    by <strong>{r.user?.name ?? r.user?.username ?? "Anonymous"}</strong> · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {r.spoiler && <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">Spoilers</Badge>}
              </div>
              <p className={`text-sm text-muted-foreground ${r.spoiler ? "blur-sm hover:blur-0 transition" : ""}`}>
                {r.content}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => markHelpful(r.id)}
                  className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({r.helpful})
                </button>
                {user && r.userId === user.id && (
                  <button
                    onClick={async () => {
                      await fetch(`/api/reviews?id=${r.id}`, { method: "DELETE" });
                      refetch();
                      toast.success("Review deleted");
                    }}
                    className="text-xs text-destructive hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Lazy people index from mock data
import { findPersonByName } from "@/lib/mock-data";
const PEOPLE_FROM_MEDIA = [...MOVIES, ...TV_SHOWS]
  .flatMap((m) => [...m.cast, ...m.crew])
  .map((c) => findPersonByName(c.name))
  .filter(Boolean) as { id: number; name: string }[];
