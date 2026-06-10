// Self-contained 2D carrom physics. Discs (striker, coins, the red queen) are
// circles on a square board with four corner pockets. Each step() applies linear
// friction, integrates motion, resolves wall bounces and circle–circle elastic
// collisions, and captures discs that reach a pocket. Coordinate units = canvas
// pixels; origin top-left. step() mutates the discs in place for animation-loop
// performance; the rest are pure helpers.

export const BOARD = 480; // canvas px (square)
export const BORDER = 30; // wooden frame thickness
export const PLAY_MIN = BORDER;
export const PLAY_MAX = BOARD - BORDER;

export const COIN_R = 11;
export const STRIKER_R = 15;
export const POCKET_R = 19;

export const STRIKER_MASS = 2.2;
export const COIN_MASS = 1;

export const MAX_POWER = 15; // max striker speed in px per physics tick
export const REST_EPS = 0.05; // speed below which a disc is treated as stopped

// Striker may be placed anywhere along the bottom base line, within these bounds.
export const STRIKER_X_MIN = PLAY_MIN + 70;
export const STRIKER_X_MAX = PLAY_MAX - 70;

const WALL_RESTITUTION = 0.72;
const DISC_RESTITUTION = 0.92;
const FRICTION = 0.992; // velocity multiplier per tick

export type DiscKind = "striker" | "coin" | "queen";
export type DiscColor = "striker" | "white" | "black" | "red";

export type Disc = {
  id: number;
  kind: DiscKind;
  color: DiscColor;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pocketed: boolean;
};

export function baselineY() {
  return PLAY_MAX - 52;
}

function massOf(d: Disc) {
  return d.kind === "striker" ? STRIKER_MASS : COIN_MASS;
}

export function pocketCenters() {
  const lo = PLAY_MIN + 2;
  const hi = PLAY_MAX - 2;
  return [
    { x: lo, y: lo },
    { x: hi, y: lo },
    { x: lo, y: hi },
    { x: hi, y: hi },
  ];
}

// Striker (id 0) on the base line, the queen (id 7) at the centre, and six coins
// in a ring around it (alternating black/white).
export function initialDiscs(strikerX: number): Disc[] {
  const cx = BOARD / 2;
  const cy = BOARD / 2;
  const discs: Disc[] = [
    {
      id: 0,
      kind: "striker",
      color: "striker",
      x: clampStrikerX(strikerX),
      y: baselineY(),
      vx: 0,
      vy: 0,
      r: STRIKER_R,
      pocketed: false,
    },
    { id: 7, kind: "queen", color: "red", x: cx, y: cy, vx: 0, vy: 0, r: COIN_R, pocketed: false },
  ];
  const ringR = 2 * COIN_R + 2;
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    discs.push({
      id: i + 1,
      kind: "coin",
      color: i % 2 === 0 ? "black" : "white",
      x: cx + Math.cos(a) * ringR,
      y: cy + Math.sin(a) * ringR,
      vx: 0,
      vy: 0,
      r: COIN_R,
      pocketed: false,
    });
  }
  return discs;
}

export function clampStrikerX(x: number) {
  return Math.max(STRIKER_X_MIN, Math.min(STRIKER_X_MAX, x));
}

// Advance the simulation by one tick. Returns the ids of any discs pocketed this
// tick (id 0 = the striker, which the caller scores as a foul).
export function step(discs: Disc[]): number[] {
  const pocketed: number[] = [];

  // Integrate motion, apply friction, and bounce off the inner walls.
  for (const d of discs) {
    if (d.pocketed) continue;
    d.x += d.vx;
    d.y += d.vy;
    d.vx *= FRICTION;
    d.vy *= FRICTION;
    if (Math.hypot(d.vx, d.vy) < REST_EPS) {
      d.vx = 0;
      d.vy = 0;
    }
    if (d.x - d.r < PLAY_MIN) {
      d.x = PLAY_MIN + d.r;
      d.vx = Math.abs(d.vx) * WALL_RESTITUTION;
    } else if (d.x + d.r > PLAY_MAX) {
      d.x = PLAY_MAX - d.r;
      d.vx = -Math.abs(d.vx) * WALL_RESTITUTION;
    }
    if (d.y - d.r < PLAY_MIN) {
      d.y = PLAY_MIN + d.r;
      d.vy = Math.abs(d.vy) * WALL_RESTITUTION;
    } else if (d.y + d.r > PLAY_MAX) {
      d.y = PLAY_MAX - d.r;
      d.vy = -Math.abs(d.vy) * WALL_RESTITUTION;
    }
  }

  // Resolve circle–circle collisions (positional separation + elastic impulse).
  for (let i = 0; i < discs.length; i++) {
    const a = discs[i];
    if (a.pocketed) continue;
    for (let j = i + 1; j < discs.length; j++) {
      const b = discs[j];
      if (b.pocketed) continue;
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.hypot(dx, dy);
      const min = a.r + b.r;
      if (dist === 0) {
        dx = 0.01;
        dy = 0;
        dist = 0.01;
      }
      if (dist >= min) continue;

      const nx = dx / dist;
      const ny = dy / dist;
      const invA = 1 / massOf(a);
      const invB = 1 / massOf(b);
      const totalInv = invA + invB;

      // Push the pair apart so they no longer overlap (heavier disc moves less).
      const overlap = min - dist;
      a.x -= nx * overlap * (invA / totalInv);
      a.y -= ny * overlap * (invA / totalInv);
      b.x += nx * overlap * (invB / totalInv);
      b.y += ny * overlap * (invB / totalInv);

      // Exchange momentum only if the discs are approaching along the normal.
      const vn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
      if (vn > 0) {
        const jImp = (-(1 + DISC_RESTITUTION) * vn) / totalInv;
        a.vx += jImp * nx * invA;
        a.vy += jImp * ny * invA;
        b.vx -= jImp * nx * invB;
        b.vy -= jImp * ny * invB;
      }
    }
  }

  // Capture discs that have reached a pocket.
  const pk = pocketCenters();
  for (const d of discs) {
    if (d.pocketed) continue;
    for (const p of pk) {
      if (Math.hypot(d.x - p.x, d.y - p.y) < POCKET_R) {
        d.pocketed = true;
        d.vx = 0;
        d.vy = 0;
        pocketed.push(d.id);
        break;
      }
    }
  }

  return pocketed;
}

export function allResting(discs: Disc[]): boolean {
  return discs.every((d) => d.pocketed || (d.vx === 0 && d.vy === 0));
}
