import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  const items = await db.watchlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { tmdbId, mediaType, action, status } = body as {
    tmdbId?: number;
    mediaType?: "MOVIE" | "TV";
    action?: "add" | "remove" | "update";
    status?: string;
  };
  if (!tmdbId || !mediaType) {
    return NextResponse.json({ error: "tmdbId and mediaType required" }, { status: 400 });
  }
  if (action === "add") {
    try {
      await db.watchlist.create({
        data: { userId: user.id, tmdbId, mediaType, status: status ?? "PENDING" },
      });
    } catch {
      // Already in watchlist
    }
    return NextResponse.json({ ok: true });
  }
  if (action === "update") {
    await db.watchlist.updateMany({
      where: { userId: user.id, tmdbId, mediaType },
      data: { status: status ?? "PENDING" },
    });
    return NextResponse.json({ ok: true });
  }
  // remove
  await db.watchlist.deleteMany({
    where: { userId: user.id, tmdbId, mediaType },
  });
  return NextResponse.json({ ok: true });
}
