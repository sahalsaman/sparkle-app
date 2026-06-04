import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MemoryGame } from "@/components/games/memory-game";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Memory Match — Sparkle" };

export default function MemoryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/games"><ChevronLeft /> All games</Link>
      </Button>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Memory Match</h1>
        <p className="text-muted-foreground">
          Flip pairs as fast as you can. Fewer moves = more points.
        </p>
      </div>
      <Card glass>
        <CardContent className="p-6">
          <MemoryGame />
        </CardContent>
      </Card>
    </div>
  );
}
