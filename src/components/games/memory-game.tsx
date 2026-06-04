"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RotateCcw, Trophy } from "lucide-react";
import { useGameStore } from "@/store/game-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EMOJIS = ["🚀", "🎮", "🎯", "🌈", "🔥", "⚡", "🍕", "🎵"];

type Card = {
  id: number;
  emoji: string;
  matched: boolean;
};

function buildDeck(): Card[] {
  const deck = [...EMOJIS, ...EMOJIS]
    .map((emoji, i) => ({ id: i, emoji, matched: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
}

export function MemoryGame() {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    pointsAwarded: number;
    totalPoints: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setLastResult = useGameStore((s) => s.setLastResult);
  const submitted = useRef(false);

  useEffect(() => {
    if (!startedAt || done) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 100);
    return () => clearInterval(id);
  }, [startedAt, done]);

  const matchedCount = useMemo(() => deck.filter((c) => c.matched).length, [deck]);

  useEffect(() => {
    if (matchedCount === deck.length && deck.length > 0 && !done) {
      setDone(true);
    }
  }, [matchedCount, deck.length, done]);

  useEffect(() => {
    if (!done || submitted.current) return;
    submitted.current = true;
    const score = Math.max(0, 200 - moves * 4);
    setSubmitting(true);
    fetch("/api/games/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        gameType: "MEMORY",
        score,
        durationMs: elapsed,
        completed: true,
        meta: { moves },
      }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error ?? "Could not save score");
        setResult({ pointsAwarded: data.pointsAwarded, totalPoints: data.totalPoints });
        setLastResult({
          game: "MEMORY",
          score,
          durationMs: elapsed,
          pointsAwarded: data.pointsAwarded,
          totalPoints: data.totalPoints,
          at: Date.now(),
        });
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Save failed"))
      .finally(() => setSubmitting(false));
  }, [done, elapsed, moves, setLastResult]);

  function handleFlip(idx: number) {
    if (!startedAt) setStartedAt(Date.now());
    if (flipped.length === 2 || flipped.includes(idx) || deck[idx].matched) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a].emoji === deck[b].emoji) {
        setTimeout(() => {
          setDeck((d) =>
            d.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))
          );
          setFlipped([]);
        }, 420);
      } else {
        setTimeout(() => setFlipped([]), 720);
      }
    }
  }

  function reset() {
    setDeck(buildDeck());
    setFlipped([]);
    setMoves(0);
    setStartedAt(null);
    setElapsed(0);
    setDone(false);
    setResult(null);
    setError(null);
    submitted.current = false;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Moves: {moves}</Badge>
          <Badge variant="secondary">{(elapsed / 1000).toFixed(1)}s</Badge>
          <Badge variant="outline">
            {matchedCount / 2}/{deck.length / 2} pairs
          </Badge>
        </div>
        <Button onClick={reset} variant="outline" size="sm">
          <RotateCcw /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 md:gap-4">
        {deck.map((card, i) => {
          const isShown = flipped.includes(i) || card.matched;
          return (
            <button
              key={card.id}
              onClick={() => handleFlip(i)}
              disabled={card.matched || done}
              aria-label={isShown ? `Card ${card.emoji}` : "Hidden card"}
              className="relative aspect-square select-none [perspective:800px]"
            >
              <motion.div
                animate={{ rotateY: isShown ? 180 : 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 [transform-style:preserve-3d]"
              >
                <div className="absolute inset-0 grid place-items-center rounded-2xl border bg-[linear-gradient(135deg,hsl(var(--grad-from)),hsl(var(--grad-via)),hsl(var(--grad-to)))] text-white shadow-lg [backface-visibility:hidden]">
                  <span className="text-3xl">✦</span>
                </div>
                <div
                  className={`absolute inset-0 grid place-items-center rounded-2xl border bg-card text-4xl shadow-lg [transform:rotateY(180deg)] [backface-visibility:hidden] ${
                    card.matched ? "ring-2 ring-emerald-500/60" : ""
                  }`}
                >
                  {card.emoji}
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>

      {done && (
        <Card glass>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Trophy className="h-8 w-8 text-amber-500" />
            <h3 className="text-xl font-semibold">Cleared in {moves} moves!</h3>
            {submitting && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving your score…
              </p>
            )}
            {result && (
              <>
                <p className="text-sm text-muted-foreground">
                  +{result.pointsAwarded} points earned · total now{" "}
                  <strong>{result.totalPoints}</strong>
                </p>
              </>
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
