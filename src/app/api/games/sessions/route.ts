import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { GameSession } from "@/models/GameSession";
import { awardForChess, awardForMemory, awardForSudoku, getOrCreateGame } from "@/lib/games";
import { GAME_TYPES, type GameType } from "@/types";

const bodySchema = z.object({
  gameType: z.enum(GAME_TYPES),
  score: z.number().int().min(0).max(10_000),
  durationMs: z.number().int().min(0).max(60 * 60 * 1000),
  completed: z.boolean().optional().default(true),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { gameType, score, durationMs, completed, meta } = parsed.data;

  await connectDB();
  const game = await getOrCreateGame(gameType as GameType);
  const pointsAwarded = completed
    ? gameType === "MEMORY"
      ? awardForMemory(score, durationMs)
      : gameType === "SUDOKU"
        ? awardForSudoku(score, durationMs)
        : gameType === "CHESS"
          ? awardForChess(score)
          : Math.min(200, score)
    : 0;

  await GameSession.create({
    gameId: game._id,
    userId: session.user.id,
    score,
    durationMs,
    completed,
    pointsAwarded,
    meta: meta ?? {},
  });

  const updated = await User.findByIdAndUpdate(
    session.user.id,
    { $inc: { totalPoints: pointsAwarded }, $set: { lastActiveAt: new Date() } },
    { new: true, projection: { totalPoints: 1 } }
  ).lean<{ totalPoints?: number }>();

  return NextResponse.json({
    ok: true,
    pointsAwarded,
    totalPoints: updated?.totalPoints ?? 0,
  });
}
