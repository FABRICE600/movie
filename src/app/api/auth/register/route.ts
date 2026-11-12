import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";

const schema = z.object({
  email: z.string().email().max(120),
  username: z.string().min(3).max(40).regex(/^[a-zA-Z0-9_]+$/),
  name: z.string().min(1).max(80).optional(),
  password: z.string().min(8).max(120),
  country: z.string().max(60).optional(),
  preferredLang: z.string().max(8).optional(),
});

export async function POST(req: Request) {
  await ensureSeed();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 422 }
    );
  }
  const { email, username, name, password, country, preferredLang } = parsed.data;
  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Email or username already in use." },
      { status: 409 }
    );
  }
  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      email,
      username,
      name,
      passwordHash,
      country,
      preferredLang,
      role: "USER",
    },
  });
  await createSession(user.id);
  await db.notification.create({
    data: {
      userId: user.id,
      type: "SYSTEM",
      title: `Welcome to CineVerse, ${name ?? username}!`,
      body: "Build your watchlist, follow your favorite actors, and rate movies you love.",
    },
  });
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
