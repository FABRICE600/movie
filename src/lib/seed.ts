import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { GENRES, GENRE_MAP } from "@/lib/mock-data";

const ADMIN_EMAIL = "admin@cineverse.demo";
const ADMIN_PASSWORD = "admin12345";

export async function ensureSeed() {
  try {
    // Seed admin
    const existingAdmin = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!existingAdmin) {
      await db.user.create({
        data: {
          email: ADMIN_EMAIL,
          username: "admin",
          name: "CineVerse Admin",
          passwordHash: await hashPassword(ADMIN_PASSWORD),
          role: "ADMIN",
          country: "RW",
          preferredLang: "en",
        },
      });
      // Also seed some notifications for admin
      const admin = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });
      if (admin) {
        await db.notification.createMany({
          data: [
            {
              userId: admin.id,
              type: "SYSTEM",
              title: "Welcome to CineVerse Admin",
              body: "Your admin dashboard is ready. Use it to moderate reviews, manage users, and configure the platform.",
            },
            {
              userId: admin.id,
              type: "NEW_RELEASE",
              title: "New release: Echoes of Tomorrow",
              body: "The featured title of the day is now live across the homepage.",
            },
          ],
        });
      }
    }

    // Seed a demo user
    const demoEmail = "demo@cineverse.demo";
    const existingDemo = await db.user.findUnique({ where: { email: demoEmail } });
    if (!existingDemo) {
      const demo = await db.user.create({
        data: {
          email: demoEmail,
          username: "demo_user",
          name: "Demo Viewer",
          passwordHash: await hashPassword("demo12345"),
          role: "PREMIUM",
          country: "US",
          preferredLang: "en",
        },
      });
      // Seed demo watchlist + favorite + review + rating
      await db.watchlist.createMany({
        data: [
          { userId: demo.id, tmdbId: 101, mediaType: "MOVIE", status: "WATCHING" },
          { userId: demo.id, tmdbId: 201, mediaType: "TV", status: "PENDING" },
          { userId: demo.id, tmdbId: 113, mediaType: "MOVIE", status: "COMPLETED" },
        ],
      });
      await db.favorite.createMany({
        data: [
          { userId: demo.id, tmdbId: 101, mediaType: "MOVIE" },
          { userId: demo.id, tmdbId: 113, mediaType: "MOVIE" },
          { userId: demo.id, tmdbId: 201, mediaType: "TV" },
        ],
      });
      await db.rating.createMany({
        data: [
          { userId: demo.id, tmdbId: 101, mediaType: "MOVIE", score: 9 },
          { userId: demo.id, tmdbId: 113, mediaType: "MOVIE", score: 10 },
          { userId: demo.id, tmdbId: 201, mediaType: "TV", score: 8 },
        ],
      });
      await db.review.createMany({
        data: [
          {
            userId: demo.id,
            tmdbId: 101,
            mediaType: "MOVIE",
            title: "A gorgeous, quietly devastating film",
            content:
              "Echoes of Tomorrow is the kind of science fiction I keep hoping for: ideas first, spectacle second, and a beating heart underneath. Ava Sinclair is a revelation.",
            spoiler: false,
            helpful: 42,
          },
          {
            userId: demo.id,
            tmdbId: 113,
            mediaType: "MOVIE",
            title: "Tissues required",
            content:
              "Bring tissues. The final fifteen minutes reduced me to a wreck and I do not regret a single second.",
            spoiler: false,
            helpful: 28,
          },
        ],
      });
    }

    // Seed discussion categories
    const categoryCount = await db.discussionCategory.count();
    if (categoryCount === 0) {
      const categories = await db.discussionCategory.createMany({
        data: [
          { slug: "general", name: "General Discussion", description: "Talk about anything movie-related.", color: "#E50914", sortOrder: 1 },
          { slug: "movie-reviews", name: "Movie Reviews", description: "In-depth reviews beyond our title pages.", color: "#F5C518", sortOrder: 2 },
          { slug: "tv-talk", name: "TV Talk", description: "Episode discussions, season arcs, predictions.", color: "#3B82F6", sortOrder: 3 },
          { slug: "recommendations", name: "Recommendations", description: "Ask for and share recommendations.", color: "#10B981", sortOrder: 4 },
          { slug: "news-rumors", name: "News & Rumors", description: "Industry news, casting, release dates.", color: "#A855F7", sortOrder: 5 },
          { slug: "international", name: "International Cinema", description: "World cinema — Nollywood, K-drama, anime, arthouse.", color: "#EC4899", sortOrder: 6 },
          { slug: "off-topic", name: "Off-Topic Lounge", description: "Anything not strictly movies.", color: "#6B7280", sortOrder: 7 },
        ],
      });
    }

    // Seed achievements
    const achievementCount = await db.achievement.count();
    if (achievementCount === 0) {
      await db.achievement.createMany({
        data: [
          { slug: "first-watchlist", name: "First Watch", description: "Added your first title to a watchlist.", icon: "Bookmark", tier: "BRONZE" },
          { slug: "ten-titles", name: "Collector", description: "Saved 10 titles to your watchlist.", icon: "Layers", tier: "BRONZE" },
          { slug: "fifty-titles", name: "Archivist", description: "Saved 50 titles to your watchlist.", icon: "Archive", tier: "SILVER" },
          { slug: "first-review", name: "Critic", description: "Wrote your first review.", icon: "PenLine", tier: "BRONZE" },
          { slug: "ten-reviews", name: "Prolific Critic", description: "Wrote 10 reviews.", icon: "PenTool", tier: "SILVER" },
          { slug: "first-rating", name: "Rater", description: "Rated your first title.", icon: "Star", tier: "BRONZE" },
          { slug: "perfect-score", name: "Perfect Score", description: "Got a perfect 10/10 rating on a quiz.", icon: "Trophy", tier: "GOLD" },
          { slug: "premium-member", name: "Premium Member", description: "Subscribed to a Premium plan.", icon: "Crown", tier: "GOLD" },
          { slug: "centurion", name: "Centurion", description: "Watched 100 titles.", icon: "Medal", tier: "GOLD" },
          { slug: "cinephile", name: "Cinephile", description: "Watched 250+ titles. Legendary.", icon: "Sparkles", tier: "PLATINUM" },
        ],
      });
    }
  } catch (e) {
    // Idempotent: ignore unique constraint errors on re-seed
    console.error("Seed error (non-fatal):", e instanceof Error ? e.message : String(e));
  }
}

// Cache for genres (avoid DB calls for static lookup)
export const genreList = () => GENRES.map((g) => ({ id: g.id, name: g.name }));
export const genreName = (id: number) => GENRE_MAP[id] ?? "Unknown";
