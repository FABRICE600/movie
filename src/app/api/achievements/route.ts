import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/achievements — all achievements + which the current user has earned
export async function GET() {
  const user = await getCurrentUser();
  const achievements = await db.achievement.findMany({
    orderBy: { tier: "asc" },
  });

  let earned: { achievementId: string; earnedAt: Date }[] = [];
  if (user) {
    const records = await db.userAchievement.findMany({
      where: { userId: user.id },
      select: { achievementId: true, earnedAt: true },
    });
    earned = records;
  }

  return NextResponse.json({
    achievements: achievements.map((a) => ({
      ...a,
      earned: earned.some((e) => e.achievementId === a.id),
      earnedAt: earned.find((e) => e.achievementId === a.id)?.earnedAt ?? null,
    })),
    earnedCount: earned.length,
    totalCount: achievements.length,
  });
}
