import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tmdbId = url.searchParams.get("tmdbId");
  const mediaType = url.searchParams.get("mediaType");
  if (tmdbId && mediaType) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ score: null });
    const rating = await db.rating.findUnique({
      where: {
        userId_tmdbId_mediaType: {
          userId: user.id,
          tmdbId: parseInt(tmdbId),
          mediaType,
        },
      },
    });
    return NextResponse.json({ score: rating?.score ?? null });
  }
  // Aggregate ratings for an item
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  const items = await db.rating.findMany({ where: { userId: user.id } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { tmdbId, mediaType, score } = body as {
    tmdbId?: number;
    mediaType?: "MOVIE" | "TV";
    score?: number;
  };
  if (!tmdbId || !mediaType || typeof score !== "number") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const clamped = Math.max(1, Math.min(10, Math.round(score)));
  await db.rating.upsert({
    where: {
      userId_tmdbId_mediaType: {
        userId: user.id,
        tmdbId,
        mediaType,
      },
    },
    create: { userId: user.id, tmdbId, mediaType, score: clamped },
    update: { score: clamped },
  });
  return NextResponse.json({ ok: true, score: clamped });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const url = new URL(req.url);
  const tmdbId = url.searchParams.get("tmdbId");
  const mediaType = url.searchParams.get("mediaType");
  if (!tmdbId || !mediaType) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  await db.rating.deleteMany({
    where: { userId: user.id, tmdbId: parseInt(tmdbId), mediaType },
  });
  return NextResponse.json({ ok: true });
}
