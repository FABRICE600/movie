import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  const items = await db.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { tmdbId, mediaType, action } = body as {
    tmdbId?: number;
    mediaType?: "MOVIE" | "TV" | "PERSON";
    action?: "add" | "remove";
  };
  if (!tmdbId || !mediaType) {
    return NextResponse.json({ error: "tmdbId and mediaType required" }, { status: 400 });
  }
  if (action === "add") {
    try {
      await db.favorite.create({ data: { userId: user.id, tmdbId, mediaType } });
    } catch {}
  } else {
    await db.favorite.deleteMany({
      where: { userId: user.id, tmdbId, mediaType },
    });
  }
  return NextResponse.json({ ok: true });
}
