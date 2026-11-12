import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// GET /api/viewing-history — list current user's viewing history
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const history = await db.viewingHistory.findMany({
    where: { userId: user.id },
    orderBy: { watchedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ history });
}

const POST_SCHEMA = z.object({
  tmdbId: z.number().int(),
  mediaType: z.enum(["MOVIE", "TV"]),
  duration: z.number().int().optional(),
});

// POST /api/viewing-history — record a viewing event
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const parsed = POST_SCHEMA.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const created = await db.viewingHistory.create({
    data: {
      userId: user.id,
      tmdbId: parsed.data.tmdbId,
      mediaType: parsed.data.mediaType,
      duration: parsed.data.duration,
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}

// DELETE /api/viewing-history?id= — delete one or all
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id) {
    await db.viewingHistory.deleteMany({ where: { id, userId: user.id } });
  } else {
    await db.viewingHistory.deleteMany({ where: { userId: user.id } });
  }
  return NextResponse.json({ ok: true });
}
