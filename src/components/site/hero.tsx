"use client";

import Image from "next/image";
import { useState } from "react";
import { Play, Info, Star, Plus } from "lucide-react";
import type { MediaItem } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export function Hero({ item }: { item: MediaItem }) {
  const navigate = useAppStore((s) => s.navigate);
  const pushRecentlyViewed = useAppStore((s) => s.pushRecentlyViewed);
  const user = useAuthStore((s) => s.user);
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const [imgError, setImgError] = useState(false);

  const open = () => {
    pushRecentlyViewed({
      id: item.id,
      mediaType: item.mediaType,
      title: item.title,
      posterUrl: item.posterUrl,
    });
    navigate(item.mediaType === "TV" ? "tv-details" : "movie", { id: item.id });
  };

  const quickAdd = async () => {
    if (!user) {
      setAuthOpen(true, "login");
      toast.info("Please sign in to use your watchlist");
      return;
    }
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: item.id,
          mediaType: item.mediaType,
          action: "add",
        }),
      });
      toast.success(`Added "${item.title}" to your watchlist`);
    } catch {
      toast.error("Could not add to watchlist");
    }
  };

  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
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
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12">
        <div className="max-w-2xl fade-up">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-primary text-primary-foreground">Featured</Badge>
            {item.mediaType === "TV" && <Badge variant="secondary">TV Series</Badge>}
            {item.certification && (
              <Badge variant="outline" className="border-white/30 text-white">
                {item.certification}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-balance text-white">
            {item.title}
          </h1>
          {item.tagline && (
            <p className="mt-2 text-base sm:text-lg italic text-white/80">{item.tagline}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-white/90">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{item.voteAverage.toFixed(1)}</span>
              <span className="text-white/60">({item.voteCount.toLocaleString()})</span>
            </span>
            <span className="text-white/60">•</span>
            <span>{item.year}</span>
            <span className="text-white/60">•</span>
            <span>{item.runtime ? `${item.runtime} min` : item.seasons ? `${item.seasons} season${item.seasons > 1 ? "s" : ""}` : ""}</span>
            <span className="text-white/60">•</span>
            <span>{item.genreNames.slice(0, 3).join(", ")}</span>
          </div>
          <p className="mt-4 text-sm sm:text-base text-white/80 line-clamp-3 max-w-xl">
            {item.overview}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button size="lg" onClick={open} className="gap-2">
              <Play className="h-4 w-4 fill-current" /> Watch Trailer
            </Button>
            <Button size="lg" variant="secondary" onClick={open} className="gap-2">
              <Info className="h-4 w-4" /> More Info
            </Button>
            <Button size="lg" variant="outline" onClick={quickAdd} className="gap-2 bg-black/30 backdrop-blur border-white/30 text-white hover:bg-black/50">
              <Plus className="h-4 w-4" /> Watchlist
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-muted">
      <div className="absolute inset-0 shimmer" />
      <div className="absolute inset-0 hero-overlay" />
    </section>
  );
}
