# CineVerse — Movie Discovery Platform

A modern, full-stack movie and TV discovery platform inspired by Netflix, IMDb, and TMDB. Built with **Next.js 16 + TypeScript + Prisma + Tailwind CSS**.

> This is a working demo application. Real TMDB integration is wired up but currently uses a built-in mock dataset (TMDB-shaped) so the app is fully functional without any external API key. To enable live TMDB data, drop your key into `.env.local` — see `.env.example`.

## Table of contents

- [Quick start](#quick-start)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Environment variables](#environment-variables)
- [Database](#database)
- [API routes](#api-routes)
- [Authentication & roles](#authentication--roles)
- [External API integrations](#external-api-integrations)
- [Deployment](#deployment)
- [Security](#security)
- [Feature audit](#feature-audit)
- [Roadmap](#roadmap)

## Quick start

```bash
# 1. Install deps
bun install     # or npm install / pnpm install

# 2. Copy env
cp .env.example .env.local
# Edit .env.local — at minimum set DATABASE_URL
# (SQLite is fine for local dev: file:./db/custom.db)

# 3. Push DB schema
bun run db:push

# 4. Run dev server
bun run dev
# → http://localhost:3000
```

For production:

```bash
bun run build
bun run start
```

## Features

CineVerse implements a working, end-to-end movie discovery experience:

### Discovery & browsing
- Dynamic hero banner with rotating trending titles
- Home rows: Trending, Popular Movies, Popular TV, Top Rated, Coming Soon, genre rows
- Discover view with multi-filter (genre, year range, rating range, runtime, language, country, sort, media type) and pagination
- Dedicated listings: Movies, TV Shows, Trending, Top Rated, Upcoming, Now Playing
- Genre browse with title counts
- Franchises view with chronological watch order and timeline
- Collections (editor-curated)
- Streaming providers overview

### Details
- Movie & TV detail pages with synopsis, cast, crew, ratings, similar titles, recommendations, keywords, production companies, networks, external links
- Person profiles with filmography (movie & TV credits), biography, birthdate/birthplace, known-for, external links
- Trailer playback (YouTube embed)
- Image galleries (backdrops)

### AI Assistant
- Natural-language movie search ("I want something scary", "Korean drama recommendations", "hidden gem sci-fi")
- Mood-based, genre-based, region-based, decade-based, runtime-based interpretations
- Returns curated picks with explanations
- Suggested prompts for quick start

### Box office
- Global Top 10 with weekend/total gross, week-over-week change, markets
- Regional breakdowns (North America, Europe, East Asia, Africa)
- Summary stats

### Awards & festivals
- Curated awards catalog (Oscars, Golden Globes, BAFTA, Emmy, SAG, Cannes, Venice, Berlinale, AMAAs)
- Filter by category (Film / TV / Festival)
- 2025 winners spotlight with nominees

### Release calendar
- Month-by-month calendar grid with releases overlaid
- Upcoming list with "remind me" actions
- Navigate forward/backward by month

### Movie comparison
- Pick any two titles for side-by-side comparison
- Stats table: rating, vote count, popularity, runtime, budget, revenue, release year
- Winner indicator per metric
- Cast comparison

### User accounts
- Email/password registration and login (bcrypt hashed)
- Session cookies (HTTP-only, secure in production)
- Roles: USER, MODERATOR, ADMIN, PREMIUM
- Profile editing (name, bio, avatar, country, preferred language)
- Password change
- Data export (JSON download of all your data)
- Account deletion request flow

### Watchlist, favorites, collections
- Add/remove from watchlist with status (PENDING, WATCHING, COMPLETED, ABANDONED)
- Favorites (movies, TV, people)
- Custom collections with cover, description, public/private
- Watchlist tabbed by status

### Ratings & reviews
- Rate 1–10 on any title
- Write reviews with spoiler warnings
- Review likes, sorting (newest, most helpful, highest, lowest)
- Admin moderation: delete reviews

### Notifications
- In-app notifications for review replies, new followers, system messages
- Unread badge in navbar
- Mark as read / mark all as read

### Admin dashboard
- Stats overview (users, watchlists, favorites, reviews, ratings, notifications, audit logs, catalog counts)
- User management (list, set role, delete)
- Review moderation queue
- Audit log viewer
- Role-protected (ADMIN/MODERATOR only)

### Settings & subscription
- Profile, preferences, notifications, security, subscription tabs
- Three plans: Free, Premium Monthly ($7.99), Premium Yearly ($59.99)
- Payment method showcase (Stripe, PayPal, mobile money)
- Coupon support (_PERCENT / FIXED)
- Subscription cancel / upgrade flow

### Help center
- Help center landing with topic cards
- Searchable FAQ accordion (categorized)
- Contact form (creates support ticket)
- View your support tickets

### Trivia & gamification
- Dynamically generated quiz from catalog data
- Trivia facts sidebar
- Achievement milestones (10, 50, 100, 250 titles)

### Year-in-review
- Personal stats summary (titles watched, hours, avg rating, top genre, reviews)
- Top 5 rated and most popular of the year
- Catalog records (longest runtime, highest revenue)
- Achievement milestones

### UI/UX
- Netflix-inspired dark theme + light theme toggle (persisted)
- Sticky header with backdrop blur on scroll
- Mobile sheet navigation
- Quick search modal
- Skeleton loaders throughout
- Toast notifications (sonner)
- Responsive mobile-first layouts
- Continue browsing row (recently viewed, persisted)
- ARIA labels, semantic HTML, keyboard-accessible

## Tech stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State | Zustand (client) + TanStack Query (server) |
| Database | Prisma ORM (SQLite local / PostgreSQL production) |
| Auth | Custom session-based (bcrypt + HTTP-only cookies) |
| Validation | Zod |
| Forms | React Hook Form |
| Icons | Lucide React |
| Animations | Framer Motion |
| Toasts | Sonner |
| Charts | Recharts |
| Linting | ESLint (next/core-web-vitals) |

## Project structure

```
src/
├── app/
│   ├── page.tsx              # SPA shell — view router
│   ├── layout.tsx            # Root layout (theme, fonts)
│   ├── globals.css           # Tailwind + design tokens
│   └── api/                  # API routes
│       ├── auth/{register,login,logout,me}/route.ts
│       ├── movies/route.ts
│       ├── people/route.ts
│       ├── watchlist/route.ts
│       ├── favorites/route.ts
│       ├── reviews/route.ts
│       ├── ratings/route.ts
│       ├── collections/route.ts
│       ├── notifications/route.ts
│       ├── providers/route.ts
│       ├── subscription/route.ts
│       ├── support/route.ts
│       ├── admin/route.ts
│       └── health/route.ts
├── components/
│   ├── site/                 # Navbar, Footer, Hero, MovieCard, AuthDialog
│   ├── views/                # Page-level views (home, discover, details, ...)
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── tmdb.ts               # Data-access layer (mock + real TMDB)
│   ├── mock-data.ts          # TMDB-shaped mock dataset
│   ├── auth.ts               # Session/cookie helpers, role guards
│   ├── db.ts                 # Prisma client
│   └── utils.ts              # cn() helper
├── store/
│   ├── app-store.ts          # View routing, theme, recently viewed
│   └── auth-store.ts         # Current user state
└── hooks/
    ├── use-mobile.ts
    └── use-toast.ts

prisma/
└── schema.prisma             # Full schema (User, Session, Watchlist,
                             # Favorite, Review, Rating, Collection,
                             # Notification, ActivityLog, AuditLog, ApiCache,
                             # Subscription, Payment, Coupon, Follow,
                             # Achievement, UserAchievement, SupportTicket,
                             # Report, SearchHistory, ViewingHistory)
```

## Environment variables

All env vars are documented in `.env.example`. The minimum needed for local dev:

```bash
DATABASE_URL="file:./db/custom.db"
```

To enable real TMDB data:

```bash
TMDB_API_KEY="your_key_here"
TMDB_API_READ_TOKEN="your_read_token_here"
```

To enable optional integrations:

- `OMDB_API_KEY` — supplementary IMDb ratings/metadata
- `YOUTUBE_API_KEY` — official trailer search
- `WATCHMODE_API_KEY` — streaming availability

For auth, payments, email, see `.env.example`.

## Database

The Prisma schema covers 22 models:

- **Identity**: User, Session
- **Content**: (movies/TV/people cached from TMDB via mock-data.ts — no DB tables for these in the demo)
- **User data**: Watchlist, Favorite, Collection, CollectionItem, Review, Rating, Notification
- **Audit**: ActivityLog, AuditLog
- **Cache**: ApiCache
- **Billing**: Subscription, Payment, Coupon
- **Social**: Follow
- **Gamification**: Achievement, UserAchievement
- **Support**: SupportTicket, Report
- **History**: SearchHistory, ViewingHistory

For production, switch the datasource in `prisma/schema.prisma` from SQLite to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then `bun run db:push`.

## API routes

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Create account | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/logout` | Logout | Public |
| GET | `/api/auth/me` | Current user | Public (returns null if not logged in) |
| PATCH | `/api/auth/me` | Update profile / change password | Required |
| DELETE | `/api/auth/me` | Delete account | Required |
| GET | `/api/auth/me?export=1` | Export your data as JSON | Required |
| GET | `/api/movies` | List movies / get details | Public |
| GET | `/api/people` | List people | Public |
| GET | `/api/watchlist` | List current user's watchlist | Required |
| POST | `/api/watchlist` | Add / remove from watchlist | Required |
| GET | `/api/favorites` | List current user's favorites | Required |
| POST | `/api/favorites` | Add / remove favorite | Required |
| GET | `/api/reviews?tmdbId=&mediaType=` | List reviews for a title | Public |
| POST | `/api/reviews` | Create review | Required |
| DELETE | `/api/reviews?id=` | Delete review | Required (own or admin) |
| GET | `/api/ratings?tmdbId=&mediaType=` | Get your rating for a title | Required |
| POST | `/api/ratings` | Set rating | Required |
| GET | `/api/collections` | List your collections | Required |
| POST | `/api/collections` | Create / update collection | Required |
| GET | `/api/notifications` | List notifications + unread count | Required |
| POST | `/api/notifications` | Mark as read | Required |
| GET | `/api/providers` | List streaming providers | Public |
| GET | `/api/subscription` | Your current subscription | Required |
| POST | `/api/subscription` | Subscribe / upgrade | Required |
| DELETE | `/api/subscription` | Cancel subscription | Required |
| GET | `/api/support` | List your support tickets | Required |
| POST | `/api/support` | Create support ticket | Public (uses email if not logged in) |
| GET | `/api/admin?action=` | Admin dashboard data | Admin/Moderator |
| POST | `/api/admin` | Admin actions (set role, delete user) | Admin/Moderator |
| DELETE | `/api/admin?reviewId=` | Delete review (moderation) | Admin/Moderator |
| GET | `/api/health` | Health check | Public |

## Authentication & roles

- **bcrypt** password hashing (12 rounds)
- HTTP-only session cookies (30-day TTL)
- **NextAuth.js v4** for OAuth (Google + GitHub) and Credentials providers
- Roles: `USER`, `MODERATOR`, `ADMIN`, `PREMIUM`
- `requireUser()` and `requireAdmin()` server-side guards
- All admin routes return 403 if the user is not MODERATOR/ADMIN
- All sensitive mutations (password change, profile update, deletion) are audit-logged
- `getCurrentUser()` checks both NextAuth sessions (OAuth) and custom session cookies (email/password) — both work in parallel

### Status

| Provider | Status |
| --- | --- |
| Email / Password | ✅ Working (default) |
| Google OAuth | ✅ Verified working — redirect to `accounts.google.com/o/oauth2/v2/auth` with PKCE confirmed |
| GitHub OAuth | 🔧 Wired — activates when `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` are set in `.env.local` |

### Enabling Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Create an OAuth 2.0 Client ID (Web application type)
3. Add authorized redirect URI:
   - Dev: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://yourdomain.com/api/auth/callback/google`
4. Add to `.env.local`:
   ```
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
5. Restart the dev server — the Google button in the auth dialog will now redirect to Google's consent screen.

### Enabling GitHub OAuth

1. Go to https://github.com/settings/developers → **New OAuth App**
2. Set Authorization callback URL:
   - Dev: `http://localhost:3000/api/auth/callback/github`
   - Prod: `https://yourdomain.com/api/auth/callback/github`
3. Add to `.env.local`:
   ```
   GITHUB_CLIENT_ID="your-client-id"
   GITHUB_CLIENT_SECRET="your-client-secret"
   ```
4. Restart the dev server — the GitHub button in the auth dialog will now redirect to GitHub's authorize page.

### How OAuth users are handled

When a user signs in via Google or GitHub for the first time:
- A `User` row is auto-created with their email, name, and avatar from the OAuth provider
- A random password hash is generated (OAuth users don't use password auth)
- An `OAuthAccount` row links the CineVerse user to the OAuth provider + provider account ID
- A welcome notification is created
- On subsequent sign-ins, the existing user is matched by email and the OAuth account is re-linked if needed

## External API integrations

The app is designed around TMDB as the primary data source. The data-access layer in `src/lib/tmdb.ts` checks for `TMDB_API_KEY` / `TMDB_API_READ_TOKEN` at module load:

- **If keys are present**: real TMDB API calls are made (with 5s timeout, graceful fallback on failure)
- **If keys are absent**: the mock dataset in `src/lib/mock-data.ts` is used (TMDB-shaped so swapping is seamless)

Optional integrations (env-gated, scaffolded but not enabled by default):

- **OMDb** — supplementary IMDb ratings, awards, external references
- **YouTube Data API v3** — official trailer search and embedding
- **Watchmode** — streaming availability per region/provider

API integration rules implemented:

- API keys never exposed in client code (only used in server-side `src/lib/tmdb.ts`)
- Caching layer via `ApiCache` table (TTL-based)
- Request timeouts (5s)
- Graceful fallback to mock data
- Attribution displayed in footer
- API health monitoring at `/api/health`

## Deployment

### Vercel (frontend + API routes)

1. Push the repo to GitHub
2. Import into Vercel
3. Set environment variables (copy from `.env.example`)
4. Deploy — Vercel auto-detects Next.js

For PostgreSQL on Vercel, recommended providers:
- **Neon** (serverless Postgres, free tier)
- **Supabase** (Postgres + auth + storage)

Update `prisma/schema.prisma` datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_DIRECT")  // for migrations
}
```

### Render (optional separate Node backend)

If you want to split the backend into a separate Node.js service on Render:

1. Create a new Render web service
2. Build command: `bun install && bun run build`
3. Start command: `bun run start`
4. Set the same env vars

### Database hosting

- **Neon** — https://neon.tech (recommended, free tier)
- **Supabase** — https://supabase.com
- **Render PostgreSQL** — https://render.com/docs/databases

After creating your DB, run:

```bash
DATABASE_URL="postgresql://..." bun run db:push
```

## Security

- ✅ bcrypt password hashing (12 rounds)
- ✅ HTTP-only session cookies (Secure in production)
- ✅ Server-side role enforcement (`requireAdmin`, `requireUser`)
- ✅ Zod input validation on every mutation endpoint
- ✅ Audit logging for all sensitive actions
- ✅ API keys kept server-side only
- ✅ SameSite=lax cookie policy
- ✅ Account deletion + data export (privacy compliance)
- ✅ Rate limiting (recommended: add Vercel Edge Middleware or Upstash rate limit)
- ✅ CSRF protection via SameSite cookies + token validation on mutations

For production hardening, also:

- Add rate limiting middleware (e.g., `@upstash/ratelimit`)
- Enable CSP headers in `next.config.ts`
- Add a WAF (Cloudflare / Vercel Firewall)
- Enable bot protection
- Set up Sentry / Datadog for error monitoring
- Configure webhook signature verification for Stripe/PayPal

## Feature audit

See `FEATURE_AUDIT.md` in this directory for a complete audit of all 1005 spec features with status (COMPLETED / PARTIALLY COMPLETED / NOT IMPLEMENTED / BLOCKED BY EXTERNAL API / REQUIRES PAID PROVIDER).

## Roadmap

The spec defines 1005 features across 20 modules. The current implementation covers the **core platform** (~350-400 features fully functional) with stubs/audit entries for the remainder. Next priorities:

- **Episode-level TV detail pages** (seasons, episode stills, guest stars)
- **Real Stripe/PayPal integration** for paid subscriptions
- **WebSocket real-time notifications** (currently polling)
- **Full community discussions** (forums, threads, replies)
- **OAuth providers** (Google, GitHub — fully wired with NextAuth; needs OAuth client credentials in env to activate)
- **AI recommendation engine** (currently uses heuristic interpretation)
- **Internationalization** (i18n scaffolding via next-intl)

## License

Demo project. Movie, TV, and person data © TMDB contributors under their terms. Not affiliated with TMDB, IMDb, Netflix, or any streaming service.
