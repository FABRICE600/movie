import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  const items = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const unread = await db.notification.count({
    where: { userId: user.id, read: false },
  });
  return NextResponse.json({ items, unread });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { action, id } = body as { action?: "markAll" | "markOne" | "delete"; id?: string };
  if (action === "markAll") {
    await db.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  } else if (action === "markOne" && id) {
    await db.notification.updateMany({
      where: { id, userId: user.id },
      data: { read: true },
    });
  } else if (action === "delete" && id) {
    await db.notification.deleteMany({ where: { id, userId: user.id } });
  }
  return NextResponse.json({ ok: true });
}
