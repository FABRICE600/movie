import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { MOVIES, TV_SHOWS, PEOPLE } from "@/lib/mock-data";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "stats";

  if (action === "stats") {
    const [users, watchlists, favorites, reviews, ratings, notifications, auditLogs] = await Promise.all([
      db.user.count(),
      db.watchlist.count(),
      db.favorite.count(),
      db.review.count(),
      db.rating.count(),
      db.notification.count(),
      db.auditLog.count(),
    ]);
    const recentUsers = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, email: true, username: true, name: true, role: true, country: true, createdAt: true },
    });
    return NextResponse.json({
      counts: { users, watchlists, favorites, reviews, ratings, notifications, auditLogs },
      catalog: { movies: MOVIES.length, tv: TV_SHOWS.length, people: PEOPLE.length },
      recentUsers,
    });
  }

  if (action === "users") {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        country: true,
        preferredLang: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ users });
  }

  if (action === "reviews") {
    const reviews = await db.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { username: true, name: true } } },
    });
    return NextResponse.json({ reviews });
  }

  if (action === "audit") {
    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json({ logs });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const { action, userId, role } = body as {
    action?: "setRole" | "deleteUser" | "deleteReview";
    userId?: string;
    role?: string;
    reviewId?: string;
  };

  if (action === "setRole" && userId && role) {
    await db.user.update({ where: { id: userId }, data: { role } });
    await db.auditLog.create({
      data: {
        actorId: user.id,
        action: "SET_ROLE",
        entity: "User",
        entityId: userId,
        detail: `Role set to ${role}`,
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "deleteUser" && userId) {
    if (userId === user.id) {
      return NextResponse.json({ error: "Cannot delete self" }, { status: 400 });
    }
    await db.user.delete({ where: { id: userId } });
    await db.auditLog.create({
      data: {
        actorId: user.id,
        action: "DELETE_USER",
        entity: "User",
        entityId: userId,
      },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const url = new URL(req.url);
  const reviewId = url.searchParams.get("reviewId");
  if (reviewId) {
    await db.review.delete({ where: { id: reviewId } });
    await db.auditLog.create({
      data: {
        actorId: user.id,
        action: "DELETE_REVIEW",
        entity: "Review",
        entityId: reviewId,
      },
    });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "reviewId required" }, { status: 400 });
}
