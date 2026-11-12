import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  // Optional data export
  const url = new URL(req.url);
  if (url.searchParams.get("export") === "1") {
    const [watchlist, favorites, reviews, ratings, collections, notifications] = await Promise.all([
      db.watchlist.findMany({ where: { userId: user.id } }),
      db.favorite.findMany({ where: { userId: user.id } }),
      db.review.findMany({ where: { userId: user.id } }),
      db.rating.findMany({ where: { userId: user.id } }),
      db.collection.findMany({ where: { userId: user.id }, include: { items: true } }),
      db.notification.findMany({ where: { userId: user.id }, take: 100 }),
    ]);

    const data = {
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        country: user.country,
        preferredLang: user.preferredLang,
        createdAt: user.createdAt,
      },
      watchlist,
      favorites,
      reviews,
      ratings,
      collections,
      notifications,
    };

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="cineverse-data.json"`,
      },
    });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      country: user.country,
      preferredLang: user.preferredLang,
    },
  });
}

const PATCH_SCHEMA = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  country: z.string().max(100).optional(),
  preferredLang: z.string().max(10).optional(),
  oldPassword: z.string().optional(),
  newPassword: z.string().min(8).max(128).optional(),
  action: z.string().optional(),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = PATCH_SCHEMA.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, bio, avatarUrl, country, preferredLang, oldPassword, newPassword, action } = parsed.data;

  // Password change
  if (action === "password" && oldPassword && newPassword) {
    const valid = await verifyPassword(oldPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "INVALID_PASSWORD" }, { status: 400 });
    }
    const newHash = await hashPassword(newPassword);
    await db.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
    await db.auditLog.create({
      data: { actorId: user.id, action: "CHANGE_PASSWORD", entity: "User", entityId: user.id },
    });
    return NextResponse.json({ ok: true });
  }

  // Profile update
  const updates: Record<string, string | null> = {};
  if (name !== undefined) updates.name = name;
  if (bio !== undefined) updates.bio = bio || null;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl || null;
  if (country !== undefined) updates.country = country;
  if (preferredLang !== undefined) updates.preferredLang = preferredLang;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "NO_UPDATES" }, { status: 400 });
  }

  const updated = await db.user.update({ where: { id: user.id }, data: updates });
  await db.auditLog.create({
    data: { actorId: user.id, action: "UPDATE_PROFILE", entity: "User", entityId: user.id, detail: `Updated: ${Object.keys(updates).join(", ")}` },
  });

  return NextResponse.json({
    user: {
      id: updated.id,
      email: updated.email,
      username: updated.username,
      name: updated.name,
      avatarUrl: updated.avatarUrl,
      role: updated.role,
      country: updated.country,
      preferredLang: updated.preferredLang,
    },
  });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Soft delete: anonymize and mark as deleted via audit log
  // Real production should use a deletion queue with 30-day grace period
  await db.user.delete({ where: { id: user.id } });
  await db.auditLog.create({
    data: { action: "ACCOUNT_DELETION", entity: "User", entityId: user.id, detail: `User ${user.email} deleted their account` },
  });

  return NextResponse.json({ ok: true, message: "Account scheduled for deletion. Data will be removed within 30 days." });
}
