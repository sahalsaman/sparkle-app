// Lightweight Sudoku generator + solver. Pure functions, no dependencies.
// A board is a flat array of 81 numbers (0 = empty).

export type Board = number[];
export type SudokuDifficulty = "EASY" | "MEDIUM" | "HARD";

const N = 9;

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function canPlace(board: Board, idx: number, value: number): boolean {
  const row = Math.floor(idx / N);
  const col = idx % N;
  for (let c = 0; c < N; c++) {
    if (board[row * N + c] === value) return false;
  }
  for (let r = 0; r < N; r++) {
    if (board[r * N + col] === value) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[(boxRow + r) * N + (boxCol + c)] === value) return false;
    }
  }
  return true;
}

// Fill an empty board with a valid complete solution via randomized backtracking.
function fillBoard(board: Board): boolean {
  const idx = board.indexOf(0);
  if (idx === -1) return true;
  for (const value of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (canPlace(board, idx, value)) {
      board[idx] = value;
      if (fillBoard(board)) return true;
      board[idx] = 0;
    }
  }
  return false;
}

// Count solutions up to a limit (used to keep puzzles unique).
function countSolutions(board: Board, limit: number): number {
  const idx = board.indexOf(0);
  if (idx === -1) return 1;
  let count = 0;
  for (let value = 1; value <= 9; value++) {
    if (canPlace(board, idx, value)) {
      board[idx] = value;
      count += countSolutions(board, limit);
      board[idx] = 0;
      if (count >= limit) break;
    }
  }
  return count;
}

const CLUES: Record<SudokuDifficulty, number> = {
  EASY: 42,
  MEDIUM: 34,
  HARD: 28,
};

export type Puzzle = {
  puzzle: Board;
  solution: Board;
};

export function generatePuzzle(difficulty: SudokuDifficulty = "MEDIUM"): Puzzle {
  const solution: Board = new Array(81).fill(0);
  fillBoard(solution);

  const puzzle = [...solution];
  const targetClues = CLUES[difficulty];
  const cells = shuffled(Array.from({ length: 81 }, (_, i) => i));

  let clues = 81;
  for (const cell of cells) {
    if (clues <= targetClues) break;
    const backup = puzzle[cell];
    if (backup === 0) continue;
    puzzle[cell] = 0;
    // Keep the puzzle uniquely solvable.
    if (countSolutions([...puzzle], 2) !== 1) {
      puzzle[cell] = backup;
    } else {
      clues--;
    }
  }

  return { puzzle, solution };
}

export function isComplete(board: Board): boolean {
  return board.every((v) => v !== 0);
}
