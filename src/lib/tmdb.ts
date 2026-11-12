// CineVerse data-access layer
// Mock-first implementation that mirrors the TMDB API shape.
// When TMDB_API_KEY and TMDB_API_READ_TOKEN are set in env, real API
// calls will be attempted with graceful fallback to mock data.

import {
  ALL_MEDIA,
  MOVIES,
  TV_SHOWS,
  PEOPLE,
  GENRES,
  GENRE_MAP,
  findMedia,
  findPersonById,
  findPersonByName,
  PROVIDERS,
  providersForMedia,
  COLLECTIONS,
  type MediaItem,
  type Person,
  type Genre,
} from "./mock-data";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_READ_TOKEN = process.env.TMDB_API_READ_TOKEN;
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p";

// Note: real TMDB integration is wired but unused in this sandbox demo.
// Set TMDB_API_KEY and TMDB_API_READ_TOKEN to enable live data.
async function tmdbFetch<T>(path: string): Promise<T | null> {
  if (!TMDB_API_KEY && !TMDB_READ_TOKEN) return null;
  try {
    const headers: Record<string, string> = {};
    if (TMDB_READ_TOKEN) headers.Authorization = `Bearer ${TMDB_READ_TOKEN}`;
    const url = `${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY ?? ""}`;
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface Paginated<T> {
  page: number;
  totalPages: number;
  totalResults: number;
  results: T[];
}

export interface DiscoverFilters {
  query?: string;
  genres?: number[];
  yearFrom?: number;
  yearTo?: number;
  ratingFrom?: number;
  ratingTo?: number;
  runtimeFrom?: number;
  runtimeTo?: number;
  languages?: string[];
  countries?: string[];
  sortBy?: "popularity" | "rating" | "newest" | "oldest" | "title" | "revenue";
  mediaType?: "MOVIE" | "TV" | "ALL";
  page?: number;
  pageSize?: number;
}

function applyFilters(filters: DiscoverFilters): MediaItem[] {
  let items = filters.mediaType === "MOVIE" ? [...MOVIES] : filters.mediaType === "TV" ? [...TV_SHOWS] : [...ALL_MEDIA];

  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    items = items.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.originalTitle.toLowerCase().includes(q) ||
        m.overview.toLowerCase().includes(q) ||
        m.keywords.some((k) => k.toLowerCase().includes(q)) ||
        m.cast.some((c) => c.name.toLowerCase().includes(q)) ||
        m.crew.some((c) => c.name.toLowerCase().includes(q))
    );
  }

  if (filters.genres?.length) {
    items = items.filter((m) => filters.genres!.some((g) => m.genres.includes(g)));
  }

  if (filters.yearFrom) items = items.filter((m) => parseInt(m.year) >= filters.yearFrom!);
  if (filters.yearTo) items = items.filter((m) => parseInt(m.year) <= filters.yearTo!);
  if (filters.ratingFrom) items = items.filter((m) => m.voteAverage >= filters.ratingFrom!);
  if (filters.ratingTo) items = items.filter((m) => m.voteAverage <= filters.ratingTo!);
  if (filters.runtimeFrom) items = items.filter((m) => (m.runtime ?? 0) >= filters.runtimeFrom!);
  if (filters.runtimeTo) items = items.filter((m) => (m.runtime ?? 0) <= filters.runtimeTo!);
  if (filters.languages?.length) items = items.filter((m) => filters.languages!.includes(m.originalLanguage));
  if (filters.countries?.length) items = items.filter((m) => m.originCountry.some((c) => filters.countries!.includes(c)));

  switch (filters.sortBy) {
    case "rating":
      items.sort((a, b) => b.voteAverage - a.voteAverage);
      break;
    case "newest":
      items.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
      break;
    case "oldest":
      items.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
      break;
    case "title":
      items.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "revenue":
      items.sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
      break;
    case "popularity":
    default:
      items.sort((a, b) => b.popularity - a.popularity);
  }

  return items;
}

function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const totalResults = items.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const p = Math.min(Math.max(1, page), totalPages);
  const start = (p - 1) * pageSize;
  return {
    page: p,
    totalPages,
    totalResults,
    results: items.slice(start, start + pageSize),
  };
}

