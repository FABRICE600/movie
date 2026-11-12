"use client";

import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import { useAppStore } from "@/store/app-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

export function PeopleListView() {
  const navigate = useAppStore((s) => s.navigate);
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["people", "popular"],
    queryFn: () => tmdb.getPopularPeople(),
  });

  const people = (data ?? []).filter((p) =>
    !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.knownFor.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">People</h1>
        <p className="text-sm text-muted-foreground mt-1">Actors, directors, writers and crew from across the catalog.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name or role..." className="pl-9" />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {people.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate("person", { id: p.id })}
              className="text-left group"
            >
              <div className="aspect-square rounded-full overflow-hidden bg-muted border-2 border-border group-hover:border-primary/60 transition-colors">
                { }
                <img src={p.profileUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-sm mt-2 font-medium text-center line-clamp-1">{p.name}</p>
              <p className="text-xs text-muted-foreground text-center line-clamp-1">{p.knownFor}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PersonDetailsView() {
  const params = useAppStore((s) => s.params);
  const navigate = useAppStore((s) => s.navigate);
  const id = parseInt(String(params.id ?? "0"));
  const { data: person, isLoading } = useQuery({
    queryKey: ["person", id],
    queryFn: () => tmdb.getPerson(id),
    enabled: !!id,
  });
  const { data: favData, refetch: refetchFav } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });
  const isFav = favData?.items?.some((f: any) => f.tmdbId === id && f.mediaType === "PERSON") ?? false;

  const toggleFav = async () => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmdbId: id, mediaType: "PERSON", action: isFav ? "remove" : "add" }),
    });
    if (res.ok) {
      refetchFav();
      toast.success(isFav ? "Removed favorite" : "Added to favorites");
    }
  };

  if (isLoading || !person) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <Skeleton className="h-48 w-48 rounded-full" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <button onClick={() => navigate("people")} className="text-sm text-primary hover:underline">
        ← Back to people
      </button>
      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <div className="space-y-3">
          <div className="aspect-square rounded-full overflow-hidden bg-muted border border-border">
            { }
            <img src={person.profileUrl} alt={person.name} className="w-full h-full object-cover" />
          </div>
          <button
            onClick={toggleFav}
            className={`w-full rounded-md py-2 text-sm font-medium border ${
              isFav ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
            }`}
          >
            {isFav ? "★ Favorited" : "☆ Add to favorites"}
          </button>
          <div className="bg-card border border-border rounded-lg p-3 text-xs space-y-1.5">
            <p><strong>Known for:</strong> {person.knownFor}</p>
            <p><strong>Department:</strong> {person.department}</p>
            <p><strong>Born:</strong> {person.birthdate ?? "—"}</p>
            <p><strong>Birthplace:</strong> {person.birthplace ?? "—"}</p>
            <p><strong>Gender:</strong> {person.gender}</p>
            <p><strong>Credits:</strong> {person.movieCredits.length + person.tvCredits.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 space-y-1.5">
            <p className="text-xs font-semibold">External links</p>
            {person.externalLinks.map((l) => (
              <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{person.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{person.knownFor} · {person.placeOfOrigin}</p>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2">Biography</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{person.biography}</p>
          </div>
          {person.movieCredits.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">Movie credits</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {person.movieCredits.map((c) => (
                  <button key={`${c.id}-${c.character ?? c.job}`} onClick={() => navigate("movie", { id: c.id })} className="text-left group">
                    <div className="aspect-[2/3] rounded overflow-hidden bg-muted border border-border">
                      { }
                      <img src={c.posterUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <p className="text-xs mt-1.5 font-medium line-clamp-1">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{c.character ?? c.job} · {c.year}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {person.tvCredits.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">TV credits</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {person.tvCredits.map((c) => (
                  <button key={`tv-${c.id}-${c.character ?? c.job}`} onClick={() => navigate("tv-details", { id: c.id })} className="text-left group">
                    <div className="aspect-[2/3] rounded overflow-hidden bg-muted border border-border">
                      { }
                      <img src={c.posterUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <p className="text-xs mt-1.5 font-medium line-clamp-1">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{c.character ?? c.job} · {c.year}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { toast } from "sonner";
