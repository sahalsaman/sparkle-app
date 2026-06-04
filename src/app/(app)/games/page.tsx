import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const games = [
  {
    title: "Memory Match",
    description: "Flip pairs as fast as you can.",
    href: "/games/memory",
    emoji: "🧠",
    points: 50,
    available: true,
  },
  {
    title: "Quick Quiz",
    description: "Live trivia battles against your team.",
    href: "/games",
    emoji: "❓",
    points: 75,
    available: false,
  },
  {
    title: "Reaction Rush",
    description: "How fast can you click?",
    href: "/games",
    emoji: "⚡",
    points: 40,
    available: false,
  },
];

export default function GamesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Gamepad2 className="h-7 w-7 text-primary" /> Mini games
        </h1>
        <p className="text-muted-foreground">Bite-sized fun. Big bragging rights.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => {
          const inner = (
            <Card glass className="h-full transition-transform hover:-translate-y-0.5">
              <CardContent className="space-y-3 p-6">
                <div className="text-4xl">{g.emoji}</div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{g.title}</h3>
                  <Badge variant="gradient">+{g.points}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{g.description}</p>
                {!g.available && <Badge variant="secondary">Coming soon</Badge>}
              </CardContent>
            </Card>
          );
          return g.available ? (
            <Link key={g.title} href={g.href}>{inner}</Link>
          ) : (
            <div key={g.title} className="opacity-70">{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
