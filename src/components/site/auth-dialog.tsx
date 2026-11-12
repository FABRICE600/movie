"use client";

import { useEffect, useState } from "react";
import { Film, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export function AuthDialog() {
  const open = useAppStore((s) => s.authOpen);
  const initialMode = useAppStore((s) => s.authMode);
  const setOpen = useAppStore((s) => s.setAuthOpen);
  const navigate = useAppStore((s) => s.navigate);
  const refresh = useAuthStore((s) => s.refresh);

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, open]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const identifier = String(fd.get("identifier") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!identifier || !password) {
      toast.error("Enter your email/username and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Login failed");
        return;
      }
      toast.success(`Welcome back, ${data.user.name ?? data.user.username}!`);
      await refresh();
      setOpen(false);
      navigate("home");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const username = String(fd.get("username") ?? "").trim();
    const name = String(fd.get("name") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const country = String(fd.get("country") ?? "").trim();
    const agree = fd.get("agree");
    if (!email || !username || !password) {
      toast.error("Email, username, and password are required");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!agree) {
      toast.error("Please accept the terms to continue");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, name: name || undefined, password, country: country || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }
      toast.success(`Account created. Welcome, ${data.user.name ?? data.user.username}!`);
      await refresh();
      setOpen(false);
      navigate("home");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "demo@cineverse.demo", password: "demo12345" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Demo login failed");
        return;
      }
      toast.success("Signed in as demo viewer");
      await refresh();
      setOpen(false);
      navigate("home");
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "admin@cineverse.demo", password: "admin12345" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Admin login failed");
        return;
      }
      toast.success("Signed in as admin");
      await refresh();
      setOpen(false);
      navigate("admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <Film className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-black">
              Cine<span className="text-primary">Verse</span>
            </span>
          </div>
          <DialogTitle>{mode === "login" ? "Welcome back" : "Create your account"}</DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Sign in to sync your watchlist, ratings, and reviews across devices."
              : "Join CineVerse to build watchlists, follow actors, and rate the films you love."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign in</TabsTrigger>
            <TabsTrigger value="register">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="identifier">Email or username</Label>
                <Input id="identifier" name="identifier" placeholder="you@example.com" autoComplete="username" required />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => toast.info("Password reset is available in production builds.")}>
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={fillDemo} disabled={loading}>
                Demo viewer
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={fillAdmin} disabled={loading}>
                Demo admin
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" placeholder="cinemafan" autoComplete="username" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Display name</Label>
                  <Input id="name" name="name" placeholder="Cinema Fan" autoComplete="name" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type={showPwd ? "text" : "password"} placeholder="At least 8 characters" autoComplete="new-password" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country (optional)</Label>
                <Input id="country" name="country" placeholder="Rwanda" autoComplete="country-name" />
              </div>
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <Checkbox name="agree" defaultChecked={false} className="mt-0.5" />
                <span>I agree to the Terms and Privacy Policy.</span>
              </label>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
