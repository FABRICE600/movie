"use client";

import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import { Hero, HeroSkeleton } from "@/components/site/hero";
import { MovieRow, MovieGridSkeleton } from "@/components/site/movie-card";
import { useAppStore } from "@/store/app-store";
import { MOVIES, TV_SHOWS } from "@/lib/mock-data";
import { Sparkles, TrendingUp, Flame, Clock, Star, Users, Globe2 } from "lucide-react";

export function HomeView() {
  const navigate = useAppStore((s) => s.navigate);
  const trending = useQuery({
    queryKey: ["home", "trending"],
    queryFn: () => tmdb.getTrending("week", "all"),
  });
  const popularMovies = useQuery({
    queryKey: ["home", "popular", "MOVIE"],
    queryFn: () => tmdb.getPopular("MOVIE"),
  });
  const popularTv = useQuery({
    queryKey: ["home", "popular", "TV"],
    queryFn: () => tmdb.getPopular("TV"),
  });
  const topRated = useQuery({
    queryKey: ["home", "top-rated"],
    queryFn: () => tmdb.getTopRated("MOVIE"),
  });
  const upcoming = useQuery({
    queryKey: ["home", "upcoming"],
    queryFn: () => tmdb.getUpcoming(),
  });

  const heroItem = trending.data?.[0] ?? MOVIES[0];
  const isLoading = trending.isLoading;
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);

  // Genre rows for variety
  const genreRows = [
    { id: 28, name: "Action" },
    { id: 18, name: "Drama" },
    { id: 878, name: "Science Fiction" },
    { id: 10749, name: "Romance" },
  ];

  return (
    <div className="space-y-10 pb-10">
      {isLoading || !heroItem ? <HeroSkeleton /> : <Hero item={heroItem} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 -mt-8 relative z-10">
        {/* Quick stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Flame, label: "Trending now", value: trending.data?.length ?? 0, view: "trending" as const },
            { icon: Star, label: "Top rated", value: topRated.data?.length ?? 0, view: "top-rated" as const },
            { icon: Clock, label: "Upcoming", value: upcoming.data?.length ?? 0, view: "upcoming" as const },
            { icon: Users, label: "People", value: 14, view: "people" as const },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => navigate(stat.view)}
              className="card-lift text-left bg-card border border-border rounded-lg p-4 flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </button>
          ))}
        </section>

        {/* Continue watching */}
        {recentlyViewed.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold">Continue browsing</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {recentlyViewed.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(r.mediaType === "TV" ? "tv-details" : "movie", { id: r.id })}
                  className="min-w-[120px] max-w-[140px] text-left group"
                >
                  <div className="aspect-[2/3] rounded overflow-hidden bg-muted border border-border">
                    { }
                    <img
                      src={r.posterUrl}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-xs mt-1.5 line-clamp-2">{r.title}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {trending.isLoading ? (
          <MovieGridSkeleton count={6} />
        ) : (
          <MovieRow title="🔥 Trending this week" items={trending.data ?? []} />
        )}

        {popularMovies.isLoading ? (
          <MovieGridSkeleton count={6} />
        ) : (
          <MovieRow title="🎬 Popular movies" items={popularMovies.data ?? []} />
        )}

        {popularTv.isLoading ? (
          <MovieGridSkeleton count={6} />
        ) : (
          <MovieRow title="📺 Popular TV shows" items={popularTv.data ?? []} />
        )}

        {topRated.isLoading ? (
          <MovieGridSkeleton count={6} />
        ) : (
          <MovieRow title="⭐ Top rated" items={topRated.data ?? []} />
        )}

        {genreRows.map((g) => {
          const items = MOVIES.filter((m) => m.genres.includes(g.id));
          if (!items.length) return null;
          return <MovieRow key={g.id} title={`${g.name} movies`} items={items} />;
        })}

        {/* Editor's pick spotlight */}
        <section className="rounded-xl overflow-hidden border border-border bg-gradient-to-br from-card via-card to-primary/10 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="text-lg sm:text-xl font-bold">Editor's spotlight</h2>
          </div>
          <div className="grid md:grid-cols-[1fr_2fr] gap-6">
            <button
              onClick={() => navigate("movie", { id: 115 })}
              className="aspect-video rounded-lg overflow-hidden bg-muted group"
            >
              { }
              <img
                src={MOVIES.find((m) => m.id === 115)?.backdropUrl}
                alt="Kigali Nights"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </button>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">Kigali Nights</h3>
              <p className="text-muted-foreground">
                A young Rwandan jazz trumpeter risks everything to open the city's first independent music club in a generation. A vibrant celebration of African cinema and the unbreakable spirit of a community reclaiming its voice.
              </p>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> 8.2
                </span>
                <span className="text-muted-foreground">•</span>
                <span>2024</span>
                <span className="text-muted-foreground">•</span>
                <span>Drama, Music</span>
              </div>
              <button
                onClick={() => navigate("movie", { id: 115 })}
                className="text-primary hover:underline text-sm font-medium"
              >
                Read more →
              </button>
            </div>
          </div>
        </section>

        {upcoming.isLoading ? (
          <MovieGridSkeleton count={6} />
        ) : (
          <MovieRow title="🗓️ Coming soon" items={upcoming.data ?? []} />
        )}

        {/* International cinema callout */}
        <section className="rounded-xl overflow-hidden border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold">Cinema from around the world</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "African cinema", ids: [115, 208] },
              { label: "East Asian cinema", ids: [103, 207, 109] },
              { label: "European cinema", ids: [102, 113, 114] },
              { label: "Americas", ids: [104, 110, 107] },
            ].map((group) => {
              const items = group.ids.map((id) => MOVIES.find((m) => m.id === id) || TV_SHOWS.find((m) => m.id === id)).filter(Boolean);
              return (
                <button
                  key={group.label}
                  onClick={() => navigate("discover", { country: "" })}
                  className="text-left p-3 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
                >
                  <div className="text-sm font-semibold mb-1">{group.label}</div>
                  <div className="text-xs text-muted-foreground">{items.length} titles</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Trending people teaser */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold">Trending people</h2>
            </div>
            <button onClick={() => navigate("people")} className="text-sm text-primary hover:underline">
              View all →
            </button>
          </div>
          <PeopleTeaser />
        </section>
      </div>
    </div>
  );
}

function PeopleTeaser() {
  const navigate = useAppStore((s) => s.navigate);
  const { data, isLoading } = useQuery({
    queryKey: ["home", "popular-people"],
    queryFn: () => tmdb.getPopularPeople(),
  });
  if (isLoading) return <MovieGridSkeleton count={6} />;
  const people = (data ?? []).slice(0, 8);
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
      {people.map((p) => (
        <button
          key={p.id}
          onClick={() => navigate("person", { id: p.id })}
          className="text-left group"
        >
          <div className="aspect-square rounded-full overflow-hidden bg-muted border border-border">
            { }
            <img
              src={p.profileUrl}
              alt={p.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
          </div>
          <p className="text-xs mt-1.5 text-center line-clamp-1">{p.name}</p>
          <p className="text-[10px] text-muted-foreground text-center line-clamp-1">{p.knownFor}</p>
        </button>
      ))}
    </div>
  );
}
