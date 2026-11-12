"use client";

import Image from "next/image";
import { Star, Play, Plus, Check } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import type { MediaItem } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export function MovieCard({
  item,
  index = 0,
}: {
  item: MediaItem;
  index?: number;
}) {
  const navigate = useAppStore((s) => s.navigate);
  const pushRecentlyViewed = useAppStore((s) => s.pushRecentlyViewed);
  const user = useAuthStore((s) => s.user);
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);

  const open = () => {
    pushRecentlyViewed({
      id: item.id,
      mediaType: item.mediaType,
      title: item.title,
      posterUrl: item.posterUrl,
    });
    navigate(item.mediaType === "TV" ? "tv-details" : "movie", { id: item.id });
  };

  const quickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div
      onClick={open}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      className="fade-up group cursor-pointer card-lift rounded-lg overflow-hidden bg-card border border-border"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <Image
          src={item.posterUrl}
          alt={item.title}
          fill
          sizes="(max-width:768px) 50vw, (max-width:1200px) 25vw, 200px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant="secondary" className="bg-black/60 text-white border-0 backdrop-blur">
            {item.mediaType === "TV" ? "TV" : item.mediaType}
          </Badge>
          {item.certification && (
            <Badge variant="outline" className="bg-black/60 text-white border-white/30 backdrop-blur">
              {item.certification}
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-xs">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-white">{item.voteAverage.toFixed(1)}</span>
        </div>

        <button
          onClick={quickAdd}
          aria-label="Add to watchlist"
          className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
        >
          <Plus className="h-4 w-4" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); open(); }}>
            <Play className="h-3 w-3 mr-1 fill-current" /> View
          </Button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold truncate">{item.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.year} · {item.genreNames.slice(0, 2).join(", ")}
        </p>
      </div>
    </div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-card border border-border">
      <div className="aspect-[2/3] shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 rounded shimmer" />
        <div className="h-2.5 w-1/2 rounded shimmer" />
      </div>
    </div>
  );
}

export function MovieRow({ title, items }: { title: string; items: MediaItem[] }) {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar -mx-1 px-1">
        {items.map((item, i) => (
          <div key={item.id} className="min-w-[140px] sm:min-w-[160px] max-w-[160px] sm:max-w-[180px]">
            <MovieCard item={item} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function MovieGrid({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {items.map((item, i) => (
        <MovieCard key={item.id} item={item} index={i} />
      ))}
    </div>
  );
}

export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

export { Check };
