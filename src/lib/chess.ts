// Self-contained chess engine: legal move generation (incl. castling, en passant,
// promotion), check / checkmate / stalemate detection, and a small minimax AI.
// Board is 64 squares, index = row * 8 + col, row 0 = rank 8 (top), row 7 = rank 1.
// White moves up the board (decreasing row); black moves down.

export type Color = "w" | "b";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";
export type Piece = { type: PieceType; color: Color };
export type Square = Piece | null;
export type Board = Square[];

export type Castling = { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean };

export type GameState = {
  board: Board;
  turn: Color;
  castling: Castling;
  enPassant: number | null; // target square index, or null
};

export type Move = {
  from: number;
  to: number;
  piece: PieceType;
  captured?: PieceType;
  promotion?: PieceType;
  castle?: "K" | "Q";
  enPassant?: boolean;
  double?: boolean;
};

export type Status = "ongoing" | "check" | "checkmate" | "stalemate";

const N = 8;

export const rowOf = (idx: number) => Math.floor(idx / N);
export const colOf = (idx: number) => idx % N;
const inBounds = (r: number, c: number) => r >= 0 && r < N && c >= 0 && c < N;
const opposite = (color: Color): Color => (color === "w" ? "b" : "w");

const KNIGHT_OFFSETS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];
const KING_OFFSETS = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1],
  [0, 1], [1, -1], [1, 0], [1, 1],
];
const BISHOP_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const ROOK_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export function initialState(): GameState {
  const board: Board = new Array(64).fill(null);
  const backRank: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  for (let c = 0; c < N; c++) {
    board[0 * N + c] = { type: backRank[c], color: "b" };
    board[1 * N + c] = { type: "p", color: "b" };
    board[6 * N + c] = { type: "p", color: "w" };
    board[7 * N + c] = { type: backRank[c], color: "w" };
  }
  return {
    board,
    turn: "w",
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null,
  };
}

function cloneState(state: GameState): GameState {
  return {
    board: [...state.board],
    turn: state.turn,
    castling: { ...state.castling },
    enPassant: state.enPassant,
  };
}

