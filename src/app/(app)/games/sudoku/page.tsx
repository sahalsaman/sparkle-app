import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SudokuGame } from "@/components/games/sudoku-game";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Sudoku — Sparkle" };

export default function SudokuPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/games"><ChevronLeft /> All games</Link>
      </Button>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Sudoku</h1>
        <p className="text-muted-foreground">
          Fill every row, column and 3×3 box with 1–9. Fewer mistakes = more points.
        </p>
      </div>
      <Card glass>
        <CardContent className="p-6">
          <SudokuGame />
        </CardContent>
      </Card>
    </div>
  );
}
