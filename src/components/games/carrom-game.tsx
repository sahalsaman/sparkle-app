"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Trophy } from "lucide-react";
import { useGameStore } from "@/store/game-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BOARD,
  PLAY_MIN,
  PLAY_MAX,
  COIN_R,
  POCKET_R,
  MAX_POWER,
  STRIKER_X_MIN,
  STRIKER_X_MAX,
  baselineY,
  clampStrikerX,
  initialDiscs,
  pocketCenters,
  step,
  allResting,
  type Disc,
} from "@/lib/carrom";

const TOTAL_COINS = 6; // coins to pocket, plus the queen, to clear the board
const SUBSTEPS = 4; // physics ticks per animation frame
const MAX_PULL = 140; // px of drag that maps to full power
const MIN_PULL = 8; // ignore tiny drags

type Stats = { coins: number; queen: boolean; strikes: number; fouls: number };
const ZERO: Stats = { coins: 0, queen: false, strikes: 0, fouls: 0 };

export function CarromGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startX = (STRIKER_X_MIN + STRIKER_X_MAX) / 2;

  const discsRef = useRef<Disc[]>(initialDiscs(startX));
  const rafRef = useRef<number | null>(null);
  const animateRef = useRef<() => void>(() => {});
  const aimRef = useRef<{ x: number; y: number } | null>(null);
  const statsRef = useRef<Stats>({ ...ZERO });
  const strikerXRef = useRef(startX);
  const startedRef = useRef<number | null>(null);
  const submitted = useRef(false);

  const [strikerX, setStrikerX] = useState(startX);
  const [status, setStatus] = useState<"ready" | "animating" | "done">("ready");
  const [stats, setStats] = useState<Stats>({ ...ZERO });
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ pointsAwarded: number; totalPoints: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setLastResult = useGameStore((s) => s.setLastResult);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, BOARD, BOARD);

    // Wooden frame + play surface.
    ctx.fillStyle = "#a86a2c";
    ctx.fillRect(0, 0, BOARD, BOARD);
    ctx.fillStyle = "#f1dca7";
    ctx.fillRect(PLAY_MIN, PLAY_MIN, PLAY_MAX - PLAY_MIN, PLAY_MAX - PLAY_MIN);
    ctx.strokeStyle = "rgba(120,70,20,.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(PLAY_MIN, PLAY_MIN, PLAY_MAX - PLAY_MIN, PLAY_MAX - PLAY_MIN);

    // Centre circle decorations.
    const cx = BOARD / 2;
    const cy = BOARD / 2;
    ctx.strokeStyle = "rgba(150,90,30,.5)";
    ctx.beginPath();
    ctx.arc(cx, cy, COIN_R * 3.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, COIN_R * 1.5, 0, Math.PI * 2);
    ctx.stroke();

    // Bottom base line (where the striker sits).
    const by = baselineY();
    ctx.strokeStyle = "rgba(150,90,30,.7)";
    ctx.lineWidth = 2;
    for (const off of [-7, 7]) {
      ctx.beginPath();
      ctx.moveTo(STRIKER_X_MIN, by + off);
      ctx.lineTo(STRIKER_X_MAX, by + off);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(192,57,43,.85)";
    for (const ex of [STRIKER_X_MIN, STRIKER_X_MAX]) {
      ctx.beginPath();
      ctx.arc(ex, by, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pockets.
    for (const p of pocketCenters()) {
      ctx.fillStyle = "#241404";
      ctx.beginPath();
      ctx.arc(p.x, p.y, POCKET_R, 0, Math.PI * 2);
      ctx.fill();
    }

    // Discs.
    for (const d of discsRef.current) {
      if (d.pocketed) continue;
      drawDisc(ctx, d);
    }

    // Aim guide while the player is pulling back the striker.
    if (aimRef.current && status === "ready") {
      const s = discsRef.current[0];
      const dx = s.x - aimRef.current.x;
      const dy = s.y - aimRef.current.y;
      const len = Math.hypot(dx, dy) || 1;
      const power = Math.min(len, MAX_PULL);
      const ux = dx / len;
      const uy = dy / len;

      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + ux * power * 1.4, s.y + uy * power * 1.4);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(0,0,0,.3)";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - ux * power, s.y - uy * power);
      ctx.stroke();
    }
  }, [status]);

  const endTurn = useCallback(() => {
    rafRef.current = null;
    const striker = discsRef.current[0];
    // The striker always returns to the base line for the next shot.
    striker.pocketed = false;
    striker.x = clampStrikerX(strikerXRef.current);
    striker.y = baselineY();
    striker.vx = 0;
    striker.vy = 0;

    setStats({ ...statsRef.current });
    const cleared = statsRef.current.coins >= TOTAL_COINS && statsRef.current.queen;
    setStatus(cleared ? "done" : "ready");
    draw();
  }, [draw]);

  const animate = useCallback(() => {
    const discs = discsRef.current;
    for (let k = 0; k < SUBSTEPS; k++) {
      const potted = step(discs);
      for (const id of potted) {
        if (id === 0) statsRef.current.fouls += 1;
        else if (id === 7) statsRef.current.queen = true;
        else statsRef.current.coins += 1;
      }
    }
    draw();
    if (allResting(discs)) {
      endTurn();
    } else {
      rafRef.current = requestAnimationFrame(() => animateRef.current());
    }
  }, [draw, endTurn]);

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  // Kick the animation loop whenever a shot puts the board in motion.
  useEffect(() => {
    if (status !== "animating") return;
    rafRef.current = requestAnimationFrame(() => animateRef.current());
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [status]);

  // Game clock — runs from the first strike until the board is cleared.
  useEffect(() => {
    if (startedRef.current == null || status === "done") return;
    const id = setInterval(() => setElapsed(Date.now() - (startedRef.current as number)), 100);
    return () => clearInterval(id);
  }, [status]);

  // Initial render.
  useEffect(() => {
    draw();
  }, [draw]);

  // Submit the score once the board is cleared.
  useEffect(() => {
    if (status !== "done" || submitted.current) return;
    submitted.current = true;
    const st = statsRef.current;
    const base = st.coins * 20 + (st.queen ? 40 : 0);
    const penalty = st.strikes * 5 + st.fouls * 15;
    const score = Math.max(0, base - penalty);
    const durationMs = startedRef.current ? Date.now() - startedRef.current : elapsed;

    setSubmitting(true);
    fetch("/api/games/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        gameType: "CARROM",
        score,
        durationMs,
        completed: true,
        meta: { strikes: st.strikes, fouls: st.fouls, queen: st.queen },
      }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error ?? "Could not save score");
        setResult({ pointsAwarded: data.pointsAwarded, totalPoints: data.totalPoints });
        setLastResult({
          game: "CARROM",
          score,
          durationMs,
          pointsAwarded: data.pointsAwarded,
          totalPoints: data.totalPoints,
          at: Date.now(),
        });
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Save failed"))
      .finally(() => setSubmitting(false));
  }, [status, elapsed, setLastResult]);

  function toBoard(e: React.PointerEvent) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * BOARD) / rect.width,
      y: ((e.clientY - rect.top) * BOARD) / rect.height,
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (status !== "ready") return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    aimRef.current = toBoard(e);
    draw();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (status !== "ready" || !aimRef.current) return;
    aimRef.current = toBoard(e);
    draw();
  }

  function onPointerUp() {
    if (status !== "ready" || !aimRef.current) return;
    const p = aimRef.current;
    aimRef.current = null;
    const s = discsRef.current[0];
    const dx = s.x - p.x;
    const dy = s.y - p.y;
    const len = Math.hypot(dx, dy);
    if (len < MIN_PULL) {
      draw();
      return;
    }
    const power = Math.min(len, MAX_PULL) / MAX_PULL;
    s.vx = (dx / len) * power * MAX_POWER;
    s.vy = (dy / len) * power * MAX_POWER;
    statsRef.current.strikes += 1;
    if (startedRef.current == null) startedRef.current = Date.now();
    setStatus("animating");
  }

  function onStrikerSlide(v: number) {
    setStrikerX(v);
    strikerXRef.current = v;
    if (status === "ready") {
      discsRef.current[0].x = clampStrikerX(v);
      draw();
    }
  }

  function reset() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    discsRef.current = initialDiscs(strikerXRef.current);
    statsRef.current = { ...ZERO };
    startedRef.current = null;
    submitted.current = false;
    aimRef.current = null;
    setStats({ ...ZERO });
    setElapsed(0);
    setResult(null);
    setError(null);
    setStatus("ready");
    draw();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            Coins {stats.coins}/{TOTAL_COINS}
          </Badge>
          <Badge variant={stats.queen ? "gradient" : "secondary"}>
            {stats.queen ? "Queen ✓" : "Queen"}
          </Badge>
          <Badge variant="secondary">Strikes: {stats.strikes}</Badge>
          {stats.fouls > 0 && <Badge variant="warning">Fouls: {stats.fouls}</Badge>}
          <Badge variant="secondary">{(elapsed / 1000).toFixed(1)}s</Badge>
        </div>
        <Button onClick={reset} variant="outline" size="sm">
          <RotateCcw /> Reset
        </Button>
      </div>

      <div className="mx-auto w-full max-w-[480px]">
        <canvas
          ref={canvasRef}
          width={BOARD}
          height={BOARD}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="w-full touch-none rounded-2xl border shadow-lg"
          style={{ aspectRatio: "1 / 1" }}
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="shrink-0">Striker</span>
          <input
            type="range"
            min={STRIKER_X_MIN}
            max={STRIKER_X_MAX}
            value={strikerX}
            disabled={status !== "ready"}
            onChange={(e) => onStrikerSlide(Number(e.target.value))}
            className="w-full accent-primary disabled:opacity-50"
            aria-label="Striker position"
          />
        </label>
        <p className="text-center text-xs text-muted-foreground">
          Slide to place the striker, then drag it back and release to flick — aim for the corner pockets.
        </p>
      </div>

      {status === "done" && (
        <Card glass>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Trophy className="h-8 w-8 text-amber-500" />
            <h3 className="text-xl font-semibold">
              Board cleared in {stats.strikes} strike{stats.strikes === 1 ? "" : "s"}!
            </h3>
            {stats.fouls > 0 && (
              <p className="text-xs text-muted-foreground">{stats.fouls} foul(s) cost you points.</p>
            )}
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

function drawDisc(ctx: CanvasRenderingContext2D, d: Disc) {
  const fill =
    d.color === "striker"
      ? "#e9e9ec"
      : d.color === "white"
        ? "#f5e9c8"
        : d.color === "black"
          ? "#3a2c1a"
          : "#c0392b";
  const stroke =
    d.color === "striker"
      ? "#5a5a60"
      : d.color === "white"
        ? "#b9a06a"
        : d.color === "black"
          ? "#1c130a"
          : "#7d1f15";

  ctx.beginPath();
  ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = stroke;
  ctx.stroke();

  // Subtle highlight + inner ring for depth.
  ctx.beginPath();
  ctx.arc(d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,.25)";
  ctx.fill();
  if (d.kind === "striker") {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
