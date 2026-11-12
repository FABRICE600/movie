import { NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id) {
    const collection = await tmdb.getCollection(parseInt(id));
    return NextResponse.json({ collection });
  }
  const collections = await tmdb.getCollections();
  return NextResponse.json({ results: collections });
}
