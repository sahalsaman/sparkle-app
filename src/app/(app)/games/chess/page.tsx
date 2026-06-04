import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ChessGame } from "@/components/games/chess-game";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Chess — Sparkle" };

export default function ChessPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/games"><ChevronLeft /> All games</Link>
      </Button>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Chess</h1>
        <p className="text-muted-foreground">
          You play white against the computer. Checkmate the machine to claim the points.
        </p>
      </div>
      <Card glass>
        <CardContent className="p-6">
          <ChessGame />
        </CardContent>
      </Card>
    </div>
  );
}
