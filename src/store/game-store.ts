"use client";

import { create } from "zustand";

type GameResult = {
  game: "MEMORY" | "REACTION" | "SUDOKU" | "CHESS" | "CARROM";
  score: number;
  durationMs: number;
  pointsAwarded: number;
  totalPoints: number;
  at: number;
};

type GameStore = {
  lastResult: GameResult | null;
  setLastResult: (r: GameResult) => void;
  clear: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  lastResult: null,
  setLastResult: (r) => set({ lastResult: r }),
  clear: () => set({ lastResult: null }),
}));
