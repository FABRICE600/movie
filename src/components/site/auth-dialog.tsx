"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Film, Loader2, Eye, EyeOff, Github, Mail, Shield, Check, X } from "lucide-react";
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

interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  checks: { label: string; passed: boolean }[];
}

function evaluatePassword(p: string): PasswordStrength {
  const checks = [
    { label: "At least 8 characters", passed: p.length >= 8 },
    { label: "Contains uppercase letter", passed: /[A-Z]/.test(p) },
    { label: "Contains lowercase letter", passed: /[a-z]/.test(p) },
    { label: "Contains a number", passed: /[0-9]/.test(p) },
    { label: "Contains a special character", passed: /[^A-Za-z0-9]/.test(p) },
  ];
  const passed = checks.filter((c) => c.passed).length;
  const score = (passed === 0 ? 0 : passed <= 2 ? 1 : passed === 3 ? 2 : passed === 4 ? 3 : 4) as 0 | 1 | 2 | 3 | 4;
  const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];
  return { score, label: labels[score], color: colors[score], checks };
}

export function AuthDialog() {
  const open = useAppStore((s) => s.authOpen);
  const initialMode = useAppStore((s) => s.authMode);
  const setOpen = useAppStore((s) => s.setAuthOpen);
  const navigate = useAppStore((s) => s.navigate);
  const refresh = useAuthStore((s) => s.refresh);

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [regPassword, setRegPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

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

  const oauthLogin = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/",
      });
      if (result?.error) {
        const envHint = provider === "google"
          ? "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local, then restart the dev server."
          : "Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env.local, then restart the dev server.";
        toast.error(`${provider === "google" ? "Google" : "GitHub"} sign-in unavailable. ${envHint} See README.md for OAuth setup instructions.`);
      } else if (result?.ok) {
        toast.success(`Signed in with ${provider === "google" ? "Google" : "GitHub"}`);
        setOpen(false);
        await refresh();
        navigate("home");
      } else if (result?.url) {
        // NextAuth redirected (e.g., to provider's consent screen) — follow it
        window.location.href = result.url;
      } else {
        toast.info(`${provider === "google" ? "Google" : "GitHub"} OAuth is not configured yet. Add the required env vars to enable.`);
      }
    } catch (e) {
      toast.error("Network error during OAuth. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = evaluatePassword(regPassword);

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
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setForgotOpen(true)}
                  >
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

            <OAuthButtons onClick={oauthLogin} />

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
                <Input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                  style={{ marginTop: "-32px", marginLeft: "calc(100% - 32px)", position: "relative" }}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {regPassword.length > 0 && (
                <div className="rounded-md border border-border bg-muted/30 p-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password strength</span>
                    <span className="font-medium">{passwordStrength.label}</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-0.5">
                    {passwordStrength.checks.map((c) => (
                      <div key={c.label} className="flex items-center gap-1.5 text-[10px]">
                        {c.passed ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
                        <span className={c.passed ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

            <OAuthButtons onClick={oauthLogin} />
          </TabsContent>
        </Tabs>
      </DialogContent>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
    </Dialog>
  );
}

function OAuthButtons({ onClick }: { onClick: (provider: "google" | "github") => void }) {
  return (
    <>
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={() => onClick("google")} className="gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          Google
        </Button>
        <Button type="button" variant="outline" onClick={() => onClick("github")} className="gap-2">
          <Github className="h-4 w-4" />
          GitHub
        </Button>
      </div>
    </>
  );
}

function ForgotPasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset" | "done">("request");
  const [loading, setLoading] = useState(false);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Request failed");
        return;
      }
      if (data.demoToken) {
        // Demo flow: we got the token directly. Show the reset step.
        setToken(data.demoToken);
        setStep("reset");
        toast.info("Reset link generated. (In production this would be emailed.)");
      } else {
        // Email doesn't exist — flow ends with the same message
        setStep("done");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Reset failed");
        return;
      }
      toast.success("Password reset successfully. You can now sign in.");
      setStep("done");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(() => {
      setEmail(""); setToken(""); setNewPassword(""); setStep("request");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else onOpenChange(true); }}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Reset password
          </DialogTitle>
          <DialogDescription>
            {step === "request" && "Enter your email and we'll send you a reset link."}
            {step === "reset" && "Enter your new password."}
            {step === "done" && "Your password has been reset."}
          </DialogDescription>
        </DialogHeader>

        {step === "request" && (
          <form onSubmit={requestReset} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">Email</Label>
              <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send reset link
            </Button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={submitReset} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset password
            </Button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-3 text-center">
            <Shield className="h-10 w-10 mx-auto text-green-500" />
            <p className="text-sm text-muted-foreground">
              If your email matched an account, the password has been reset. You can now sign in with your new password.
            </p>
            <Button onClick={close} className="w-full">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
