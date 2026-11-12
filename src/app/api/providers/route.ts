import { NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mediaId = url.searchParams.get("mediaId");
  if (mediaId) {
    const providers = tmdb.getProvidersForMedia(parseInt(mediaId));
    return NextResponse.json({ providers });
  }
  return NextResponse.json({ providers: tmdb.getProviders() });
}
