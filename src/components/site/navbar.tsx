"use client";

import { useEffect, useState } from "react";
import { Search, Menu, X, Sun, Moon, Bell, Film, LogOut, User, LayoutDashboard, Heart, Bookmark, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAppStore, type ViewName } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

interface NavItem {
  label: string;
  view: ViewName;
  params?: Record<string, string | number>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", view: "home" },
  { label: "Discover", view: "discover" },
  { label: "Movies", view: "movies" },
  { label: "TV Shows", view: "tv" },
  { label: "People", view: "people" },
  { label: "Genres", view: "genres" },
  { label: "Trending", view: "trending" },
  { label: "Top Rated", view: "top-rated" },
  { label: "Upcoming", view: "upcoming" },
  { label: "Box Office", view: "box-office" },
  { label: "Awards", view: "awards" },
  { label: "Calendar", view: "calendar" },
  { label: "Collections", view: "collections" },
  { label: "Providers", view: "providers" },
  { label: "Trailers", view: "trailers" },
  { label: "Franchises", view: "franchises" },
  { label: "Compare", view: "compare" },
  { label: "AI Assistant", view: "ai-assistant" },
  { label: "Trivia", view: "trivia" },
  { label: "Year in Review", view: "year-review" },
  { label: "About", view: "about" },
];

export function Navbar() {
  const navigate = useAppStore((s) => s.navigate);
  const view = useAppStore((s) => s.view);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const searchOpen = useAppStore((s) => s.searchOpen);
  const setSearchOpen = useAppStore((s) => s.setSearchOpen);
  const mobileNavOpen = useAppStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen);
  const authOpen = useAppStore((s) => s.authOpen);
  const setAuthOpen = useAppStore((s) => s.setAuthOpen);
  const { user, logout } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchNotifs = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setUnread(data.unread ?? 0);
      } catch {}
    };
    fetchNotifs();
    const t = setInterval(fetchNotifs, 60000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [user, view]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate("search", { q: searchQuery.trim() });
    setSearchOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("home");
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur border-b border-border shadow-lg shadow-black/20" : "bg-gradient-to-b from-background/80 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-3">
          {/* Logo */}
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 shrink-0"
            aria-label="CineVerse home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <Film className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-black tracking-tight hidden sm:block">
              Cine<span className="text-primary">Verse</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4 flex-1">
            {NAV_ITEMS.slice(0, 7).map((item) => (
              <button
                key={item.view}
                onClick={() => navigate(item.view, item.params)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  view === item.view
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {item.label}
              </button>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                    ["box-office","awards","calendar","collections","providers","trailers","franchises","compare","ai-assistant","trivia","year-review","about"].includes(view)
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  More <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {NAV_ITEMS.slice(9).map((item) => (
                  <DropdownMenuItem key={item.view} onClick={() => navigate(item.view, item.params)}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Search (desktop) */}
          <form onSubmit={submitSearch} className="hidden md:flex items-center max-w-xs flex-1 lg:flex-initial">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, TV, people..."
                className="pl-9 bg-muted/60 border-border focus-visible:bg-background"
                aria-label="Search"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="md:hidden"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("profile", { tab: "notifications" })}
                className="relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Button>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt={user.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user.name ?? user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                      {user.role !== "USER" && (
                        <Badge className="mt-1 w-fit text-[10px]" variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("profile")}>
                    <User className="mr-2 h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("watchlist")}>
                    <Bookmark className="mr-2 h-4 w-4" /> Watchlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("favorites")}>
                    <Heart className="mr-2 h-4 w-4" /> Favorites
                  </DropdownMenuItem>
                  {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("admin")}>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setAuthOpen(true, "login")}>
                  Sign in
                </Button>
                <Button size="sm" onClick={() => setAuthOpen(true, "register")}>
                  Sign up
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0">
                <SheetHeader className="px-4 py-3 border-b border-border flex flex-row items-center justify-between">
                  <SheetTitle className="text-left flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
                      <Film className="h-4 w-4 text-primary-foreground" />
                    </div>
                    Cine<span className="text-primary">Verse</span>
                  </SheetTitle>
                  <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </SheetHeader>
                <nav className="flex flex-col p-2 gap-1 overflow-y-auto">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.view}
                      onClick={() => navigate(item.view, item.params)}
                      className={`text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        view === item.view ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="h-px bg-border my-2" />
                  {user ? (
                    <>
                      <button onClick={() => navigate("watchlist")} className="text-left px-3 py-2.5 rounded-md text-sm hover:bg-muted/60 flex items-center gap-2">
                        <Bookmark className="h-4 w-4" /> Watchlist
                      </button>
                      <button onClick={() => navigate("favorites")} className="text-left px-3 py-2.5 rounded-md text-sm hover:bg-muted/60 flex items-center gap-2">
                        <Heart className="h-4 w-4" /> Favorites
                      </button>
                      <button onClick={() => navigate("profile")} className="text-left px-3 py-2.5 rounded-md text-sm hover:bg-muted/60 flex items-center gap-2">
                        <User className="h-4 w-4" /> Profile
                      </button>
                      {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                        <button onClick={() => navigate("admin")} className="text-left px-3 py-2.5 rounded-md text-sm hover:bg-muted/60 flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" /> Admin
                        </button>
                      )}
                      <button onClick={handleLogout} className="text-left px-3 py-2.5 rounded-md text-sm hover:bg-muted/60 text-destructive flex items-center gap-2">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 p-2">
                      <Button onClick={() => setAuthOpen(true, "login")}>Sign in</Button>
                      <Button variant="outline" onClick={() => setAuthOpen(true, "register")}>Create account</Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {searchOpen && <QuickSearch />}
    </header>
  );
}

function QuickSearch() {
  const setSearchOpen = useAppStore((s) => s.setSearchOpen);
  const navigate = useAppStore((s) => s.navigate);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [setSearchOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate("search", { q: q.trim() });
    setSearchOpen(false);
  };

  const suggestions = ["Echoes of Tomorrow", "Northern Crown", "Neon Lotus", "Ava Sinclair", "Kigali Nights"];

  return (
    <div
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="bg-card border border-border rounded-lg w-full max-w-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={submit} className="flex items-center gap-2 p-3 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search movies, TV shows, people, keywords..."
            className="flex-1 bg-transparent outline-none text-base"
          />
          <Button type="submit" size="sm">Search</Button>
        </form>
        {!q && (
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-2">Popular right now</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQ(s);
                    navigate("search", { q: s });
                    setSearchOpen(false);
                  }}
                  className="px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-muted/70"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
