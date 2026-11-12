import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { randomUUID } from "crypto";
import { z } from "zod";

const REQUEST_SCHEMA = z.object({
  email: z.string().email(),
});

const RESET_SCHEMA = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

// POST — request a password reset
// In a real deployment this would email the reset link. Here we return the
// token directly so the demo flow can complete without SMTP.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Detect reset-with-token request vs initial request
  if (body.token && body.newPassword) {
    const parsed = RESET_SCHEMA.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }
    const record = await db.passwordReset.findUnique({ where: { token: parsed.data.token } });
    if (!record || record.used || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "INVALID_OR_EXPIRED_TOKEN" }, { status: 400 });
    }
    const newHash = await hashPassword(parsed.data.newPassword);
    await db.user.update({ where: { id: record.userId }, data: { passwordHash: newHash } });
    await db.passwordReset.update({ where: { id: record.id }, data: { used: true } });
    await db.auditLog.create({
      data: { actorId: record.userId, action: "PASSWORD_RESET", entity: "User", entityId: record.userId },
    });
    return NextResponse.json({ ok: true, message: "Password reset successfully. You can now sign in." });
  }

  // Initial request
  const parsed = REQUEST_SCHEMA.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) {
    // For privacy, don't reveal whether the email exists
    return NextResponse.json({ ok: true, demoToken: null, message: "If that email exists, a reset link has been sent." });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await db.passwordReset.create({ data: { userId: user.id, token, expiresAt } });

  // In production: send email with reset link. In demo: return token for the UI.
  return NextResponse.json({
    ok: true,
    demoToken: token,
    message: "Reset link generated. In production, this would be emailed.",
  });
}
