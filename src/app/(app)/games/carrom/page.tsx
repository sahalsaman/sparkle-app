import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CarromGame } from "@/components/games/carrom-game";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Carrom — Sparkle" };

export default function CarromPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/games"><ChevronLeft /> All games</Link>
      </Button>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Carrom</h1>
        <p className="text-muted-foreground">
          Flick the striker to pocket all six coins and the red queen. Fewer strikes and fouls = more points.
        </p>
      </div>
      <Card glass>
        <CardContent className="p-6">
          <CarromGame />
        </CardContent>
      </Card>
    </div>
  );
}
