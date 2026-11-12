import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/search-history — list current user's recent searches
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const history = await db.searchHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return NextResponse.json({ history });
}

// POST /api/search-history { query, resultsCount }
export async function POST(req: Request) {
  const user = await getCurrentUser();
  const body = await req.json().catch(() => ({}));
  const { query, resultsCount } = body as { query?: string; resultsCount?: number };
  if (!query || !query.trim()) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const created = await db.searchHistory.create({
    data: {
      userId: user?.id ?? null,
      query: query.trim().slice(0, 200),
      resultsCount: resultsCount ?? 0,
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}

// DELETE /api/search-history?id= — delete one or all if no id
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id) {
    await db.searchHistory.deleteMany({ where: { id, userId: user.id } });
  } else {
    await db.searchHistory.deleteMany({ where: { userId: user.id } });
  }
  return NextResponse.json({ ok: true });
}
