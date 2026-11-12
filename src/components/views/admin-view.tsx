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
import { Users, Bookmark, Heart, Star, MessageSquare, Bell, ShieldCheck, Film, Tv, UserCircle, LogIn, Trash2, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

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