// Is `idx` attacked by any piece of `byColor`?
export function isSquareAttacked(board: Board, idx: number, byColor: Color): boolean {
  const r = rowOf(idx);
  const c = colOf(idx);

  // Pawn attacks: a byColor pawn sits diagonally "behind" the square it attacks.
  // White pawns attack upward (toward row 0), so they live one row below the target.
  const pawnRow = byColor === "w" ? r + 1 : r - 1;
  for (const dc of [-1, 1]) {
    if (inBounds(pawnRow, c + dc)) {
      const p = board[pawnRow * N + (c + dc)];
      if (p && p.color === byColor && p.type === "p") return true;
    }
  }

  // Knights
  for (const [dr, dc] of KNIGHT_OFFSETS) {
    if (inBounds(r + dr, c + dc)) {
      const p = board[(r + dr) * N + (c + dc)];
      if (p && p.color === byColor && p.type === "n") return true;
    }
  }

  // King
  for (const [dr, dc] of KING_OFFSETS) {
    if (inBounds(r + dr, c + dc)) {
      const p = board[(r + dr) * N + (c + dc)];
      if (p && p.color === byColor && p.type === "k") return true;
    }
  }

  // Sliding: bishops/queens on diagonals
  for (const [dr, dc] of BISHOP_DIRS) {
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc)) {
      const p = board[nr * N + nc];
      if (p) {
        if (p.color === byColor && (p.type === "b" || p.type === "q")) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  // Sliding: rooks/queens on ranks/files
  for (const [dr, dc] of ROOK_DIRS) {
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc)) {
      const p = board[nr * N + nc];
      if (p) {
        if (p.color === byColor && (p.type === "r" || p.type === "q")) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  return false;
}

function kingIndex(board: Board, color: Color): number {
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (p && p.type === "k" && p.color === color) return i;
  }
  return -1;
}

export function isInCheck(state: GameState, color: Color): boolean {
  const k = kingIndex(state.board, color);
  if (k === -1) return false;
  return isSquareAttacked(state.board, k, opposite(color));
}

// Pseudo-legal moves (may leave own king in check).
function pseudoMoves(state: GameState, color: Color): Move[] {
  const moves: Move[] = [];
  const { board } = state;

  for (let idx = 0; idx < 64; idx++) {
    const piece = board[idx];
    if (!piece || piece.color !== color) continue;
    const r = rowOf(idx);
    const c = colOf(idx);

    const add = (to: number, opts: Partial<Move> = {}) => {
      const target = board[to];
      moves.push({
        from: idx,
        to,
        piece: piece.type,
        captured: target ? target.type : undefined,
        ...opts,
      });
    };

    if (piece.type === "p") {
      const dir = color === "w" ? -1 : 1;
      const startRow = color === "w" ? 6 : 1;
      const promoRow = color === "w" ? 0 : 7;
      const oneR = r + dir;

      // Forward one
      if (inBounds(oneR, c) && !board[oneR * N + c]) {
        const to = oneR * N + c;
        if (oneR === promoRow) {
          for (const promotion of ["q", "r", "b", "n"] as PieceType[]) add(to, { promotion });
        } else {
          add(to);
        }
        // Forward two
        const twoR = r + 2 * dir;
        if (r === startRow && !board[twoR * N + c]) {
          add(twoR * N + c, { double: true });
        }
      }

      // Captures (including en passant)
      for (const dc of [-1, 1]) {
        const nr = r + dir;
        const nc = c + dc;
        if (!inBounds(nr, nc)) continue;
        const to = nr * N + nc;
        const target = board[to];
        if (target && target.color !== color) {
          if (nr === promoRow) {
            for (const promotion of ["q", "r", "b", "n"] as PieceType[])
              add(to, { promotion });
          } else {
            add(to);
          }
        } else if (!target && state.enPassant === to) {
          add(to, { enPassant: true, captured: "p" });
        }
      }
    } else if (piece.type === "n") {
      for (const [dr, dc] of KNIGHT_OFFSETS) {
        const nr = r + dr;
        const nc = c + dc;
        if (!inBounds(nr, nc)) continue;
        const target = board[nr * N + nc];
        if (!target || target.color !== color) add(nr * N + nc);
      }
    } else if (piece.type === "k") {
      for (const [dr, dc] of KING_OFFSETS) {
        const nr = r + dr;
        const nc = c + dc;
        if (!inBounds(nr, nc)) continue;
        const target = board[nr * N + nc];
        if (!target || target.color !== color) add(nr * N + nc);
      }
      // Castling
      const rights = state.castling;
      const enemy = opposite(color);
      const homeRow = color === "w" ? 7 : 0;
      if (r === homeRow && c === 4 && !isSquareAttacked(board, idx, enemy)) {
        const kingSide = color === "w" ? rights.wK : rights.bK;
        const queenSide = color === "w" ? rights.wQ : rights.bQ;
        // King side: f and g empty, e/f/g not attacked, rook on h
        if (
          kingSide &&
          !board[homeRow * N + 5] &&
          !board[homeRow * N + 6] &&
          board[homeRow * N + 7]?.type === "r" &&
          !isSquareAttacked(board, homeRow * N + 5, enemy) &&
          !isSquareAttacked(board, homeRow * N + 6, enemy)
        ) {
          add(homeRow * N + 6, { castle: "K" });
        }
        // Queen side: b,c,d empty, c/d/e not attacked, rook on a
        if (
          queenSide &&
          !board[homeRow * N + 1] &&
          !board[homeRow * N + 2] &&
          !board[homeRow * N + 3] &&
          board[homeRow * N + 0]?.type === "r" &&
          !isSquareAttacked(board, homeRow * N + 3, enemy) &&
          !isSquareAttacked(board, homeRow * N + 2, enemy)
        ) {
          add(homeRow * N + 2, { castle: "Q" });
        }
      }
    } else {
      // Sliding pieces
      const dirs =
        piece.type === "b"
          ? BISHOP_DIRS
          : piece.type === "r"
            ? ROOK_DIRS
            : [...BISHOP_DIRS, ...ROOK_DIRS];
      for (const [dr, dc] of dirs) {
        let nr = r + dr;
        let nc = c + dc;
        while (inBounds(nr, nc)) {
          const target = board[nr * N + nc];
          if (!target) {
            add(nr * N + nc);
          } else {
            if (target.color !== color) add(nr * N + nc);
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
    }
  }

  return moves;
}

export function applyMove(state: GameState, move: Move): GameState {
  const next = cloneState(state);
  const { board } = next;
  const piece = board[move.from]!;
  const color = piece.color;

  board[move.from] = null;

  // En passant: remove the pawn that was passed.
  if (move.enPassant) {
    const capRow = rowOf(move.from);
    const capCol = colOf(move.to);
    board[capRow * N + capCol] = null;
  }

  // Place piece (with promotion if any).
  board[move.to] = move.promotion
    ? { type: move.promotion, color }
    : { type: piece.type, color };

  // Castling: move the rook.
  if (move.castle) {
    const homeRow = color === "w" ? 7 : 0;
    if (move.castle === "K") {
      board[homeRow * N + 5] = board[homeRow * N + 7];
      board[homeRow * N + 7] = null;
    } else {
      board[homeRow * N + 3] = board[homeRow * N + 0];
      board[homeRow * N + 0] = null;
    }
  }

  // Update castling rights when king/rook moves or a rook is captured.
  const rights = next.castling;
  if (piece.type === "k") {
    if (color === "w") {
      rights.wK = false;
      rights.wQ = false;
    } else {
      rights.bK = false;
      rights.bQ = false;
    }
  }
  const touchRook = (sq: number) => {
    if (sq === 7 * N + 7) rights.wK = false;
    if (sq === 7 * N + 0) rights.wQ = false;
    if (sq === 0 * N + 7) rights.bK = false;
    if (sq === 0 * N + 0) rights.bQ = false;
  };
  touchRook(move.from);
  touchRook(move.to);

  // En passant target for the next move.
  next.enPassant =
    move.double
      ? (rowOf(move.from) + rowOf(move.to)) / 2 * N + colOf(move.from)
      : null;

  next.turn = opposite(color);
  return next;
}

export function getLegalMoves(state: GameState, from?: number): Move[] {
  const color = state.turn;
  const legal: Move[] = [];
  for (const move of pseudoMoves(state, color)) {
    if (from !== undefined && move.from !== from) continue;
    const after = applyMove(state, move);
    if (!isInCheck(after, color)) legal.push(move);
  }
  return legal;
}

export function getStatus(state: GameState): Status {
  const hasMoves = getLegalMoves(state).length > 0;
  const inCheck = isInCheck(state, state.turn);
  if (!hasMoves) return inCheck ? "checkmate" : "stalemate";
  return inCheck ? "check" : "ongoing";
}

// ---- AI ----------------------------------------------------------------

const VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Evaluation from white's perspective.
function evaluate(board: Board): number {
  let score = 0;
  for (const sq of board) {
    if (!sq) continue;
    const v = VALUES[sq.type];
    score += sq.color === "w" ? v : -v;
  }
  return score;
}

function negamax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  perspective: number // +1 if maximizing for white at this node
): number {
  const moves = getLegalMoves(state);
  if (moves.length === 0) {
    if (isInCheck(state, state.turn)) return -100000; // side to move is checkmated
    return 0; // stalemate
  }
  if (depth === 0) {
    return perspective * evaluate(state.board);
  }
  let best = -Infinity;
  for (const move of moves) {
    const after = applyMove(state, move);
    const value = -negamax(after, depth - 1, -beta, -alpha, -perspective);
    if (value > best) best = value;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

// Pick the best move for the side to move. depth>=1. Returns null if no moves.
export function bestMove(state: GameState, depth = 2): Move | null {
  const moves = getLegalMoves(state);
  if (moves.length === 0) return null;
  const perspective = state.turn === "w" ? 1 : -1;
  let best: Move | null = null;
  let bestValue = -Infinity;
  // Light shuffle so equal positions don't always pick the same move.
  for (let i = moves.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [moves[i], moves[j]] = [moves[j], moves[i]];
  }
  for (const move of moves) {
    const after = applyMove(state, move);
    const value = -negamax(after, depth - 1, -Infinity, Infinity, -perspective);
    if (value > bestValue) {
      bestValue = value;
      best = move;
    }
  }
  return best;
}

export const PIECE_GLYPHS: Record<Color, Record<PieceType, string>> = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};
