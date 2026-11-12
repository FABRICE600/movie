"use client";

import { useAppStore, type ViewName } from "@/store/app-store";
import { Home, Compass, Search, Bookmark, User } from "lucide-react";

const TABS: { view: ViewName; label: string; icon: typeof Home }[] = [
  { view: "home", label: "Home", icon: Home },
  { view: "discover", label: "Discover", icon: Compass },
  { view: "search", label: "Search", icon: Search },
  { view: "watchlist", label: "Watchlist", icon: Bookmark },
  { view: "profile", label: "Profile", icon: User },
];

export function MobileBottomNav() {
  const view = useAppStore((s) => s.view);
  const navigate = useAppStore((s) => s.navigate);
  const setSearchOpen = useAppStore((s) => s.setSearchOpen);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border"
      aria-label="Mobile bottom navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 h-14">
        {TABS.map((tab) => {
          const isActive = view === tab.view;
          const Icon = tab.icon;
          const handle = () => {
            if (tab.view === "search") {
              setSearchOpen(true);
            } else {
              navigate(tab.view);
            }
          };
          return (
            <button
              key={tab.view}
              onClick={handle}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
