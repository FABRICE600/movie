import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// GET /api/discussions
//   ?category=slug         — filter by category
//   ?thread=id             — fetch one thread + replies
//   ?categories=true       — list categories only
export async function GET(req: Request) {
  const url = new URL(req.url);
  const categorySlug = url.searchParams.get("category");
  const threadId = url.searchParams.get("thread");
  const categoriesOnly = url.searchParams.get("categories") === "true";

  if (categoriesOnly) {
    const categories = await db.discussionCategory.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ categories });
  }

  if (threadId) {
    const thread = await db.discussionThread.findUnique({
      where: { id: threadId },
      include: {
        user: { select: { id: true, username: true, name: true, avatarUrl: true, role: true } },
        category: true,
        replies: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, username: true, name: true, avatarUrl: true, role: true } } },
        },
      },
    });
    if (!thread) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    // Increment views (fire-and-forget)
    db.discussionThread.update({ where: { id: threadId }, data: { views: { increment: 1 } } }).catch(() => {});
    return NextResponse.json({ thread });
  }

  const where = categorySlug ? { category: { slug: categorySlug } } : {};
  const threads = await db.discussionThread.findMany({
    where,
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 50,
    include: {
      user: { select: { id: true, username: true, name: true, avatarUrl: true, role: true } },
      category: true,
      _count: { select: { replies: true, likes: true } },
    },
  });

  return NextResponse.json({ threads });
}

const THREAD_SCHEMA = z.object({
  categorySlug: z.string().min(1),
  title: z.string().min(3).max(200),
  body: z.string().min(10).max(5000),
});

const REPLY_SCHEMA = z.object({
  threadId: z.string().min(1),
  body: z.string().min(1).max(2000),
});

const LIKE_SCHEMA = z.object({
  threadId: z.string().optional(),
  replyId: z.string().optional(),
});

// POST — create thread or reply or like
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // Reply
  if (body.threadId && body.body && !body.categorySlug) {
    const parsed = REPLY_SCHEMA.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    const thread = await db.discussionThread.findUnique({ where: { id: parsed.data.threadId } });
    if (!thread) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (thread.locked) return NextResponse.json({ error: "THREAD_LOCKED" }, { status: 400 });

    const reply = await db.discussionReply.create({
      data: { threadId: parsed.data.threadId, userId: user.id, body: parsed.data.body },
      include: { user: { select: { id: true, username: true, name: true, avatarUrl: true, role: true } } },
    });
    await db.discussionThread.update({
      where: { id: parsed.data.threadId },
      data: { updatedAt: new Date() },
    });
    // Notify thread owner
    if (thread.userId !== user.id) {
      await db.notification.create({
        data: {
          userId: thread.userId,
          type: "REVIEW_REPLY",
          title: "New reply to your discussion",
          body: `${user.username} replied to "${thread.title}"`,
        },
      });
    }
    return NextResponse.json({ reply });
  }

  // Like
  if (body.threadId && !body.body) {
    const parsed = LIKE_SCHEMA.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    const existing = await db.threadLike.findUnique({
      where: { threadId_userId: { threadId: parsed.data.threadId!, userId: user.id } },
    });
    if (existing) {
      await db.threadLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }
    await db.threadLike.create({ data: { threadId: parsed.data.threadId!, userId: user.id } });
    return NextResponse.json({ liked: true });
  }

  if (body.replyId && !body.body) {
    const parsed = LIKE_SCHEMA.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    const existing = await db.replyLike.findUnique({
      where: { replyId_userId: { replyId: parsed.data.replyId!, userId: user.id } },
    });
    if (existing) {
      await db.replyLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }
    await db.replyLike.create({ data: { replyId: parsed.data.replyId!, userId: user.id } });
    return NextResponse.json({ liked: true });
  }

  // Create thread
  const parsed = THREAD_SCHEMA.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });

  const category = await db.discussionCategory.findUnique({ where: { slug: parsed.data.categorySlug } });
  if (!category) return NextResponse.json({ error: "CATEGORY_NOT_FOUND" }, { status: 404 });

  const thread = await db.discussionThread.create({
    data: {
      categoryId: category.id,
      userId: user.id,
      title: parsed.data.title,
      body: parsed.data.body,
    },
    include: {
      user: { select: { id: true, username: true, name: true, avatarUrl: true, role: true } },
      category: true,
      _count: { select: { replies: true, likes: true } },
    },
  });

  return NextResponse.json({ thread });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const url = new URL(req.url);
  const threadId = url.searchParams.get("threadId");
  const replyId = url.searchParams.get("replyId");

  if (replyId) {
    const reply = await db.discussionReply.findUnique({ where: { id: replyId } });
    if (!reply) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (reply.userId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    await db.discussionReply.delete({ where: { id: replyId } });
    return NextResponse.json({ ok: true });
  }

  if (threadId) {
    const thread = await db.discussionThread.findUnique({ where: { id: threadId } });
    if (!thread) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (thread.userId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    await db.discussionThread.delete({ where: { id: threadId } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "threadId or replyId required" }, { status: 400 });
}
