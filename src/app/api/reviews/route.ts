import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tmdbId = url.searchParams.get("tmdbId");
  const mediaType = url.searchParams.get("mediaType");
  const mine = url.searchParams.get("mine") === "1";
  if (mine) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ items: [] });
    const items = await db.review.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  }
  if (tmdbId && mediaType) {
    const items = await db.review.findMany({
      where: { tmdbId: parseInt(tmdbId), mediaType },
      orderBy: { helpful: "desc" },
      include: { user: { select: { username: true, name: true, avatarUrl: true } } },
    });
    return NextResponse.json({ items });
  }
  return NextResponse.json({ error: "tmdbId and mediaType or mine=1 required" }, { status: 400 });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { tmdbId, mediaType, title, content, spoiler } = body as {
    tmdbId?: number;
    mediaType?: "MOVIE" | "TV";
    title?: string;
    content?: string;
    spoiler?: boolean;
  };
  if (!tmdbId || !mediaType || !title || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const review = await db.review.create({
    data: {
      userId: user.id,
      tmdbId,
      mediaType,
      title: title.slice(0, 200),
      content: content.slice(0, 5000),
      spoiler: Boolean(spoiler),
    },
  });
  return NextResponse.json({ review });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.review.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id, action } = body as { id?: string; action?: "helpful" };
  if (!id || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (action === "helpful") {
    await db.review.update({ where: { id }, data: { helpful: { increment: 1 } } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
