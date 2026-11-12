"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Pin,
  Lock,
  ChevronLeft,
  Send,
  Plus,
  Trash2,
  Users,
  Flame,
} from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string;
  sortOrder: number;
}

interface ThreadUser {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
}

interface Thread {
  id: string;
  categoryId: string;
  userId: string;
  title: string;
  body: string;
  views: number;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
  user: ThreadUser;
  category: Category;
  _count?: { replies: number; likes: number };
}

interface Reply {
  id: string;
  threadId: string;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  user: ThreadUser;
}

export function CommunityView() {
  const { user } = useAuthStore();
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newThreadOpen, setNewThreadOpen] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ["discussion-categories"],
    queryFn: async () => {
      const res = await fetch("/api/discussions?categories=true");
      if (!res.ok) return { categories: [] };
      return res.json();
    },
  });

  const threadsQuery = useQuery({
    queryKey: ["discussion-threads", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory
        ? `/api/discussions?category=${selectedCategory}`
        : `/api/discussions`;
      const res = await fetch(url);
      if (!res.ok) return { threads: [] };
      return res.json();
    },
  });

  const threadQuery = useQuery({
    queryKey: ["discussion-thread", selectedThread],
    queryFn: async () => {
      const res = await fetch(`/api/discussions?thread=${selectedThread}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedThread,
  });

  const createThread = useMutation({
    mutationFn: async (data: { categorySlug: string; title: string; body: string }) => {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Thread posted");
      setNewThreadOpen(false);
      queryClient.invalidateQueries({ queryKey: ["discussion-threads"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to post"),
  });

  const createReply = useMutation({
    mutationFn: async (data: { threadId: string; body: string }) => {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Reply posted");
      queryClient.invalidateQueries({ queryKey: ["discussion-thread", selectedThread] });
      queryClient.invalidateQueries({ queryKey: ["discussion-threads"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const likeThread = useMutation({
    mutationFn: async (threadId: string) => {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussion-threads"] });
      queryClient.invalidateQueries({ queryKey: ["discussion-thread", selectedThread] });
    },
  });

  const categories: Category[] = categoriesQuery.data?.categories ?? [];
  const threads: Thread[] = threadsQuery.data?.threads ?? [];

  // Thread detail view
  if (selectedThread && threadQuery.data) {
    const thread = threadQuery.data.thread as Thread;
    const replies = (threadQuery.data.thread?.replies ?? []) as Reply[];
    return (
      <ThreadDetailView
        thread={thread}
        replies={replies}
        user={user}
        onBack={() => setSelectedThread(null)}
        onReply={(body) => createReply.mutate({ threadId: thread.id, body })}
        replying={createReply.isPending}
        onLike={() => likeThread.mutate(thread.id)}
        onRequireAuth={() => setAuthOpen(true, "login")}
        onDeleteReply={async (replyId) => {
          await fetch(`/api/discussions?replyId=${replyId}`, { method: "DELETE" });
          queryClient.invalidateQueries({ queryKey: ["discussion-thread", selectedThread] });
          toast.success("Reply deleted");
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <MessageSquare className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Community</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discuss movies, TV, recommendations, and industry news with fellow cinephiles.
          </p>
        </div>
        <Button
          onClick={() => {
            if (!user) return setAuthOpen(true, "login");
            setNewThreadOpen((v) => !v);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> New thread
        </Button>
      </div>

      {/* New thread form */}
      {newThreadOpen && (
        <NewThreadForm
          categories={categories}
          onSubmit={(data) => createThread.mutate(data)}
          submitting={createThread.isPending}
          onCancel={() => setNewThreadOpen(false)}
        />
      )}

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Categories sidebar */}
        <aside className="space-y-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              !selectedCategory ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            All threads
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === c.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              style={selectedCategory === c.slug ? {} : { borderLeft: `3px solid ${c.color}` }}
            >
              <div className="font-medium">{c.name}</div>
              {c.description && (
                <div className="text-xs text-muted-foreground line-clamp-1">{c.description}</div>
              )}
            </button>
          ))}
          <div className="pt-4 px-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {threads.length} active threads
            </div>
          </div>
        </aside>

        {/* Threads list */}
        <div className="space-y-3">
          {threadsQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading threads...</div>
          ) : threads.length === 0 ? (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="p-10 text-center">
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No threads yet. Be the first to start a conversation!</p>
                <Button
                  className="mt-4"
                  onClick={() => (user ? setNewThreadOpen(true) : setAuthOpen(true, "login"))}
                >
                  <Plus className="h-4 w-4 mr-2" /> Start the first thread
                </Button>
              </CardContent>
            </Card>
          ) : (
            threads.map((t) => (
              <Card
                key={t.id}
                className="bg-card border-border hover:border-primary/40 cursor-pointer transition-colors"
                onClick={() => setSelectedThread(t.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={t.user.avatarUrl ?? undefined} alt={t.user.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {t.user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {t.pinned && (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Pin className="h-3 w-3" /> Pinned
                          </Badge>
                        )}
                        {t.locked && (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Lock className="h-3 w-3" /> Locked
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{ color: t.category.color, borderColor: t.category.color }}
                        >
                          {t.category.name}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-base mt-1 line-clamp-1">{t.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.body}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                        <span>by <strong className="text-foreground">{t.user.username}</strong></span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {t._count?.replies ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> {t._count?.likes ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {t.views}
                        </span>
                        <span className="hidden sm:inline">· {new Date(t.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {threads.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Flame className="h-5 w-5 text-primary" />
            <p className="text-xs text-muted-foreground">
              Follow our community guidelines: be respectful, mark spoilers, no hate speech or spam.
              Moderators reserve the right to remove content that violates these rules.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NewThreadForm({
  categories,
  onSubmit,
  submitting,
  onCancel,
}: {
  categories: Category[];
  onSubmit: (data: { categorySlug: string; title: string; body: string }) => void;
  submitting: boolean;
  onCancel: () => void;
}) {
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5 space-y-3">
        <h3 className="font-bold">Start a new thread</h3>
        <div className="space-y-2">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategorySlug(c.slug)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                  categorySlug === c.slug ? "bg-primary border-primary text-primary-foreground" : "border-border hover:bg-muted"
                }`}
                style={categorySlug === c.slug ? {} : { borderColor: c.color }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="thread-title">Title</Label>
          <Input
            id="thread-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A short, descriptive title"
            maxLength={200}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thread-body">Body</Label>
          <Textarea
            id="thread-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts, ask a question, start a discussion..."
            rows={5}
            maxLength={5000}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button
            onClick={() => onSubmit({ categorySlug, title: title.trim(), body: body.trim() })}
            disabled={submitting || !title.trim() || !body.trim() || !categorySlug}
          >
            {submitting ? "Posting..." : "Post thread"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ThreadDetailView({
  thread,
  replies,
  user,
  onBack,
  onReply,
  replying,
  onLike,
  onRequireAuth,
  onDeleteReply,
}: {
  thread: Thread & { replies?: Reply[] };
  replies: Reply[];
  user: ReturnType<typeof useAuthStore.getState>["user"];
  onBack: () => void;
  onReply: (body: string) => void;
  replying: boolean;
  onLike: () => void;
  onRequireAuth: () => void;
  onDeleteReply: (id: string) => void;
}) {
  const [replyText, setReplyText] = useState("");
  const [localLiked, setLocalLiked] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!replyText.trim()) return;
    onReply(replyText.trim());
    setReplyText("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to threads
      </button>

      {/* Thread header */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {thread.pinned && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Pin className="h-3 w-3" /> Pinned
              </Badge>
            )}
            {thread.locked && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <Lock className="h-3 w-3" /> Locked
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]" style={{ color: thread.category.color }}>
              {thread.category.name}
            </Badge>
          </div>
          <h1 className="text-2xl font-black tracking-tight">{thread.title}</h1>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <Avatar className="h-7 w-7">
              <AvatarImage src={thread.user.avatarUrl ?? undefined} alt={thread.user.username} />
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                {thread.user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>by <strong className="text-foreground">{thread.user.username}</strong></span>
            <span>·</span>
            <span>{new Date(thread.createdAt).toLocaleString()}</span>
            {thread.updatedAt !== thread.createdAt && (
              <>
                <span>·</span>
                <span>edited {new Date(thread.updatedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
          <div className="mt-4 text-sm sm:text-base text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {thread.body}
          </div>
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!user) return onRequireAuth();
                setLocalLiked((v) => !v);
                onLike();
              }}
              className="gap-1.5"
            >
              <ThumbsUp className={`h-4 w-4 ${localLiked ? "fill-primary text-primary" : ""}`} />
              {localLiked ? "Liked" : "Like"}
            </Button>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {thread.views} views
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Reply form */}
      {!thread.locked ? (
        <form onSubmit={submit} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Send className="h-4 w-4" /> {user ? "Post a reply" : "Sign in to reply"}
          </h3>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={user ? "Write your reply..." : "You need an account to reply."}
            rows={3}
            maxLength={2000}
            disabled={!user}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={replying || !replyText.trim() || !user}>
              {replying ? "Posting..." : "Post reply"}
            </Button>
          </div>
        </form>
      ) : (
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" /> This thread is locked. No new replies can be posted.
          </CardContent>
        </Card>
      )}

      {/* Replies */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold">{replies.length} {replies.length === 1 ? "reply" : "replies"}</h3>
        {replies.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No replies yet. Be the first!</p>
        ) : (
          replies.map((r) => (
            <Card key={r.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={r.user.avatarUrl ?? undefined} alt={r.user.username} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {r.user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{r.user.username}</span>
                      <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{r.body}</p>
                    {user && (r.userId === user.id || user.role === "ADMIN" || user.role === "MODERATOR") && (
                      <button
                        onClick={() => onDeleteReply(r.id)}
                        className="text-xs text-destructive hover:underline mt-2 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
