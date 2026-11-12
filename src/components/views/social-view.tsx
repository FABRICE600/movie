"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Search, UserPlus, Check, Users, Sparkles, LogIn } from "lucide-react";

interface SimpleUser {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  bio: string | null;
  _count?: { followers?: number; reviews?: number };
}

export function SocialView() {
  const { user } = useAuthStore();
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Connect with fellow cinephiles</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign in to follow other movie lovers, see their activity, and discover new titles through their taste.
        </p>
        <Button className="mt-6" onClick={() => setAuthOpen(true, "login")}>
          <LogIn className="h-4 w-4 mr-2" /> Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Social</h1>
          <p className="text-sm text-muted-foreground mt-1">Follow cinephiles, discover titles through their taste.</p>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={(e) => { e.preventDefault(); }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by username or name..."
          className="pl-9"
        />
      </form>

      <Tabs defaultValue={searchQuery ? "search" : "suggestions"}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="suggestions" className="gap-1"><Sparkles className="h-4 w-4" /> Suggestions</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          {searchQuery && <TabsTrigger value="search">Search</TabsTrigger>}
        </TabsList>

        <TabsContent value="suggestions" className="mt-4">
          <UserList endpoint="/api/follow?action=suggestions" queryKey={["social", "suggestions"]} title="Suggested cinephiles" emptyMessage="No suggestions available right now." onFollowChange={() => {
            queryClient.invalidateQueries({ queryKey: ["social"] });
          }} />
        </TabsContent>

        <TabsContent value="following" className="mt-4">
          <UserList endpoint="/api/follow?action=following" queryKey={["social", "following"]} title="People you follow" emptyMessage="You're not following anyone yet. Check the Suggestions tab!" onFollowChange={() => {
            queryClient.invalidateQueries({ queryKey: ["social"] });
          }} />
        </TabsContent>

        <TabsContent value="followers" className="mt-4">
          <UserList endpoint="/api/follow?action=followers" queryKey={["social", "followers"]} title="Your followers" emptyMessage="No followers yet. Share your profile to grow your audience!" onFollowChange={() => {
            queryClient.invalidateQueries({ queryKey: ["social"] });
          }} />
        </TabsContent>

        {searchQuery && (
          <TabsContent value="search" className="mt-4">
            <UserList
              endpoint={`/api/follow?action=search&q=${encodeURIComponent(searchQuery)}`}
              queryKey={["social", "search", searchQuery]}
              title={`Results for "${searchQuery}"`}
              emptyMessage="No users match your search."
              onFollowChange={() => {
                queryClient.invalidateQueries({ queryKey: ["social"] });
              }}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function UserList({
  endpoint,
  queryKey,
  title,
  emptyMessage,
  onFollowChange,
}: {
  endpoint: string;
  queryKey: readonly unknown[];
  title: string;
  emptyMessage: string;
  onFollowChange: () => void;
}) {
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(endpoint);
      if (!res.ok) return { users: [] };
      const data = await res.json();
      return { users: (data.users ?? []) as SimpleUser[] };
    },
  });

  const users = query.data?.users ?? [];

  if (query.isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (users.length === 0) {
    return (
      <Card className="bg-card border-dashed border-border">
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">{title} · {users.length}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {users.map((u) => (
          <UserCard key={u.id} user={u} onFollowChange={onFollowChange} />
        ))}
      </div>
    </div>
  );
}

function UserCard({ user, onFollowChange }: { user: SimpleUser; onFollowChange: () => void }) {
  const navigate = useAppStore((s) => s.navigate);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action: following ? "unfollow" : "follow" }),
      });
      if (res.ok) {
        setFollowing((v) => !v);
        toast.success(following ? `Unfollowed ${user.username}` : `Following ${user.username}`);
        onFollowChange();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 flex items-start gap-3">
        <button onClick={() => navigate("profile", { userId: user.id })}>
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.username} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate("profile", { userId: user.id })}
              className="font-bold text-sm hover:text-primary"
            >
              {user.name ?? user.username}
            </button>
            {user.role !== "USER" && (
              <Badge variant="secondary" className="text-[10px]">{user.role}</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">@{user.username}</p>
          {user.bio && <p className="text-xs mt-1 line-clamp-2">{user.bio}</p>}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
            {typeof user._count?.followers === "number" && (
              <span>{user._count.followers} followers</span>
            )}
            {typeof user._count?.reviews === "number" && (
              <span>{user._count.reviews} reviews</span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant={following ? "outline" : "default"}
          onClick={toggleFollow}
          disabled={loading}
          className="gap-1 shrink-0"
        >
          {following ? <><Check className="h-3.5 w-3.5" /> Following</> : <><UserPlus className="h-3.5 w-3.5" /> Follow</>}
        </Button>
      </CardContent>
    </Card>
  );
}
