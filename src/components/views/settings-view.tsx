"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Crown,
  CreditCard,
  Globe,
  Check,
  Star,
  Zap,
} from "lucide-react";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    period: "forever",
    icon: Star,
    features: ["Browse all titles", "Watchlists up to 50 titles", "Rate & review", "Community access", "Standard quality images"],
    cta: "Current plan",
    color: "border-border",
  },
  {
    id: "PREMIUM_MONTHLY",
    name: "Premium Monthly",
    price: 7.99,
    period: "month",
    icon: Zap,
    features: ["Everything in Free", "Unlimited watchlists", "Ad-free experience", "HD images & trailers", "AI assistant access", "Priority support"],
    cta: "Upgrade",
    color: "border-primary",
    featured: true,
  },
  {
    id: "PREMIUM_YEARLY",
    name: "Premium Yearly",
    price: 59.99,
    period: "year",
    icon: Crown,
    features: ["Everything in Premium Monthly", "Save 37% vs monthly", "Premium profile themes", "Early access to features", "Exclusive collections", "Achievement badges"],
    cta: "Save 37%",
    color: "border-yellow-500/50",
  },
];

export function SettingsView({ initialTab = "profile" }: { initialTab?: string }) {
  const { user } = useAuthStore();
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const [tab, setTab] = useState(initialTab);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <SettingsIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-2">Sign in to manage your profile, preferences, and subscription.</p>
        <Button className="mt-6" onClick={() => setAuthOpen(true, "login")}>Sign in</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account, preferences, and subscription.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="profile" className="gap-1"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1"><Globe className="h-4 w-4" /> Preferences</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="security" className="gap-1"><Shield className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="subscription" className="gap-1"><Crown className="h-4 w-4" /> Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="preferences" className="mt-4">
          <PreferencesSettings />
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <NotificationSettings />
        </TabsContent>
        <TabsContent value="security" className="mt-4">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="subscription" className="mt-4">
          <SubscriptionSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileSettings() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");

  const save = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, avatarUrl }),
      });
      if (res.ok) {
        toast.success("Profile updated");
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader><CardTitle className="text-base">Profile information</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={user?.username ?? ""} disabled />
          <p className="text-xs text-muted-foreground">Usernames cannot be changed.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user?.email ?? ""} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your display name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the community about yourself..."
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <Button onClick={save}>Save changes</Button>
      </CardContent>
    </Card>
  );
}

