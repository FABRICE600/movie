"use client";

import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  role: "USER" | "MODERATOR" | "ADMIN" | "PREMIUM";
  country: string | null;
  preferredLang: string | null;
}

interface AuthStore {
  user: AuthUser | null;
  loading: boolean;
  setUser: (u: AuthUser | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  setUser: (u) => set({ user: u, loading: false }),
  setLoading: (v) => set({ loading: v }),
  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    set({ user: null });
  },
  refresh: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user ?? null, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
