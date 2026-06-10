import { connectDB } from "./db";
import { Game, type GameDoc } from "@/models/Game";
import type { GameType } from "@/types";

const DEFAULTS: Record<GameType, Partial<GameDoc>> = {
  MEMORY: {
    title: "Memory Match",
    description: "Flip cards to find matching pairs. Speed and accuracy win points.",
    type: "MEMORY",
    difficulty: "EASY",
    rewardPoints: 50,
  },
  REACTION: {
    title: "Reaction Rush",
    description: "How fast can you click? Test your reflexes.",
    type: "REACTION",
    difficulty: "EASY",
    rewardPoints: 40,
  },
  SUDOKU: {
    title: "Sudoku",
    description: "Fill the grid so every row, column and box has 1–9. Fewer mistakes win points.",
    type: "SUDOKU",
    difficulty: "MEDIUM",
    rewardPoints: 80,
  },
  CHESS: {
    title: "Chess",
    description: "Outwit the computer on the 64 squares. Checkmate to claim the points.",
    type: "CHESS",
    difficulty: "HARD",
    rewardPoints: 120,
  },
  CARROM: {
    title: "Carrom",
    description: "Flick the striker to pocket all the coins and the red queen. Fewer strikes win points.",
    type: "CARROM",
    difficulty: "MEDIUM",
    rewardPoints: 90,
  },
};

export async function getOrCreateGame(type: GameType) {
  await connectDB();
  let game = await Game.findOne({ type, active: true });
  if (!game) {
    game = await Game.create(DEFAULTS[type]);
  }
  return game;
}

export function awardForMemory(score: number, durationMs: number) {
  const base = Math.max(0, Math.round(score));
  const speedBonus = durationMs > 0 ? Math.max(0, Math.round(20000 / durationMs * 10)) : 0;
  return Math.min(200, base + speedBonus);
}

export function awardForSudoku(score: number, durationMs: number) {
  const base = Math.max(0, Math.round(score));
  const speedBonus = durationMs > 0 ? Math.max(0, Math.round(120000 / durationMs * 10)) : 0;
  return Math.min(200, base + speedBonus);
}

export function awardForChess(score: number) {
  return Math.min(200, Math.max(0, Math.round(score)));
}

export function awardForCarrom(score: number, durationMs: number) {
  const base = Math.max(0, Math.round(score));
  const speedBonus = durationMs > 0 ? Math.max(0, Math.round(180000 / durationMs * 8)) : 0;
  return Math.min(200, base + speedBonus);
}
