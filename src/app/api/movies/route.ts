import { NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "discover";
  const id = url.searchParams.get("id");
  const query = url.searchParams.get("query") ?? "";
  const genres = url.searchParams.getAll("genre").map((g) => parseInt(g)).filter(Boolean);
  const yearFrom = url.searchParams.get("yearFrom");
  const yearTo = url.searchParams.get("yearTo");
  const ratingFrom = url.searchParams.get("ratingFrom");
  const ratingTo = url.searchParams.get("ratingTo");
  const runtimeFrom = url.searchParams.get("runtimeFrom");
  const runtimeTo = url.searchParams.get("runtimeTo");
  const languages = url.searchParams.getAll("lang");
  const countries = url.searchParams.getAll("country");
  const sortBy = (url.searchParams.get("sortBy") ?? "popularity") as
    | "popularity" | "rating" | "newest" | "oldest" | "title" | "revenue";
  const mediaType = (url.searchParams.get("mediaType") ?? "ALL") as "MOVIE" | "TV" | "ALL";
  const page = parseInt(url.searchParams.get("page") ?? "1") || 1;
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "12") || 12;
  const window = (url.searchParams.get("window") ?? "week") as "day" | "week";

  switch (action) {
    case "trending": {
      const items = await tmdb.getTrending(window, "all");
      return NextResponse.json({ results: items });
    }
    case "popular": {
      const items = await tmdb.getPopular(mediaType === "ALL" ? "MOVIE" : mediaType);
      return NextResponse.json({ results: items });
    }
    case "top-rated": {
      const items = await tmdb.getTopRated(mediaType === "ALL" ? "MOVIE" : mediaType);
      return NextResponse.json({ results: items });
    }
    case "upcoming": {
      const items = await tmdb.getUpcoming();
      return NextResponse.json({ results: items });
    }
    case "now-playing": {
      const items = await tmdb.getNowPlaying();
      return NextResponse.json({ results: items });
    }
    case "by-genre": {
      const gid = parseInt(url.searchParams.get("genreId") ?? "0");
      if (!gid) return NextResponse.json({ error: "genreId required" }, { status: 400 });
      const items = await tmdb.getByGenre(gid, mediaType === "TV" ? "TV" : "MOVIE");
      return NextResponse.json({ results: items });
    }
    case "similar": {
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const items = await tmdb.getSimilar(parseInt(id));
      return NextResponse.json({ results: items });
    }
    case "recommendations": {
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const items = await tmdb.getRecommendations(parseInt(id));
      return NextResponse.json({ results: items });
    }
    case "search": {
      const result = await tmdb.searchMulti(query);
      return NextResponse.json(result);
    }
    case "details":
    default: {
      if (id) {
        const item = await tmdb.getMovieDetails(parseInt(id));
        return NextResponse.json({ item });
      }
      const result = await tmdb.discover({
        query,
        genres: genres.length ? genres : undefined,
        yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
        yearTo: yearTo ? parseInt(yearTo) : undefined,
        ratingFrom: ratingFrom ? parseFloat(ratingFrom) : undefined,
        ratingTo: ratingTo ? parseFloat(ratingTo) : undefined,
        runtimeFrom: runtimeFrom ? parseInt(runtimeFrom) : undefined,
        runtimeTo: runtimeTo ? parseInt(runtimeTo) : undefined,
        languages: languages.length ? languages : undefined,
        countries: countries.length ? countries : undefined,
        sortBy,
        mediaType,
        page,
        pageSize,
      });
      return NextResponse.json(result);
    }
  }
}
