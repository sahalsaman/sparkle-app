"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Trophy } from "lucide-react";
import { useGameStore } from "@/store/game-store";
import {
  applyMove,
  bestMove,
  getLegalMoves,
  getStatus,
  initialState,
  PIECE_GLYPHS,
  type GameState,
  type Move,
  type Status,
} from "@/lib/chess";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLAYER = "w" as const; // human plays white, computer plays black
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

type Outcome = "win" | "loss" | "draw";

export function ChessGame() {
  const [state, setState] = useState<GameState>(() => initialState());
  const [selected, setSelected] = useState<number | null>(null);
  const [targets, setTargets] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);
  const [status, setStatus] = useState<Status>("ongoing");
  const [thinking, setThinking] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    pointsAwarded: number;
    totalPoints: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setLastResult = useGameStore((s) => s.setLastResult);
  const submitted = useRef(false);

  const finish = useCallback((next: GameState) => {
    const s = getStatus(next);
    setStatus(s);
    if (s === "checkmate") {
      // The side to move is checkmated; if that's the computer, the player won.
      setOutcome(next.turn === PLAYER ? "loss" : "win");
    } else if (s === "stalemate") {
      setOutcome("draw");
    }
    return s;
  }, []);

  // Computer reply whenever it is black's turn and the game is live.
  useEffect(() => {
    if (state.turn === PLAYER || outcome) return;
    setThinking(true);
    const id = setTimeout(() => {
      const move = bestMove(state, 2);
      if (!move) {
        setThinking(false);
        finish(state);
        return;
      }
      const next = applyMove(state, move);
      setState(next);
      setLastMove({ from: move.from, to: move.to });
      setThinking(false);
      finish(next);
    }, 350);
    return () => clearTimeout(id);
  }, [state, outcome, finish]);

  // Submit the result once the game ends.
  useEffect(() => {
    if (!outcome || submitted.current) return;
    submitted.current = true;
    const score = outcome === "win" ? 200 : outcome === "draw" ? 50 : 0;
    setSubmitting(true);
    fetch("/api/games/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        gameType: "CHESS",
        score,
        durationMs: 0,
        completed: true,
        meta: { outcome },
      }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error ?? "Could not save score");
        setResult({ pointsAwarded: data.pointsAwarded, totalPoints: data.totalPoints });
        setLastResult({
          game: "CHESS",
          score,
          durationMs: 0,
          pointsAwarded: data.pointsAwarded,
          totalPoints: data.totalPoints,
          at: Date.now(),
        });
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Save failed"))
      .finally(() => setSubmitting(false));
  }, [outcome, setLastResult]);

  function handleSquare(idx: number) {
    if (outcome || thinking || state.turn !== PLAYER) return;
    const piece = state.board[idx];

    // Attempt a move if a target square is clicked.
    const move = targets.find((m) => m.to === idx);
    if (selected !== null && move) {
      // Auto-promote to queen when promotions are offered.
      const chosen =
        targets.filter((m) => m.to === idx).find((m) => m.promotion === "q") ?? move;
      const next = applyMove(state, chosen);
      setState(next);
      setLastMove({ from: chosen.from, to: chosen.to });
      setSelected(null);
      setTargets([]);
      finish(next);
      return;
    }

    // Otherwise (de)select one of our own pieces.
    if (piece && piece.color === PLAYER) {
      if (selected === idx) {
        setSelected(null);
        setTargets([]);
      } else {
        setSelected(idx);
        setTargets(getLegalMoves(state, idx));
      }
    } else {
      setSelected(null);
      setTargets([]);
    }
  }

  function reset() {
    setState(initialState());
    setSelected(null);
    setTargets([]);
    setLastMove(null);
    setStatus("ongoing");
    setThinking(false);
    setOutcome(null);
    setResult(null);
    setError(null);
    submitted.current = false;
  }

  const targetSquares = new Set(targets.map((m) => m.to));

  const statusLabel = outcome
    ? outcome === "win"
      ? "Checkmate — you win!"
      : outcome === "loss"
        ? "Checkmate — computer wins"
        : "Stalemate — draw"
    : thinking
      ? "Computer is thinking…"
      : status === "check"
        ? "Check!"
        : state.turn === PLAYER
          ? "Your move (white)"
          : "Computer's move";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge variant={status === "check" || outcome === "loss" ? "warning" : "secondary"}>
          {statusLabel}
        </Badge>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw /> New game
        </Button>
      </div>

      <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border-2 border-foreground/30 shadow-lg">
        <div className="grid grid-cols-8">
          {state.board.map((piece, idx) => {
            const row = Math.floor(idx / 8);
            const col = idx % 8;
            const dark = (row + col) % 2 === 1;
            const isSelected = selected === idx;
            const isTarget = targetSquares.has(idx);
            const isCapture = isTarget && piece;
            const isLast =
              lastMove && (lastMove.from === idx || lastMove.to === idx);
            return (
              <button
                key={idx}
                onClick={() => handleSquare(idx)}
                disabled={!!outcome}
                className={cn(
                  "relative flex aspect-square items-center justify-center text-3xl leading-none transition-colors sm:text-4xl",
                  dark ? "bg-primary/20" : "bg-background",
                  isLast && "bg-amber-400/30",
                  isSelected && "ring-2 ring-inset ring-primary",
                  isTarget && !isCapture && "cursor-pointer",
                  piece?.color === "w" ? "text-foreground" : "text-foreground"
                )}
              >
                {piece && (
                  <span
                    className={cn(
                      piece.color === "w"
                        ? "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]"
                        : "text-zinc-900 dark:text-zinc-950"
                    )}
                  >
                    {PIECE_GLYPHS[piece.color][piece.type]}
                  </span>
                )}
                {isTarget && !isCapture && (
                  <span className="absolute h-3 w-3 rounded-full bg-primary/50" />
                )}
                {isCapture && (
                  <span className="absolute inset-1 rounded-md ring-2 ring-inset ring-destructive/70" />
                )}
                {col === 0 && (
                  <span className="absolute left-0.5 top-0.5 text-[9px] text-muted-foreground">
                    {8 - row}
                  </span>
                )}
                {row === 7 && (
                  <span className="absolute bottom-0.5 right-0.5 text-[9px] text-muted-foreground">
                    {FILES[col]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {outcome && (
        <Card glass>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Trophy
              className={cn(
                "h-8 w-8",
                outcome === "win" ? "text-amber-500" : "text-muted-foreground"
              )}
            />
            <h3 className="text-xl font-semibold">{statusLabel}</h3>
            {submitting && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving your score…
              </p>
            )}
            {result && (
              <p className="text-sm text-muted-foreground">
                +{result.pointsAwarded} points earned · total now{" "}
                <strong>{result.totalPoints}</strong>
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={reset} variant="gradient" size="sm">
              Play again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
