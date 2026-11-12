"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewName =
  | "home"
  | "discover"
  | "movies"
  | "movie"
  | "tv"
  | "tv-details"
  | "people"
  | "person"
  | "search"
  | "watchlist"
  | "favorites"
  | "profile"
  | "admin"
  | "genres"
  | "trending"
  | "top-rated"
  | "upcoming"
  | "now-playing"
  | "collections"
  | "providers"
  | "trailers"
  | "about"
  | "privacy"
  | "terms";

interface ViewState {
  view: ViewName;
  params: Record<string, string | number>;
}

interface AppStore {
  // Routing
  view: ViewName;
  params: Record<string, string | number>;
  navigate: (view: ViewName, params?: Record<string, string | number>) => void;
  goBack: () => void;
  history: ViewState[];
  // Theme
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  toggleTheme: () => void;
  // Quick search
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  // Auth dialog
  authOpen: boolean;
  authMode: "login" | "register";
  setAuthOpen: (v: boolean, mode?: "login" | "register") => void;
  // Mobile nav
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
  // Continue watching
  recentlyViewed: { id: number; mediaType: string; title: string; posterUrl: string; viewedAt: number }[];
  pushRecentlyViewed: (item: { id: number; mediaType: string; title: string; posterUrl: string }) => void;
  clearRecentlyViewed: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      view: "home",
      params: {},
      history: [],
      navigate: (view, params = {}) => {
        const current = { view: get().view, params: get().params };
        set((s) => ({
          view,
          params,
          history: [...s.history.slice(-20), current],
          mobileNavOpen: false,
        }));
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        }
      },
      goBack: () => {
        const hist = get().history;
        if (hist.length === 0) {
          set({ view: "home", params: {} });
          return;
        }
        const last = hist[hist.length - 1];
        set((s) => ({ view: last.view, params: last.params, history: s.history.slice(0, -1) }));
      },
      theme: "dark",
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      searchOpen: false,
      setSearchOpen: (v) => set({ searchOpen: v }),
      authOpen: false,
      authMode: "login",
      setAuthOpen: (v, mode) => set({ authOpen: v, authMode: mode ?? get().authMode }),
      mobileNavOpen: false,
      setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
      recentlyViewed: [],
      pushRecentlyViewed: (item) =>
        set((s) => ({
          recentlyViewed: [
            { ...item, viewedAt: Date.now() },
            ...s.recentlyViewed.filter((r) => r.id !== item.id),
          ].slice(0, 12),
        })),
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: "cineverse-store",
      partialize: (s) => ({
        theme: s.theme,
        recentlyViewed: s.recentlyViewed,
      }),
    }
  )
);
