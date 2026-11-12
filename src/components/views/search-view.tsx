"use client";

import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import { useAppStore } from "@/store/app-store";
import { MovieGrid, MovieGridSkeleton } from "@/components/site/movie-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";

export function SearchView() {
  const params = useAppStore((s) => s.params);
  const navigate = useAppStore((s) => s.navigate);
  const q = String(params.q ?? "");
  const [tab, setTab] = useState("movies");

  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: () => tmdb.searchMulti(q),
    enabled: !!q,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
          <SearchIcon className="h-6 w-6 text-primary" /> Search
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {q ? <>Results for <strong className="text-foreground">"{q}"</strong></> : "Type to search across movies, TV, and people."}
        </p>
      </div>
      {!q ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          Use the search bar above to find titles.
        </div>
      ) : isLoading ? (
        <MovieGridSkeleton count={6} />
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="movies">Movies <Badge variant="secondary" className="ml-1 text-[10px]">{data?.movies.length ?? 0}</Badge></TabsTrigger>
            <TabsTrigger value="tv">TV <Badge variant="secondary" className="ml-1 text-[10px]">{data?.tv.length ?? 0}</Badge></TabsTrigger>
            <TabsTrigger value="people">People <Badge variant="secondary" className="ml-1 text-[10px]">{data?.people.length ?? 0}</Badge></TabsTrigger>
          </TabsList>
          <TabsContent value="movies" className="mt-4">
            {data?.movies.length ? <MovieGrid items={data.movies} /> : <Empty />}
          </TabsContent>
          <TabsContent value="tv" className="mt-4">
            {data?.tv.length ? <MovieGrid items={data.tv} /> : <Empty />}
          </TabsContent>
          <TabsContent value="people" className="mt-4">
            {data?.people.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {data!.people.map((p) => (
                  <button key={p.id} onClick={() => navigate("person", { id: p.id })} className="text-left group">
                    <div className="aspect-square rounded-full overflow-hidden bg-muted border-2 border-border group-hover:border-primary/60">
                      { }
                      <img src={p.profileUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-sm mt-2 font-medium text-center line-clamp-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground text-center">{p.knownFor}</p>
                  </button>
                ))}
              </div>
            ) : (
              <Empty />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function Empty() {
  return <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No matches in this category.</div>;
}
