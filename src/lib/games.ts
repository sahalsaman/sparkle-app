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
  QUIZ: {
    title: "Quick Quiz",
    description: "Live trivia battles against your team.",
    type: "QUIZ",
    difficulty: "MEDIUM",
    rewardPoints: 75,
    multiplayer: true,
  },
  REACTION: {
    title: "Reaction Rush",
    description: "How fast can you click? Test your reflexes.",
    type: "REACTION",
    difficulty: "EASY",
    rewardPoints: 40,
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
