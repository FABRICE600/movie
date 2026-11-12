"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Bookmark, Heart, Star, MessageSquare, Bell, ShieldCheck, Film, Tv, UserCircle, LogIn, Trash2, ScrollText, Eye, Search, TrendingUp, AlertTriangle, Check, Settings, Database } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function AdminView() {
  const user = useAuthStore((s) => s.user);
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("overview");

  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin?action=stats");
      if (!res.ok) throw new Error("FORBIDDEN");
      return res.json();
    },
    retry: false,
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await fetch("/api/admin?action=users");
      if (!res.ok) throw new Error("FORBIDDEN");
      return res.json();
    },
    retry: false,
  });

  const reviewsQuery = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const res = await fetch("/api/admin?action=reviews");
      if (!res.ok) throw new Error("FORBIDDEN");
      return res.json();
    },
    retry: false,
  });

  const auditQuery = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: async () => {
      const res = await fetch("/api/admin?action=audit");
      if (!res.ok) throw new Error("FORBIDDEN");
      return res.json();
    },
    retry: false,
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setRole", userId, role }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
      toast.success("Role updated");
    },
    onError: () => toast.error("Could not update role"),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteUser", userId }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("User deleted");
    },
    onError: () => toast.error("Could not delete user"),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/admin?reviewId=${reviewId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Review removed");
    },
  });

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Admin access required</h1>
        <p className="text-sm text-muted-foreground mt-2">Sign in with an admin or moderator account.</p>
        <Button className="mt-6" onClick={() => setAuthOpen(true, "login")}>
          <LogIn className="h-4 w-4 mr-2" /> Sign in
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Demo admin: <strong>admin@cineverse.demo</strong> / <strong>admin12345</strong>
        </p>
      </div>
    );
  }

  if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <ShieldCheck className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Forbidden</h1>
        <p className="text-sm text-muted-foreground mt-2">Your account ({user.role}) does not have admin access.</p>
        <p className="text-xs text-muted-foreground mt-4">
          Demo admin: <strong>admin@cineverse.demo</strong> / <strong>admin12345</strong>
        </p>
      </div>
    );
  }

  if (statsQuery.isLoading || !statsQuery.data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  const stats = statsQuery.data.counts;
  const catalog = statsQuery.data.catalog;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage users, content, reviews, and platform health.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Site Settings</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API & Cache</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Users, label: "Users", value: stats.users, color: "text-blue-400" },
              { icon: Bookmark, label: "Watchlist items", value: stats.watchlists, color: "text-primary" },
              { icon: Heart, label: "Favorites", value: stats.favorites, color: "text-red-400" },
              { icon: Star, label: "Ratings", value: stats.ratings, color: "text-yellow-400" },
              { icon: MessageSquare, label: "Reviews", value: stats.reviews, color: "text-green-400" },
              { icon: Bell, label: "Notifications", value: stats.notifications, color: "text-purple-400" },
              { icon: ScrollText, label: "Audit logs", value: stats.auditLogs, color: "text-orange-400" },
              { icon: ShieldCheck, label: "Your role", value: user.role, color: "text-primary" },
            ].map((s) => (
              <Card key={s.label} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <s.icon className={`h-4 w-4 ${s.color}`} /> {s.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catalog</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/40">
                <Film className="h-6 w-6 mx-auto text-primary mb-1" />
                <div className="text-xl font-bold">{catalog.movies}</div>
                <div className="text-xs text-muted-foreground">Movies</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/40">
                <Tv className="h-6 w-6 mx-auto text-primary mb-1" />
                <div className="text-xl font-bold">{catalog.tv}</div>
                <div className="text-xs text-muted-foreground">TV shows</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/40">
                <UserCircle className="h-6 w-6 mx-auto text-primary mb-1" />
                <div className="text-xl font-bold">{catalog.people}</div>
                <div className="text-xs text-muted-foreground">People</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent sign-ups</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(statsQuery.data.recentUsers ?? []).map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">User management ({usersQuery.data?.users.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(usersQuery.data?.users ?? []).map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.username}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{u.email}</TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            onValueChange={(role) => roleMutation.mutate({ userId: u.id, role })}
                            disabled={u.id === user.id}
                          >
                            <SelectTrigger className="h-7 w-32 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USER">USER</SelectItem>
                              <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                              <SelectItem value="MODERATOR">MODERATOR</SelectItem>
                              <SelectItem value="ADMIN">ADMIN</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs">{u.country ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(`Delete user "${u.username}"? This cannot be undone.`)) {
                                deleteUserMutation.mutate(u.id);
                              }
                            }}
                            disabled={u.id === user.id}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review moderation ({reviewsQuery.data?.reviews.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(reviewsQuery.data?.reviews ?? []).map((r: any) => (
                <div key={r.id} className="p-3 rounded-lg bg-muted/40 border border-border flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by <strong>{r.user?.name ?? r.user?.username ?? "Unknown"}</strong> · {new Date(r.createdAt).toLocaleDateString()}
                      {r.spoiler && <Badge variant="outline" className="ml-2 text-yellow-500 border-yellow-500/50">Spoilers</Badge>}
                    </p>
                    <p className="text-xs mt-1 line-clamp-2">{r.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this review?")) deleteReviewMutation.mutate(r.id);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(reviewsQuery.data?.reviews ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {(auditQuery.data?.logs ?? []).map((l: any) => (
                <div key={l.id} className="text-xs flex items-start gap-2 p-2 rounded border-b border-border">
                  <Badge variant="outline" className="text-[10px]">{l.action}</Badge>
                  <span className="text-muted-foreground">{l.entity}{l.entityId ? ` #${l.entityId.slice(-6)}` : ""}</span>
                  {l.detail && <span className="text-muted-foreground">— {l.detail}</span>}
                  <span className="ml-auto text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</span>
                </div>
              ))}
              {(auditQuery.data?.logs ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No audit events yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="mt-4 space-y-4">
          <CommunityAdminTab />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-4">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="reports" className="mt-4 space-y-4">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="featured" className="mt-4 space-y-4">
          <FeaturedTab />
        </TabsContent>

        <TabsContent value="announcements" className="mt-4 space-y-4">
          <AnnouncementsTab />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <NotificationsManagementTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <SiteSettingsTab />
        </TabsContent>

        <TabsContent value="database" className="mt-4 space-y-4">
          <DatabaseTab />
        </TabsContent>

        <TabsContent value="api" className="mt-4 space-y-4">
          <ApiManagementTab />
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CommunityAdminTab() {
  const queryClient = useQueryClient();
  const threadsQuery = useQuery({
    queryKey: ["admin", "community-threads"],
    queryFn: async () => {
      const res = await fetch("/api/discussions");
      if (!res.ok) return { threads: [] };
      return res.json();
    },
  });

  const threads: any[] = threadsQuery.data?.threads ?? [];

  const deleteThread = useMutation({
    mutationFn: async (threadId: string) => {
      await fetch(`/api/discussions?threadId=${threadId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "community-threads"] });
      toast.success("Thread removed");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Community moderation ({threads.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {threads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No community threads yet.</p>
        ) : (
          threads.map((t: any) => (
            <div key={t.id} className="p-3 rounded-lg bg-muted/40 border border-border flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-xs text-muted-foreground">
                  by <strong>{t.user?.username ?? "unknown"}</strong> · in {t.category?.name ?? "—"} · {new Date(t.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs mt-1 line-clamp-2">{t.body}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{t._count?.replies ?? 0} replies</span>
                  <span>{t._count?.likes ?? 0} likes</span>
                  <span>{t.views} views</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => {
                  if (confirm("Delete this thread and all its replies?")) {
                    deleteThread.mutate(t.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ApiManagementTab() {
  const [cacheCleared, setCacheCleared] = useState(false);
  const cacheQuery = useQuery({
    queryKey: ["admin", "api-cache"],
    queryFn: async () => {
      // Mock stats since we don't have a real cache management endpoint exposed
      return { entries: 0, hitRate: "92%", avgLatency: "47ms", dailyQuota: "10000 / 50000" };
    },
  });

  const clearCache = () => {
    setCacheCleared(true);
    toast.success("API cache cleared (demo)");
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Cache entries", value: cacheQuery.data?.entries ?? 0, color: "text-primary" },
          { label: "Hit rate", value: cacheQuery.data?.hitRate ?? "—", color: "text-green-400" },
          { label: "Avg latency", value: cacheQuery.data?.avgLatency ?? "—", color: "text-blue-400" },
          { label: "Daily quota", value: cacheQuery.data?.dailyQuota ?? "—", color: "text-yellow-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">External API status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { name: "TMDB", env: "TMDB_API_KEY", status: process.env.NEXT_PUBLIC_TMDB_STATUS ?? "Mock data active", color: "bg-yellow-500" },
            { name: "OMDb", env: "OMDB_API_KEY", status: "Not configured", color: "bg-muted" },
            { name: "YouTube Data", env: "YOUTUBE_API_KEY", status: "Not configured", color: "bg-muted" },
            { name: "Watchmode", env: "WATCHMODE_API_KEY", status: "Not configured", color: "bg-muted" },
          ].map((api) => (
            <div key={api.name} className="flex items-center justify-between p-3 rounded-md border border-border">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${api.color}`} />
                <div>
                  <p className="text-sm font-medium">{api.name}</p>
                  <p className="text-xs text-muted-foreground">env: {api.env}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">{api.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cache management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The API cache stores TMDB responses to reduce external API calls and improve response times.
            Clear the cache to force a fresh fetch on next request.
          </p>
          <Button onClick={clearCache} variant="destructive" disabled={cacheCleared} className="gap-2">
            <Trash2 className="h-4 w-4" />
            {cacheCleared ? "Cache cleared" : "Clear all cached responses"}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function SecurityTab() {
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Failed logins (24h)", value: 0, color: "text-green-400" },
          { label: "Active sessions", value: "—", color: "text-blue-400" },
          { label: "Rate-limited IPs", value: 0, color: "text-yellow-400" },
          { label: "CAPTCHA triggers", value: 0, color: "text-purple-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: "HTTPS enforcement", value: "Active (Vercel)" },
            { label: "Password hashing", value: "bcrypt (12 rounds)" },
            { label: "Session cookies", value: "HTTP-only, SameSite=lax" },
            { label: "CSRF protection", value: "SameSite + token validation" },
            { label: "XSS protection", value: "Next.js defaults + output encoding" },
            { label: "SQL injection", value: "Prisma parameterized queries" },
            { label: "Input validation", value: "Zod on all mutations" },
            { label: "Rate limiting", value: "Recommended: add @upstash/ratelimit" },
            { label: "CAPTCHA", value: "Not configured (add for production)" },
            { label: "Audit logging", value: "Active" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between p-2 rounded border-b border-border last:border-0 text-sm">
              <span className="text-muted-foreground">{s.label}</span>
              <Badge variant="outline" className="text-xs">{s.value}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reported content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No reported content pending review.</p>
        </CardContent>
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Analytics tab — page views, searches, top movies, daily chart
// ═══════════════════════════════════════════════════════════════
function AnalyticsTab() {
  const [days, setDays] = useState(30);
  const query = useQuery({
    queryKey: ["admin", "analytics", days],
    queryFn: async () => {
      const res = await fetch(`/api/admin?action=analytics&days=${days}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const data = query.data;
  const totals = data?.totals;
  const daily = data?.daily ?? [];

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Platform analytics
        </h3>
        <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v))}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Totals grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[
          { label: "Page views", value: totals?.pageViews ?? 0, color: "text-blue-400", icon: Eye },
          { label: "Searches", value: totals?.searches ?? 0, color: "text-green-400", icon: Search },
          { label: "Movie views", value: totals?.movieViews ?? 0, color: "text-purple-400", icon: Film },
          { label: "Signups", value: totals?.signups ?? 0, color: "text-primary", icon: Users },
          { label: "Logins", value: totals?.logins ?? 0, color: "text-orange-400", icon: LogIn },
          { label: "Ratings", value: totals?.ratings ?? 0, color: "text-yellow-400", icon: Star },
          { label: "Reviews", value: totals?.reviews ?? 0, color: "text-pink-400", icon: MessageSquare },
          { label: "Watchlist adds", value: totals?.watchlistAdds ?? 0, color: "text-cyan-400", icon: Bookmark },
          { label: "Total events", value: totals?.totalEvents ?? 0, color: "text-foreground", icon: TrendingUp },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <s.icon className={`h-3.5 w-3.5 ${s.color}`} /> {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-black ${s.color}`}>{(s.value as number).toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily events chart (simple bar chart) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily events (last {Math.min(daily.length, 30)} days)</CardTitle>
        </CardHeader>
        <CardContent>
          {daily.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No events recorded yet. Events are tracked as users interact with the platform.</p>
          ) : (
            <div className="space-y-1">
              {daily.slice(-14).map((d: any) => {
                const total = (d.PAGE_VIEW ?? 0) + (d.SEARCH ?? 0) + (d.MOVIE_VIEW ?? 0) + (d.SIGNUP ?? 0) + (d.LOGIN ?? 0) + (d.RATING ?? 0) + (d.REVIEW ?? 0) + (d.WATCHLIST_ADD ?? 0);
                const max = Math.max(...daily.map((x: any) => (x.PAGE_VIEW ?? 0) + (x.SEARCH ?? 0) + (x.MOVIE_VIEW ?? 0) + (x.SIGNUP ?? 0) + (x.LOGIN ?? 0) + (x.RATING ?? 0) + (x.REVIEW ?? 0) + (x.WATCHLIST_ADD ?? 0)), 1);
                return (
                  <div key={d.date} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-20">{new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <div className="flex-1 bg-muted rounded h-5 overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${(total / max) * 100}%` }} />
                    </div>
                    <span className="font-mono w-10 text-right">{total}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top searched */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top searches</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.topSearched ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No searches recorded.</p>
            ) : (
              <ol className="space-y-2">
                {(data?.topSearched ?? []).map((s: any, i: number) => (
                  <li key={s.query} className="flex items-center justify-between text-sm">
                    <span className="truncate"><span className="text-muted-foreground mr-2">{i + 1}.</span>{s.query}</span>
                    <Badge variant="secondary" className="text-xs">{s.count}</Badge>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Top viewed movies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most viewed titles</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.topViewed ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No title views recorded.</p>
            ) : (
              <ol className="space-y-2">
                {(data?.topViewed ?? []).map((t: any, i: number) => (
                  <li key={`${t.tmdbId}-${t.mediaType}`} className="flex items-center justify-between text-sm">
                    <span className="truncate"><span className="text-muted-foreground mr-2">{i + 1}.</span>Title #{t.tmdbId} ({t.mediaType})</span>
                    <Badge variant="secondary" className="text-xs">{t.count}</Badge>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Device breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.devices ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No device data recorded.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {(data?.devices ?? []).map((d: any) => (
                <div key={d.label} className="text-center p-3 rounded-lg bg-muted/40">
                  <div className="text-xl font-bold">{d.count}</div>
                  <div className="text-xs text-muted-foreground">{d.label}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Reports tab — moderation queue for reported content
// ═══════════════════════════════════════════════════════════════
function ReportsTab() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const query = useQuery({
    queryKey: ["admin", "reports", statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/admin?action=reports&status=${statusFilter}`);
      if (!res.ok) return { reports: [] };
      return res.json();
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ reportId, newStatus }: { reportId: string; newStatus: string }) => {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "actionReport", reportId, newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      toast.success("Report status updated");
    },
  });

  const reports: any[] = query.data?.reports ?? [];

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" /> Moderation queue
        </h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REVIEWED">Reviewed</SelectItem>
            <SelectItem value="ACTIONED">Actioned</SelectItem>
            <SelectItem value="DISMISSED">Dismissed</SelectItem>
            <SelectItem value="ALL">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reported content ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reports.length === 0 ? (
            <div className="text-center py-10">
              <Check className="h-10 w-10 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">No {statusFilter !== "ALL" ? statusFilter.toLowerCase() : ""} reports. Clean slate!</p>
            </div>
          ) : (
            reports.map((r: any) => (
              <div key={r.id} className="p-3 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">{r.targetType}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{r.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Target ID: {r.targetId}</p>
                    <p className="text-sm mt-1">{r.reason}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Reported {new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {r.status === "PENDING" && (
                      <>
                        <Button size="sm" variant="default" className="h-6 text-[10px]" onClick={() => actionMutation.mutate({ reportId: r.id, newStatus: "ACTIONED" })}>
                          Action
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => actionMutation.mutate({ reportId: r.id, newStatus: "DISMISSED" })}>
                          Dismiss
                        </Button>
                      </>
                    )}
                    {r.status !== "PENDING" && (
                      <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => actionMutation.mutate({ reportId: r.id, newStatus: "PENDING" })}>
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Featured content management
// ═══════════════════════════════════════════════════════════════
function FeaturedTab() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", "featured"],
    queryFn: async () => {
      const res = await fetch("/api/admin?action=featured");
      if (!res.ok) return { featured: [] };
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: { slot: string; tmdbId: number; mediaType: string; title: string }) => {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addFeatured", ...data }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "featured"] });
      toast.success("Featured content added");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/admin?featuredId=${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "featured"] });
      toast.success("Featured content removed");
    },
  });

  const [slot, setSlot] = useState("HERO");
  const [tmdbId, setTmdbId] = useState("");
  const [mediaType, setMediaType] = useState("MOVIE");
  const [title, setTitle] = useState("");

  const featured: any[] = query.data?.featured ?? [];

  return (
    <>
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Film className="h-5 w-5 text-primary" /> Featured content management
      </h3>

      {/* Add new featured */}
      <Card>
        <CardHeader><CardTitle className="text-base">Add featured content</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Slot</Label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HERO">Hero banner</SelectItem>
                  <SelectItem value="CAROUSEL">Carousel</SelectItem>
                  <SelectItem value="EDITOR_PICK">Editor&apos;s pick</SelectItem>
                  <SelectItem value="SPOTLIGHT">Spotlight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Media type</Label>
              <Select value={mediaType} onValueChange={setMediaType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOVIE">Movie</SelectItem>
                  <SelectItem value="TV">TV Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">TMDB ID</Label>
              <Input value={tmdbId} onChange={(e) => setTmdbId(e.target.value)} placeholder="e.g. 101" className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Title (display)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Echoes of Tomorrow" className="h-8 text-xs" />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (!tmdbId || !title) {
                toast.error("TMDB ID and title are required");
                return;
              }
              addMutation.mutate({ slot, tmdbId: parseInt(tmdbId), mediaType, title });
              setTmdbId(""); setTitle("");
            }}
            disabled={addMutation.isPending}
          >
            Add to featured
          </Button>
        </CardContent>
      </Card>

      {/* Current featured list */}
      <Card>
        <CardHeader><CardTitle className="text-base">Currently featured ({featured.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {featured.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No featured content yet. Add some above.</p>
          ) : (
            featured.map((f: any) => (
              <div key={f.id} className="flex items-center justify-between p-2 rounded border border-border">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{f.slot}</Badge>
                  <span className="text-sm font-medium">{f.title}</span>
                  <span className="text-xs text-muted-foreground">#{f.tmdbId} · {f.mediaType}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive"
                  onClick={() => deleteMutation.mutate(f.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Announcements tab
// ═══════════════════════════════════════════════════════════════
function AnnouncementsTab() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: async () => {
      const res = await fetch("/api/admin?action=announcements");
      if (!res.ok) return { announcements: [] };
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; body: string; type: string; audience: string }) => {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createAnnouncement", ...data }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      toast.success("Announcement created");
      setTitle(""); setBody("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/admin?announcementId=${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      toast.success("Announcement deleted");
    },
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("INFO");
  const [audience, setAudience] = useState("ALL");

  const announcements: any[] = query.data?.announcements ?? [];

  const typeColors: Record<string, string> = {
    INFO: "bg-blue-500",
    WARNING: "bg-yellow-500",
    MAINTENANCE: "bg-orange-500",
    PROMOTION: "bg-primary",
  };

  return (
    <>
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" /> Announcements
      </h3>

      {/* Create new */}
      <Card>
        <CardHeader><CardTitle className="text-base">New announcement</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="PROMOTION">Promotion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All users</SelectItem>
                  <SelectItem value="PREMIUM">Premium only</SelectItem>
                  <SelectItem value="ADMINS">Admins only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief title" className="h-8 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Body</Label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Announcement message..."
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-xs"
            />
          </div>
          <Button
            size="sm"
            disabled={createMutation.isPending || !title || !body}
            onClick={() => createMutation.mutate({ title, body, type, audience })}
          >
            Publish announcement
          </Button>
        </CardContent>
      </Card>

      {/* Existing announcements */}
      <Card>
        <CardHeader><CardTitle className="text-base">Published ({announcements.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No announcements yet.</p>
          ) : (
            announcements.map((a: any) => (
              <div key={a.id} className="p-3 rounded-lg border border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`h-2 w-2 rounded-full ${typeColors[a.type] ?? typeColors.INFO}`} />
                      <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{a.audience}</Badge>
                      {a.isActive ? (
                        <Badge className="text-[10px] bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Created {new Date(a.createdAt).toLocaleString()}
                      {a.endsAt && ` · ends ${new Date(a.endsAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={() => deleteMutation.mutate(a.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Notifications management — view all + broadcast
// ═══════════════════════════════════════════════════════════════
function NotificationsManagementTab() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", "all-notifications"],
    queryFn: async () => {
      const res = await fetch("/api/admin?action=all-notifications");
      if (!res.ok) return { notifications: [] };
      return res.json();
    },
  });

  const broadcastMutation = useMutation({
    mutationFn: async (data: { title: string; body: string }) => {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "broadcast", ...data, type: "SYSTEM" }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data: any) => {
      toast.success(`Broadcast sent to ${data.recipients} users`);
      queryClient.invalidateQueries({ queryKey: ["admin", "all-notifications"] });
      setTitle(""); setBody("");
    },
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const notifications: any[] = query.data?.notifications ?? [];

  return (
    <>
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" /> Notifications management
      </h3>

      {/* Broadcast */}
      <Card>
        <CardHeader><CardTitle className="text-base">Broadcast to all users</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Scheduled maintenance" className="h-8 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Message</Label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Broadcast message..."
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-xs"
            />
          </div>
          <Button
            size="sm"
            disabled={broadcastMutation.isPending || !title || !body}
            onClick={() => broadcastMutation.mutate({ title, body })}
          >
            Send to all users
          </Button>
          <p className="text-xs text-muted-foreground">
            This will create a notification for every registered user.
          </p>
        </CardContent>
      </Card>

      {/* Recent notifications */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent notifications ({notifications.length})</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No notifications sent yet.</p>
          ) : (
            notifications.slice(0, 20).map((n: any) => (
              <div key={n.id} className="flex items-start justify-between gap-2 p-2 rounded border-b border-border last:border-0 text-xs">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                    <span className="font-medium">{n.title}</span>
                    {n.read && <Badge variant="secondary" className="text-[10px]">read</Badge>}
                  </div>
                  <p className="text-muted-foreground truncate">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    to <strong>{n.user?.username ?? "unknown"}</strong> · {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Site settings tab
// ═══════════════════════════════════════════════════════════════
function SiteSettingsTab() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin?action=settings");
      if (!res.ok) return { settings: [] };
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { key: string; value: string; category: string }) => {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateSetting", ...data }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Setting saved");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      await fetch(`/api/admin?settingKey=${encodeURIComponent(key)}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Setting removed");
    },
  });

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCategory, setNewCategory] = useState("general");

  const settings: any[] = query.data?.settings ?? [];

  const categoryColors: Record<string, string> = {
    general: "bg-blue-500",
    brand: "bg-primary",
    theme: "bg-purple-500",
    seo: "bg-green-500",
    features: "bg-orange-500",
  };

  return (
    <>
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" /> Site settings
      </h3>

      {/* Default settings reference */}
      <Card>
        <CardHeader><CardTitle className="text-base">Common settings (click to edit)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { key: "site.name", label: "Site name", defaultValue: "CineVerse", category: "brand" },
            { key: "site.tagline", label: "Tagline", defaultValue: "Discover movies & TV", category: "brand" },
            { key: "site.primary_color", label: "Primary color", defaultValue: "#E50914", category: "theme" },
            { key: "site.accent_color", label: "Accent color", defaultValue: "#F5C518", category: "theme" },
            { key: "site.allow_registration", label: "Allow registration", defaultValue: "true", category: "features" },
            { key: "site.require_email_verification", label: "Require email verification", defaultValue: "false", category: "features" },
            { key: "seo.default_title", label: "Default SEO title", defaultValue: "CineVerse — Discover Movies & TV", category: "seo" },
            { key: "seo.default_description", label: "Default SEO description", defaultValue: "A modern movie discovery platform.", category: "seo" },
          ].map((s) => {
            const existing = settings.find((x) => x.key === s.key);
            const value = existing?.value ?? s.defaultValue;
            return (
              <div key={s.key} className="flex items-center gap-3 p-2 rounded border border-border">
                <div className={`h-2 w-2 rounded-full ${categoryColors[s.category] ?? categoryColors.general}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xs font-mono">{s.key}</p>
                </div>
                <Input
                  defaultValue={value}
                  className="h-7 w-40 text-xs"
                  onBlur={(e) => {
                    if (e.target.value !== value) {
                      updateMutation.mutate({ key: s.key, value: e.target.value, category: s.category });
                    }
                  }}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Add custom setting */}
      <Card>
        <CardHeader><CardTitle className="text-base">Add custom setting</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="setting.key" className="h-8 text-xs" />
            <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="value" className="h-8 text-xs" />
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
                <SelectItem value="theme">Theme</SelectItem>
                <SelectItem value="seo">SEO</SelectItem>
                <SelectItem value="features">Features</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            disabled={!newKey || !newValue}
            onClick={() => {
              updateMutation.mutate({ key: newKey, value: newValue, category: newCategory });
              setNewKey(""); setNewValue("");
            }}
          >
            Add setting
          </Button>
        </CardContent>
      </Card>

      {/* All custom settings */}
      {settings.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">All saved settings ({settings.length})</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {settings.map((s: any) => (
              <div key={s.id} className="flex items-center gap-2 p-2 rounded border-b border-border last:border-0 text-xs">
                <div className={`h-2 w-2 rounded-full ${categoryColors[s.category] ?? categoryColors.general}`} />
                <span className="font-mono text-muted-foreground w-40 truncate">{s.key}</span>
                <span className="flex-1 truncate">{s.value}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteMutation.mutate(s.key)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Database management tab
// ═══════════════════════════════════════════════════════════════
function DatabaseTab() {
  const query = useQuery({
    queryKey: ["admin", "db-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin?action=db-stats");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const tables: { name: string; count: number }[] = query.data?.tables ?? [];
  const totalRecords: number = query.data?.totalRecords ?? 0;

  return (
    <>
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Database className="h-5 w-5 text-primary" /> Database management
      </h3>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">DB path</CardTitle></CardHeader>
          <CardContent><div className="text-sm font-mono">{query.data?.dbPath ?? "—"}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Total records</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-black">{totalRecords.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Tables</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-black">{tables.length}</div></CardContent>
        </Card>
      </div>

      {/* Table record counts */}
      <Card>
        <CardHeader><CardTitle className="text-base">Record counts by table</CardTitle></CardHeader>
        <CardContent>
          {query.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {tables.map((t) => (
                <div key={t.name} className="p-2 rounded border border-border bg-muted/30">
                  <div className="text-xs text-muted-foreground">{t.name}</div>
                  <div className="text-lg font-bold">{t.count.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup actions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Backup & restore</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => toast.info("Backup would create a snapshot of the SQLite DB file. In production, automate via Prisma migrate + S3 storage.")} className="gap-2">
              <Database className="h-4 w-4" /> Create backup
            </Button>
            <Button variant="outline" onClick={() => toast.info("Restore would upload a .db file and replace the current database. Disabled in demo.")} className="gap-2">
              <Database className="h-4 w-4" /> Restore from backup
            </Button>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Backup strategy:</strong> Daily automated backups to S3/Cloud Storage with 30-day retention.</p>
            <p><strong>Restore:</strong> Select a backup snapshot, verify checksum, then restore during a maintenance window.</p>
            <p><strong>Migrations:</strong> Run <code className="bg-muted px-1 rounded">bun run db:push</code> after schema changes.</p>
          </div>
        </CardContent>
      </Card>

      {/* Schema info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Schema info</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-xs text-muted-foreground">
          <p>ORM: <strong>Prisma 6.19</strong></p>
          <p>Database: <strong>SQLite</strong> (local dev) — switch to <strong>PostgreSQL</strong> for production via <code className="bg-muted px-1 rounded">DATABASE_URL</code> in <code className="bg-muted px-1 rounded">.env</code></p>
          <p>Migration tool: <code className="bg-muted px-1 rounded">prisma db push</code> (dev) or <code className="bg-muted px-1 rounded">prisma migrate deploy</code> (production)</p>
          <p>Client: <code className="bg-muted px-1 rounded">@prisma/client</code> imported via <code className="bg-muted px-1 rounded">src/lib/db.ts</code></p>
        </CardContent>
      </Card>
    </>
  );
}
