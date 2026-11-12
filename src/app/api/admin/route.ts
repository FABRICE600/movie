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

  // ─── Analytics ─────────────────────────────────────────────
  if (action === "analytics") {
    const days = parseInt(url.searchParams.get("days") ?? "30");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      pageViews, searches, movieViews, signups, logins,
      ratings, reviews, watchlistAdds, totalEvents,
      topSearched, topViewed,
    ] = await Promise.all([
      db.analyticsEvent.count({ where: { eventType: "PAGE_VIEW", createdAt: { gte: since } } }),
      db.analyticsEvent.count({ where: { eventType: "SEARCH", createdAt: { gte: since } } }),
      db.analyticsEvent.count({ where: { eventType: "MOVIE_VIEW", createdAt: { gte: since } } }),
      db.analyticsEvent.count({ where: { eventType: "SIGNUP", createdAt: { gte: since } } }),
      db.analyticsEvent.count({ where: { eventType: "LOGIN", createdAt: { gte: since } } }),
      db.analyticsEvent.count({ where: { eventType: "RATING", createdAt: { gte: since } } }),
      db.analyticsEvent.count({ where: { eventType: "REVIEW", createdAt: { gte: since } } }),
      db.analyticsEvent.count({ where: { eventType: "WATCHLIST_ADD", createdAt: { gte: since } } }),
      db.analyticsEvent.count({ where: { createdAt: { gte: since } } }),
      db.analyticsEvent.groupBy({
        by: ["query"],
        where: { eventType: "SEARCH", query: { not: null }, createdAt: { gte: since } },
        _count: true,
        orderBy: { _count: { query: "desc" } },
        take: 10,
      }),
      db.analyticsEvent.groupBy({
        by: ["tmdbId", "mediaType"],
        where: { eventType: "MOVIE_VIEW", tmdbId: { not: null }, createdAt: { gte: since } },
        _count: true,
        orderBy: { _count: { tmdbId: "desc" } },
        take: 10,
      }),
    ]);

    // Daily breakdown for chart
    const dailyRows = await db.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { eventType: true, createdAt: true },
    });
    const dailyMap: Record<string, Record<string, number>> = {};
    dailyRows.forEach((r) => {
      const day = r.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = {};
      dailyMap[day][r.eventType] = (dailyMap[day][r.eventType] ?? 0) + 1;
    });
    const daily = Object.entries(dailyMap)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    // Device/user-agent breakdown (rough)
    const uaRows = await db.analyticsEvent.groupBy({
      by: ["userAgent"],
      where: { eventType: "PAGE_VIEW", userAgent: { not: null }, createdAt: { gte: since } },
      _count: true,
      orderBy: { _count: { userAgent: "desc" } },
      take: 5,
    });
    const devices = uaRows.map((r) => ({
      label: /mobile|android|iphone/i.test(r.userAgent ?? "") ? "Mobile" : /tablet|ipad/i.test(r.userAgent ?? "") ? "Tablet" : "Desktop",
      count: r._count,
    }));

    return NextResponse.json({
      totals: { pageViews, searches, movieViews, signups, logins, ratings, reviews, watchlistAdds, totalEvents },
      daily,
      topSearched: topSearched.map((s) => ({ query: s.query, count: s._count })),
      topViewed: topViewed.map((t) => ({ tmdbId: t.tmdbId, mediaType: t.mediaType, count: t._count })),
      devices,
      days,
    });
  }

  // ─── Reports / Moderation queue ───────────────────────────
  if (action === "reports") {
    const status = url.searchParams.get("status") ?? "PENDING";
    const reports = await db.report.findMany({
      where: status === "ALL" ? {} : { status },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ reports });
  }

  // ─── Site settings ────────────────────────────────────────
  if (action === "settings") {
    const settings = await db.siteSetting.findMany({ orderBy: { category: "asc" } });
    return NextResponse.json({ settings });
  }

  // ─── Announcements ────────────────────────────────────────
  if (action === "announcements") {
    const announcements = await db.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json({ announcements });
  }

  // ─── Featured content ─────────────────────────────────────
  if (action === "featured") {
    const featured = await db.featuredContent.findMany({
      where: { isActive: true },
      orderBy: [{ slot: "asc" }, { order: "asc" }],
    });
    return NextResponse.json({ featured });
  }

  // ─── Database stats ───────────────────────────────────────
  if (action === "db-stats") {
    const tableCounts = await Promise.all([
      db.user.count(),
      db.session.count(),
      db.watchlist.count(),
      db.favorite.count(),
      db.review.count(),
      db.rating.count(),
      db.collection.count(),
      db.notification.count(),
      db.activityLog.count(),
      db.auditLog.count(),
      db.apiCache.count(),
      db.discussionThread.count(),
      db.discussionReply.count(),
      db.follow.count(),
      db.supportTicket.count(),
      db.achievement.count(),
      db.userAchievement.count(),
      db.siteSetting.count(),
      db.announcement.count(),
      db.featuredContent.count(),
      db.analyticsEvent.count(),
      db.searchHistory.count(),
      db.viewingHistory.count(),
      db.report.count(),
    ]);
    const tables = [
      "User", "Session", "Watchlist", "Favorite", "Review", "Rating", "Collection",
      "Notification", "ActivityLog", "AuditLog", "ApiCache", "DiscussionThread",
      "DiscussionReply", "Follow", "SupportTicket", "Achievement", "UserAchievement",
      "SiteSetting", "Announcement", "FeaturedContent", "AnalyticsEvent",
      "SearchHistory", "ViewingHistory", "Report",
    ];
    return NextResponse.json({
      tables: tables.map((name, i) => ({ name, count: tableCounts[i] })),
      totalRecords: tableCounts.reduce((s, c) => s + c, 0),
      dbPath: "db/custom.db (SQLite)",
    });
  }

  // ─── Notifications management ─────────────────────────────
  if (action === "all-notifications") {
    const notifications = await db.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { username: true, email: true } } },
    });
    return NextResponse.json({ notifications });
  }


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
  const { action } = body as { action?: string };

  // ─── Create announcement ──────────────────────────────────
  if (action === "createAnnouncement") {
    const { title, body: annBody, type, audience, endsAt } = body as {
      title?: string; body?: string; type?: string; audience?: string; endsAt?: string;
    };
    if (!title || !annBody) {
      return NextResponse.json({ error: "title and body required" }, { status: 400 });
    }
    const ann = await db.announcement.create({
      data: {
        title,
        body: annBody,
        type: type ?? "INFO",
        audience: audience ?? "ALL",
        endsAt: endsAt ? new Date(endsAt) : null,
        createdBy: user.id,
      },
    });
    await db.auditLog.create({
      data: { actorId: user.id, action: "CREATE_ANNOUNCEMENT", entity: "Announcement", entityId: ann.id },
    });
    return NextResponse.json({ ok: true, announcement: ann });
  }

  // ─── Update site setting ──────────────────────────────────
  if (action === "updateSetting") {
    const { key, value, category } = body as { key?: string; value?: string; category?: string };
    if (!key || value === undefined) {
      return NextResponse.json({ error: "key and value required" }, { status: 400 });
    }
    const setting = await db.siteSetting.upsert({
      where: { key },
      update: { value, category: category ?? "general", updatedBy: user.id },
      create: { key, value, category: category ?? "general", updatedBy: user.id },
    });
    await db.auditLog.create({
      data: { actorId: user.id, action: "UPDATE_SETTING", entity: "SiteSetting", entityId: setting.id, detail: `${key}=${value}` },
    });
    return NextResponse.json({ ok: true, setting });
  }

  // ─── Add featured content ─────────────────────────────────
  if (action === "addFeatured") {
    const { slot, tmdbId, mediaType, title, posterUrl, backdropUrl, order } = body as {
      slot?: string; tmdbId?: number; mediaType?: string; title?: string;
      posterUrl?: string; backdropUrl?: string; order?: number;
    };
    if (!slot || !tmdbId || !title) {
      return NextResponse.json({ error: "slot, tmdbId, title required" }, { status: 400 });
    }
    const featured = await db.featuredContent.create({
      data: {
        slot,
        tmdbId,
        mediaType: mediaType ?? "MOVIE",
        title,
        posterUrl: posterUrl ?? null,
        backdropUrl: backdropUrl ?? null,
        order: order ?? 0,
      },
    });
    await db.auditLog.create({
      data: { actorId: user.id, action: "ADD_FEATURED", entity: "FeaturedContent", entityId: featured.id, detail: `${slot}: ${title}` },
    });
    return NextResponse.json({ ok: true, featured });
  }

  // ─── Action a report ──────────────────────────────────────
  if (action === "actionReport") {
    const { reportId, newStatus } = body as { reportId?: string; newStatus?: string };
    if (!reportId || !newStatus) {
      return NextResponse.json({ error: "reportId and newStatus required" }, { status: 400 });
    }
    await db.report.update({ where: { id: reportId }, data: { status: newStatus } });
    await db.auditLog.create({
      data: { actorId: user.id, action: "ACTION_REPORT", entity: "Report", entityId: reportId, detail: `Status: ${newStatus}` },
    });
    return NextResponse.json({ ok: true });
  }

  // ─── Broadcast notification to all users ──────────────────
  if (action === "broadcast") {
    const { title, body: notifBody, type } = body as { title?: string; body?: string; type?: string };
    if (!title || !notifBody) {
      return NextResponse.json({ error: "title and body required" }, { status: 400 });
    }
    const users = await db.user.findMany({ select: { id: true } });
    await db.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: type ?? "SYSTEM",
        title,
        body: notifBody,
      })),
    });
    await db.auditLog.create({
      data: { actorId: user.id, action: "BROADCAST", entity: "Notification", detail: `${title} → ${users.length} users` },
    });
    return NextResponse.json({ ok: true, recipients: users.length });
  }

  // ─── Existing: setRole / deleteUser ───────────────────────
  const { userId, role } = body as { userId?: string; role?: string };

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
  const announcementId = url.searchParams.get("announcementId");
  const featuredId = url.searchParams.get("featuredId");
  const reportId = url.searchParams.get("reportId");
  const settingKey = url.searchParams.get("settingKey");

  if (reviewId) {
    await db.review.delete({ where: { id: reviewId } });
    await db.auditLog.create({
      data: { actorId: user.id, action: "DELETE_REVIEW", entity: "Review", entityId: reviewId },
    });
    return NextResponse.json({ ok: true });
  }

  if (announcementId) {
    await db.announcement.delete({ where: { id: announcementId } });
    await db.auditLog.create({
      data: { actorId: user.id, action: "DELETE_ANNOUNCEMENT", entity: "Announcement", entityId: announcementId },
    });
    return NextResponse.json({ ok: true });
  }

  if (featuredId) {
    await db.featuredContent.delete({ where: { id: featuredId } });
    await db.auditLog.create({
      data: { actorId: user.id, action: "DELETE_FEATURED", entity: "FeaturedContent", entityId: featuredId },
    });
    return NextResponse.json({ ok: true });
  }

  if (reportId) {
    await db.report.delete({ where: { id: reportId } });
    await db.auditLog.create({
      data: { actorId: user.id, action: "DELETE_REPORT", entity: "Report", entityId: reportId },
    });
    return NextResponse.json({ ok: true });
  }

  if (settingKey) {
    await db.siteSetting.delete({ where: { key: settingKey } });
    await db.auditLog.create({
      data: { actorId: user.id, action: "DELETE_SETTING", entity: "SiteSetting", detail: `key=${settingKey}` },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "reviewId, announcementId, featuredId, reportId, or settingKey required" }, { status: 400 });
}