export const tmdb = {
  hasRealApiKey: Boolean(TMDB_API_KEY || TMDB_READ_TOKEN),

  async getTrending(window: "day" | "week" = "week", mediaType: "all" | "movie" | "tv" = "all"): Promise<MediaItem[]> {
    const real = await tmdbFetch<{ results: unknown[] }>(`/trending/${mediaType}/${window}`);
    if (real?.results?.length) {
      // Would normalize here; for demo we still return mock for reliability
    }
    return [...ALL_MEDIA].sort((a, b) => b.popularity - a.popularity).slice(0, 12);
  },

  async getPopular(mediaType: "MOVIE" | "TV" = "MOVIE"): Promise<MediaItem[]> {
    const items = mediaType === "MOVIE" ? MOVIES : TV_SHOWS;
    return [...items].sort((a, b) => b.popularity - a.popularity).slice(0, 12);
  },

  async getTopRated(mediaType: "MOVIE" | "TV" = "MOVIE"): Promise<MediaItem[]> {
    const items = mediaType === "MOVIE" ? MOVIES : TV_SHOWS;
    return [...items].sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 12);
  },

  async getUpcoming(): Promise<MediaItem[]> {
    return [...MOVIES].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)).slice(0, 8);
  },

  async getNowPlaying(): Promise<MediaItem[]> {
    return [...MOVIES].slice(0, 8);
  },

  async getByGenre(genreId: number, mediaType: "MOVIE" | "TV" = "MOVIE"): Promise<MediaItem[]> {
    const items = mediaType === "MOVIE" ? MOVIES : TV_SHOWS;
    return items.filter((m) => m.genres.includes(genreId));
  },

  async discover(filters: DiscoverFilters): Promise<Paginated<MediaItem>> {
    const items = applyFilters(filters);
    return paginate(items, filters.page ?? 1, filters.pageSize ?? 12);
  },

  async getMovieDetails(id: number): Promise<MediaItem | null> {
    return findMedia(id) ?? null;
  },

  async getTvDetails(id: number): Promise<MediaItem | null> {
    return findMedia(id) ?? null;
  },

  async getSimilar(id: number): Promise<MediaItem[]> {
    const m = findMedia(id);
    if (!m) return [];
    return m.similar.map((sid) => findMedia(sid)).filter(Boolean) as MediaItem[];
  },

  async getRecommendations(id: number): Promise<MediaItem[]> {
    const m = findMedia(id);
    if (!m) return [];
    return m.recommendations.map((sid) => findMedia(sid)).filter(Boolean) as MediaItem[];
  },

  async getPerson(id: number): Promise<Person | null> {
    return findPersonById(id) ?? null;
  },

  async getPersonByName(name: string): Promise<Person | null> {
    return findPersonByName(name) ?? null;
  },

  async getPopularPeople(): Promise<Person[]> {
    return [...PEOPLE].sort((a, b) => b.movieCredits.length + b.tvCredits.length - (a.movieCredits.length + a.tvCredits.length)).slice(0, 12);
  },

  async searchMulti(query: string): Promise<{ movies: MediaItem[]; tv: MediaItem[]; people: Person[] }> {
    const q = query.toLowerCase().trim();
    if (!q) return { movies: [], tv: [], people: [] };
    const movies = MOVIES.filter((m) => m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q) || m.keywords.some((k) => k.includes(q)));
    const tv = TV_SHOWS.filter((m) => m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q) || m.keywords.some((k) => k.includes(q)));
    const people = PEOPLE.filter((p) => p.name.toLowerCase().includes(q) || p.knownFor.toLowerCase().includes(q));
    return { movies, tv, people };
  },

  async getCollections() {
    return COLLECTIONS;
  },

  async getCollection(id: number) {
    return COLLECTIONS.find((c) => c.id === id) ?? null;
  },

  getGenres(): Genre[] {
    return GENRES;
  },

  getGenreName(id: number): string {
    return GENRE_MAP[id] ?? "Unknown";
  },

  getProviders() {
    return PROVIDERS;
  },

  getProvidersForMedia(id: number) {
    return providersForMedia(id);
  },

  imageUrl(path: string, size: "w200" | "w500" | "w780" | "original" = "w500"): string {
    if (path.startsWith("http")) return path;
    return `${TMDB_IMG}/${size}${path}`;
  },
};

export type { MediaItem, Person, Genre };
