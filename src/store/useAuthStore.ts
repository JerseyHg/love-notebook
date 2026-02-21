"use client";

import { create } from "zustand";
import type { User, Couple } from "@/types";

interface AuthState {
  user: User | null;
  couple: Couple | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setCouple: (couple: Couple | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  couple: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setCouple: (couple) => set({ couple }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null, couple: null });
    window.location.href = "/login";
  },

  fetchUser: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, couple: data.couple, isLoading: false });
      } else {
        set({ user: null, couple: null, isLoading: false });
      }
    } catch {
      set({ user: null, couple: null, isLoading: false });
    }
  },
}));
