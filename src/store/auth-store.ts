"use client";

import { create } from "zustand";
import type { Role } from "@/types";

type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
};

type AuthStore = {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}));
