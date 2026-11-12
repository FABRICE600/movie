import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const TICKET_SCHEMA = z.object({
  subject: z.string().min(3).max(200),
  email: z.string().email().optional().or(z.literal("")),
  category: z.enum(["GENERAL", "BILLING", "TECHNICAL", "CONTENT", "ABUSE"]).default("GENERAL"),
  message: z.string().min(10).max(5000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = TICKET_SCHEMA.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }

  const user = await getCurrentUser();

  const ticket = await db.supportTicket.create({
    data: {
      userId: user?.id ?? null,
      subject: parsed.data.subject,
      email: parsed.data.email || user?.email || null,
      category: parsed.data.category,
      priority: parsed.data.category === "ABUSE" ? "HIGH" : "NORMAL",
      status: "OPEN",
      message: parsed.data.message,
    },
  });

  if (user) {
    await db.auditLog.create({
      data: {
        actorId: user.id,
        action: "CREATE_SUPPORT_TICKET",
        entity: "SupportTicket",
        entityId: ticket.id,
      },
    });
  }

  return NextResponse.json({ ok: true, ticketId: ticket.id });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const tickets = await db.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ tickets });
}
