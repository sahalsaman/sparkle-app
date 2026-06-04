"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Eraser, Loader2, RotateCcw, Trophy } from "lucide-react";
import { useGameStore } from "@/store/game-store";
import {
  generatePuzzle,
  isComplete,
  type Board,
  type SudokuDifficulty,
} from "@/lib/sudoku";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DIFFICULTIES: SudokuDifficulty[] = ["EASY", "MEDIUM", "HARD"];
const BASE_SCORE: Record<SudokuDifficulty, number> = {
  EASY: 80,
  MEDIUM: 120,
  HARD: 160,
};

export function SudokuGame() {
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>("MEDIUM");
  const [puzzle, setPuzzle] = useState(() => generatePuzzle("MEDIUM"));
  const [values, setValues] = useState<Board>(() => [...puzzle.puzzle]);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
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

  const givens = useMemo(
    () => puzzle.puzzle.map((v) => v !== 0),
    [puzzle]
  );

  useEffect(() => {
    if (!startedAt || done) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 200);
    return () => clearInterval(id);
  }, [startedAt, done]);

  useEffect(() => {
    if (done || !isComplete(values)) return;
    const correct = values.every((v, i) => v === puzzle.solution[i]);
    if (!correct) return;
    setDone(true);
  }, [values, puzzle.solution, done]);

  useEffect(() => {
    if (!done || submitted.current) return;
    submitted.current = true;
    const score = Math.max(0, BASE_SCORE[difficulty] - mistakes * 10);
    setSubmitting(true);
    fetch("/api/games/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        gameType: "SUDOKU",
        score,
        durationMs: elapsed,
        completed: true,
        meta: { difficulty, mistakes },
      }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error ?? "Could not save score");
        setResult({ pointsAwarded: data.pointsAwarded, totalPoints: data.totalPoints });
        setLastResult({
          game: "SUDOKU",
          score,
          durationMs: elapsed,
          pointsAwarded: data.pointsAwarded,
          totalPoints: data.totalPoints,
          at: Date.now(),
        });
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Save failed"))
      .finally(() => setSubmitting(false));
  }, [done, elapsed, mistakes, difficulty, setLastResult]);

  function newGame(diff: SudokuDifficulty) {
    const next = generatePuzzle(diff);
    setDifficulty(diff);
    setPuzzle(next);
    setValues([...next.puzzle]);
    setSelected(null);
    setMistakes(0);
    setStartedAt(null);
    setElapsed(0);
    setDone(false);
    setResult(null);
    setError(null);
    submitted.current = false;
  }

  function enter(value: number) {
    if (selected === null || givens[selected] || done) return;
    if (!startedAt) setStartedAt(Date.now());
    if (value !== 0 && value !== puzzle.solution[selected]) {
      setMistakes((m) => m + 1);
    }
    setValues((v) => v.map((cell, i) => (i === selected ? value : cell)));
  }

  // Keyboard entry for convenience.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (selected === null) return;
      if (e.key >= "1" && e.key <= "9") enter(Number(e.key));
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") enter(0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const selectedValue = selected !== null ? values[selected] : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{(elapsed / 1000).toFixed(0)}s</Badge>
          <Badge variant={mistakes > 0 ? "warning" : "outline"}>
            Mistakes: {mistakes}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {DIFFICULTIES.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={d === difficulty ? "gradient" : "outline"}
              onClick={() => newGame(d)}
            >
              {d[0] + d.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-md grid-cols-9 overflow-hidden rounded-xl border-2 border-foreground/30">
        {values.map((value, i) => {
          const row = Math.floor(i / 9);
          const col = i % 9;
          const isGiven = givens[i];
          const isSelected = selected === i;
          const sameValue = value !== 0 && value === selectedValue;
          const isWrong = !isGiven && value !== 0 && value !== puzzle.solution[i];
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              disabled={done}
              className={cn(
                "flex aspect-square items-center justify-center text-lg font-medium tabular-nums transition-colors sm:text-xl",
                "border-border/60",
                col % 3 === 0 && col !== 0 && "border-l-2 border-l-foreground/30",
                row % 3 === 0 && row !== 0 && "border-t-2 border-t-foreground/30",
                col !== 8 && "border-r",
                row !== 8 && "border-b",
                isGiven ? "font-bold text-foreground" : "text-primary",
                isWrong && "text-destructive",
                isSelected
                  ? "bg-primary/25"
                  : sameValue
                    ? "bg-primary/10"
                    : "hover:bg-accent"
              )}
            >
              {value !== 0 ? value : ""}
            </button>
          );
        })}
      </div>

      <div className="mx-auto grid w-full max-w-md grid-cols-9 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Button
            key={n}
            variant="outline"
            onClick={() => enter(n)}
            disabled={done || selected === null}
            className="aspect-square h-auto p-0 text-lg"
          >
            {n}
          </Button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => enter(0)}
          disabled={done || selected === null}
        >
          <Eraser /> Erase
        </Button>
        <Button variant="outline" size="sm" onClick={() => newGame(difficulty)}>
          <RotateCcw /> New puzzle
        </Button>
      </div>

      {done && (
        <Card glass>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Trophy className="h-8 w-8 text-amber-500" />
            <h3 className="text-xl font-semibold">
              Solved with {mistakes} mistake{mistakes === 1 ? "" : "s"}!
            </h3>
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
            <Button onClick={() => newGame(difficulty)} variant="gradient" size="sm">
              Play again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
