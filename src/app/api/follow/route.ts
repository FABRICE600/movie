import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/follow?action=followers | following | suggestions | search&q=
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "following";
  const q = url.searchParams.get("q");

  if (action === "followers") {
    const follows = await db.follow.findMany({
      where: { followeeId: user.id },
      include: { follower: { select: { id: true, username: true, name: true, avatarUrl: true, role: true, bio: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users: follows.map((f) => f.follower) });
  }

  if (action === "following") {
    const follows = await db.follow.findMany({
      where: { followerId: user.id },
      include: { followee: { select: { id: true, username: true, name: true, avatarUrl: true, role: true, bio: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users: follows.map((f) => f.followee) });
  }

  if (action === "suggestions") {
    // Suggest users not currently followed, excluding self
    const following = await db.follow.findMany({ where: { followerId: user.id }, select: { followeeId: true } });
    const excludeIds = [user.id, ...following.map((f) => f.followeeId)];
    const users = await db.user.findMany({
      where: { id: { notIn: excludeIds } },
      select: {
        id: true, username: true, name: true, avatarUrl: true, role: true, bio: true,
        _count: { select: { followers: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
    return NextResponse.json({ users });
  }

  if (action === "search" && q) {
    const lower = q.toLowerCase().trim();
    const users = await db.user.findMany({
      where: {
        OR: [
          { username: { contains: lower } },
          { name: { contains: lower } },
          { email: { contains: lower } },
        ],
        id: { not: user.id },
      },
      select: {
        id: true, username: true, name: true, avatarUrl: true, role: true, bio: true,
        _count: { select: { followers: true } },
      },
      take: 20,
    });
    return NextResponse.json({ users });
  }

  // Default: counts
  const [followersCount, followingCount] = await Promise.all([
    db.follow.count({ where: { followeeId: user.id } }),
    db.follow.count({ where: { followerId: user.id } }),
  ]);
  return NextResponse.json({ followersCount, followingCount });
}

// POST /api/follow { userId, action: "follow" | "unfollow" }
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { userId, action } = body as { userId?: string; action?: "follow" | "unfollow" };

  if (!userId || userId === user.id) {
    return NextResponse.json({ error: "INVALID_USER" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  if (action === "unfollow") {
    await db.follow.deleteMany({ where: { followerId: user.id, followeeId: userId } });
    return NextResponse.json({ following: false });
  }

  // follow
  try {
    await db.follow.create({ data: { followerId: user.id, followeeId: userId } });
    // Notify followee
    await db.notification.create({
      data: {
        userId,
        type: "NEW_FOLLOWER",
        title: "New follower",
        body: `${user.username} started following you.`,
      },
    });
    return NextResponse.json({ following: true });
  } catch {
    // Already following
    return NextResponse.json({ following: true });
  }
}
