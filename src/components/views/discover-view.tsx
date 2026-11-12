"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import { MovieGrid, MovieGridSkeleton } from "@/components/site/movie-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { GENRES } from "@/lib/mock-data";
import { useAppStore } from "@/store/app-store";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ru", label: "Russian" },
  { code: "rw", label: "Kinyarwanda" },
  { code: "fr", label: "French" },
];

const COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "JP", label: "Japan" },
  { code: "CN", label: "China" },
  { code: "RW", label: "Rwanda" },
  { code: "KE", label: "Kenya" },
  { code: "RU", label: "Russia" },
  { code: "FR", label: "France" },
  { code: "MX", label: "Mexico" },
  { code: "NO", label: "Norway" },
];

export function DiscoverView() {
  const params = useAppStore((s) => s.params);
  // Pre-select genre from query param — derive initial values from params
  // using lazy initial state so we never call setState inside an effect.
  const initialGenre = params.genreId ? parseInt(String(params.genreId)) : NaN;
  const [query, setQuery] = useState(params.q ? String(params.q) : "");
  const [selectedGenres, setSelectedGenres] = useState<number[]>(
    !Number.isNaN(initialGenre) ? [initialGenre] : []
  );
  const [yearRange, setYearRange] = useState<number[]>([1920, 2025]);
  const [ratingRange, setRatingRange] = useState<number[]>([0, 10]);
  const [runtimeRange, setRuntimeRange] = useState<number[]>([0, 240]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [mediaType, setMediaType] = useState<"ALL" | "MOVIE" | "TV">("ALL");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const discover = useQuery({
    queryKey: [
      "discover",
      query,
      selectedGenres,
      yearRange,
      ratingRange,
      runtimeRange,
      selectedLanguages,
      selectedCountries,
      sortBy,
      mediaType,
      page,
    ],
    queryFn: () =>
      tmdb.discover({
        query,
        genres: selectedGenres,
        yearFrom: yearRange[0],
        yearTo: yearRange[1],
        ratingFrom: ratingRange[0],
        ratingTo: ratingRange[1],
        runtimeFrom: runtimeRange[0],
        runtimeTo: runtimeRange[1],
        languages: selectedLanguages,
        countries: selectedCountries,
        sortBy: sortBy as "popularity" | "rating" | "newest" | "oldest" | "title" | "revenue",
        mediaType,
        page,
        pageSize: 12,
      }),
  });

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (query) n++;
    if (selectedGenres.length) n++;
    if (yearRange[0] !== 1920 || yearRange[1] !== 2025) n++;
    if (ratingRange[0] !== 0 || ratingRange[1] !== 10) n++;
    if (runtimeRange[0] !== 0 || runtimeRange[1] !== 240) n++;
    if (selectedLanguages.length) n++;
    if (selectedCountries.length) n++;
    if (mediaType !== "ALL") n++;
    return n;
  }, [query, selectedGenres, yearRange, ratingRange, runtimeRange, selectedLanguages, selectedCountries, mediaType]);

  const clearAll = () => {
    setQuery("");
    setSelectedGenres([]);
    setYearRange([1920, 2025]);
    setRatingRange([0, 10]);
    setRuntimeRange([0, 240]);
    setSelectedLanguages([]);
    setSelectedCountries([]);
    setMediaType("ALL");
    setSortBy("popularity");
    setPage(1);
  };

  const toggleGenre = (id: number) => {
    setSelectedGenres((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
    setPage(1);
  };

  const toggleArr = (arr: string[], v: string, setter: (v: string[]) => void) => {
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Discover</h1>
        <p className="text-sm text-muted-foreground">
          Filter {discover.data?.totalResults ?? 0} titles across movies and TV.
        </p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, keyword, or person..."
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters((v) => !v)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={clearAll} className="gap-1">
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Filter sidebar */}
        {showFilters && (
          <aside className="space-y-5 bg-card border border-border rounded-lg p-4 lg:sticky lg:top-20 lg:self-start">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Media type</Label>
              <div className="grid grid-cols-3 gap-1">
                {(["ALL", "MOVIE", "TV"] as const).map((m) => (
                  <Button
                    key={m}
                    size="sm"
                    variant={mediaType === m ? "default" : "outline"}
                    onClick={() => { setMediaType(m); setPage(1); }}
                  >
                    {m === "ALL" ? "All" : m === "MOVIE" ? "Movies" : "TV"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Decade</Label>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: "All", value: null },
                  { label: "Pre-1980", value: "pre-1980" },
                  { label: "80s", value: "1980" },
                  { label: "90s", value: "1990" },
                  { label: "2000s", value: "2000" },
                  { label: "2010s", value: "2010" },
                  { label: "2020s", value: "2020" },
                ].map((d) => (
                  <button
                    key={d.label}
                    onClick={() => {
                      if (d.value === null) {
                        setYearRange([1920, 2025]);
                      } else if (d.value === "pre-1980") {
                        setYearRange([1920, 1979]);
                      } else {
                        const start = parseInt(d.value);
                        setYearRange([start, start + 9]);
                      }
                      setPage(1);
                    }}
                    className="text-xs px-2 py-1 rounded-full border border-border hover:bg-muted transition-colors"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sort by</Label>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Genres</Label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {GENRES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggleGenre(g.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedGenres.includes(g.id)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-muted/40 border-border hover:bg-muted"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Year range: {yearRange[0]} — {yearRange[1]}
              </Label>
              <Slider
                min={1920}
                max={2025}
                step={1}
                value={yearRange}
                onValueChange={(v) => { setYearRange(v); setPage(1); }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Rating: {ratingRange[0].toFixed(1)} — {ratingRange[1].toFixed(1)}
              </Label>
              <Slider
                min={0}
                max={10}
                step={0.5}
                value={ratingRange}
                onValueChange={(v) => { setRatingRange(v); setPage(1); }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Runtime: {runtimeRange[0]} — {runtimeRange[1]} min
              </Label>
              <Slider
                min={0}
                max={240}
                step={10}
                value={runtimeRange}
                onValueChange={(v) => { setRuntimeRange(v); setPage(1); }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Language</Label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {LANGUAGES.map((l) => (
                  <label key={l.code} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedLanguages.includes(l.code)}
                      onCheckedChange={() => toggleArr(selectedLanguages, l.code, setSelectedLanguages)}
                    />
                    {l.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Country</Label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {COUNTRIES.map((c) => (
                  <label key={c.code} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedCountries.includes(c.code)}
                      onCheckedChange={() => toggleArr(selectedCountries, c.code, setSelectedCountries)}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Results */}
        <div className="space-y-4">
          {discover.isLoading ? (
            <MovieGridSkeleton count={12} />
          ) : discover.data?.results.length ? (
            <>
              <MovieGrid items={discover.data.results} />
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-disabled={page <= 1}
                      className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  <PaginationItem className="px-3 text-sm">
                    Page {discover.data.page} of {discover.data.totalPages}
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(discover.data!.totalPages, p + 1))}
                      aria-disabled={page >= discover.data.totalPages}
                      className={page >= discover.data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-10 text-center">
              <p className="text-muted-foreground">No titles match your filters.</p>
              <Button variant="outline" className="mt-3" onClick={clearAll}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