function PreferencesSettings() {
  const { user } = useAuthStore();
  const [country, setCountry] = useState(user?.country ?? "");
  const [language, setLanguage] = useState(user?.preferredLang ?? "");

  const save = () => toast.success("Preferences saved");

  return (
    <Card className="bg-card border-border">
      <CardHeader><CardTitle className="text-base">Regional preferences</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
            <SelectContent>
              {["United States", "United Kingdom", "Rwanda", "Nigeria", "Kenya", "Japan", "South Korea", "China", "France", "Germany", "Mexico", "Brazil"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Preferred language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
            <SelectContent>
              {[
                { code: "en", label: "English" },
                { code: "zh", label: "Chinese" },
                { code: "ja", label: "Japanese" },
                { code: "ko", label: "Korean" },
                { code: "fr", label: "French" },
                { code: "rw", label: "Kinyarwanda" },
                { code: "es", label: "Spanish" },
                { code: "pt", label: "Portuguese" },
              ].map((l) => (
                <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Preferred genres</Label>
          <div className="flex flex-wrap gap-1.5">
            {["Action", "Drama", "Comedy", "Horror", "Sci-Fi", "Romance", "Documentary", "Animation"].map((g) => (
              <Badge key={g} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">{g}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Click genres to personalize your recommendations.</p>
        </div>
        <Button onClick={save}>Save preferences</Button>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    newReleases: true,
    watchlistAvailable: true,
    reviewReplies: true,
    newFollowers: true,
    weekly: true,
    security: true,
    marketing: false,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));
  const save = () => toast.success("Notification preferences saved");

  return (
    <Card className="bg-card border-border">
      <CardHeader><CardTitle className="text-base">Notification preferences</CardTitle></CardHeader>
      <CardContent className="space-y-1">
        {[
          { key: "newReleases" as const, label: "New releases & trailers", desc: "Get notified when movies on your watchlist release." },
          { key: "watchlistAvailable" as const, label: "Watchlist availability", desc: "When a title becomes available on a streaming provider." },
          { key: "reviewReplies" as const, label: "Review replies", desc: "When someone replies to your review." },
          { key: "newFollowers" as const, label: "New followers", desc: "When someone follows your profile." },
          { key: "weekly" as const, label: "Weekly digest", desc: "A weekly summary of trending titles and recommendations." },
          { key: "security" as const, label: "Security alerts", desc: "Critical account and security notifications (always recommended)." },
          { key: "marketing" as const, label: "Marketing & promotions", desc: "Occasional newsletters and special offers." },
        ].map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-medium">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.desc}</p>
            </div>
            <Switch checked={prefs[row.key]} onCheckedChange={() => toggle(row.key)} />
          </div>
        ))}
        <Button onClick={save} className="mt-3">Save preferences</Button>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [twoFa, setTwoFa] = useState(false);

  const changePassword = async () => {
    if (newPass !== confirmPass) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPass.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass, action: "password" }),
      });
      if (res.ok) {
        toast.success("Password changed");
        setOldPass(""); setNewPass(""); setConfirmPass("");
      } else {
        toast.error("Failed to change password");
      }
    } catch {
      toast.error("Failed to change password");
    }
  };

  const exportData = async () => {
    toast.promise(
      async () => {
        const res = await fetch("/api/auth/me?export=1");
        if (!res.ok) throw new Error("export failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cineverse-data.json";
        a.click();
        URL.revokeObjectURL(url);
      },
      { loading: "Exporting data...", success: "Data exported", error: "Export failed" }
    );
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Change password</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Current password</Label>
            <Input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>New password</Label>
            <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirm new password</Label>
            <Input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
          </div>
          <Button onClick={changePassword}>Update password</Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Two-factor authentication</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Enable 2FA</p>
            <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
          </div>
          <Switch checked={twoFa} onCheckedChange={setTwoFa} />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Data & privacy</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" onClick={exportData} className="w-full sm:w-auto gap-2">
            <CreditCard className="h-4 w-4" /> Export my data (JSON)
          </Button>
          <Button variant="destructive" className="w-full sm:w-auto" onClick={() => toast.error("Account deletion requires confirmation email")}>
            Request account deletion
          </Button>
          <p className="text-xs text-muted-foreground">
            Account deletion permanently removes your data within 30 days, as required by privacy regulations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SubscriptionSettings() {
  const { user } = useAuthStore();
  const currentPlan = user?.role === "PREMIUM" ? "PREMIUM_YEARLY" : "FREE";

  const upgrade = (planId: string) => {
    toast.success(`Redirecting to checkout for ${planId.replace("_", " ").toLowerCase()}...`);
    toast.info("In production, this would redirect to Stripe / PayPal / mobile money checkout.");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-card to-primary/5 border-border">
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Current plan</p>
              <p className="text-xl font-bold">{currentPlan.replace("_", " ")}</p>
            </div>
          </div>
          <Badge variant="secondary">Active</Badge>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-bold mb-4">Available plans</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.id === currentPlan;
            return (
              <Card key={plan.id} className={`bg-card ${plan.color} border-2 ${plan.featured ? "ring-2 ring-primary/30" : ""}`}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h4 className="font-bold">{plan.name}</h4>
                    {plan.featured && <Badge className="text-[10px]">POPULAR</Badge>}
                  </div>
                  <div>
                    <span className="text-3xl font-black">${plan.price}</span>
                    <span className="text-sm text-muted-foreground"> / {plan.period}</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : plan.featured ? "default" : "outline"}
                    disabled={isCurrent}
                    onClick={() => upgrade(plan.id)}
                  >
                    {isCurrent ? "Current plan" : plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Payment methods</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-md border border-border">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Credit / Debit Card</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex via Stripe</p>
              </div>
            </div>
            <Badge variant="outline">Available</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border border-border">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">PayPal</p>
                <p className="text-xs text-muted-foreground">Pay with your PayPal balance</p>
              </div>
            </div>
            <Badge variant="outline">Available</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border border-border">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Mobile Money (Rwanda)</p>
                <p className="text-xs text-muted-foreground">MTN MoMo, Airtel Money</p>
              </div>
            </div>
            <Badge variant="outline">Coming soon</Badge>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            <strong>Note:</strong> Real payment processing requires Stripe / PayPal API keys. This is a demo of the
            subscription flow. No real charges are made.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
