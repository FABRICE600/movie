import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const PLANS = {
  FREE: { amount: 0, currency: "USD", period: "forever" },
  PREMIUM_MONTHLY: { amount: 7.99, currency: "USD", period: "month" },
  PREMIUM_YEARLY: { amount: 59.99, currency: "USD", period: "year" },
} as const;

const SUBSCRIBE_SCHEMA = z.object({
  plan: z.enum(["FREE", "PREMIUM_MONTHLY", "PREMIUM_YEARLY"]),
  provider: z.enum(["STRIPE", "PAYPAL", "MOBILE_MONEY"]).optional(),
  couponCode: z.string().optional(),
});

// GET — fetch current user's subscription
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const subscription = await db.subscription.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  const payments = subscription?.payments ?? [];

  return NextResponse.json({
    plan: subscription?.plan ?? (user.role === "PREMIUM" ? "PREMIUM_YEARLY" : "FREE"),
    status: subscription?.status ?? "ACTIVE",
    autoRenew: subscription?.autoRenew ?? false,
    startDate: subscription?.startDate ?? null,
    endDate: subscription?.endDate ?? null,
    payments,
  });
}

// POST — create / upgrade subscription
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = SUBSCRIBE_SCHEMA.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }

  const { plan, provider = "STRIPE", couponCode } = parsed.data;
  const planConfig = PLANS[plan];

  // Validate coupon if provided
  let discount = 0;
  if (couponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: couponCode } });
    if (!coupon || !coupon.active || coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "INVALID_COUPON" }, { status: 400 });
    }
    if (coupon.validTo && coupon.validTo < new Date()) {
      return NextResponse.json({ error: "COUPON_EXPIRED" }, { status: 400 });
    }
    discount = coupon.type === "PERCENT" ? (planConfig.amount * coupon.value) / 100 : coupon.value;
  }

  const finalAmount = Math.max(0, planConfig.amount - discount);

  // Cancel any existing active subscription
  await db.subscription.updateMany({
    where: { userId: user.id, status: "ACTIVE" },
    data: { status: "CANCELED", endDate: new Date() },
  });

  // For FREE plan, just downgrade the user role
  if (plan === "FREE") {
    await db.user.update({ where: { id: user.id }, data: { role: "USER" } });
    await db.auditLog.create({
      data: { actorId: user.id, action: "DOWNGRADE_TO_FREE", entity: "Subscription", detail: "User downgraded to Free" },
    });
    return NextResponse.json({ ok: true, plan: "FREE", message: "Subscription canceled — access downgraded to Free." });
  }

  // For premium plans, create subscription + payment record
  const endDate = new Date();
  if (plan === "PREMIUM_MONTHLY") endDate.setMonth(endDate.getMonth() + 1);
  if (plan === "PREMIUM_YEARLY") endDate.setFullYear(endDate.getFullYear() + 1);

  const subscription = await db.subscription.create({
    data: {
      userId: user.id,
      plan,
      status: "ACTIVE",
      startDate: new Date(),
      endDate,
      autoRenew: true,
      paymentProvider: provider,
    },
  });

  const payment = await db.payment.create({
    data: {
      subscriptionId: subscription.id,
      userId: user.id,
      amount: finalAmount,
      currency: planConfig.currency,
      provider,
      status: finalAmount === 0 ? "SUCCEEDED" : "SUCCEEDED", // demo: always succeed
      description: `${plan.replace("_", " ")} subscription`,
    },
  });

  // Mark coupon as used
  if (couponCode) {
    await db.coupon.updateMany({
      where: { code: couponCode },
      data: { usedCount: { increment: 1 } },
    });
  }

  // Upgrade user role
  await db.user.update({ where: { id: user.id }, data: { role: "PREMIUM" } });

  await db.auditLog.create({
    data: {
      actorId: user.id,
      action: "UPGRADE_SUBSCRIPTION",
      entity: "Subscription",
      entityId: subscription.id,
      detail: `Upgraded to ${plan} via ${provider}. Payment ${payment.id}: $${finalAmount}`,
    },
  });

  return NextResponse.json({
    ok: true,
    plan,
    paymentId: payment.id,
    amount: finalAmount,
    currency: planConfig.currency,
    endDate,
    message: `Successfully subscribed to ${plan.replace("_", " ")}. In production, a real payment provider (Stripe / PayPal / mobile money) would process the charge.`,
  });
}

// DELETE — cancel subscription
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  await db.subscription.updateMany({
    where: { userId: user.id, status: "ACTIVE" },
    data: { status: "CANCELED", autoRenew: false, endDate: new Date() },
  });

  await db.user.update({ where: { id: user.id }, data: { role: "USER" } });

  await db.auditLog.create({
    data: { actorId: user.id, action: "CANCEL_SUBSCRIPTION", entity: "Subscription", detail: "User canceled subscription" },
  });

  return NextResponse.json({ ok: true, message: "Subscription canceled. Premium access will continue until the end of the current billing period." });
}
