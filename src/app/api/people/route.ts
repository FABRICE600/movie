import { NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "popular";
  const id = url.searchParams.get("id");
  const name = url.searchParams.get("name");

  if (action === "details" && id) {
    const person = await tmdb.getPerson(parseInt(id));
    return NextResponse.json({ person });
  }
  if (action === "by-name" && name) {
    const person = await tmdb.getPersonByName(name);
    return NextResponse.json({ person });
  }
  const people = await tmdb.getPopularPeople();
  return NextResponse.json({ results: people });
}
