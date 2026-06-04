import Link from "next/link";
import { Trophy, Flame, Gamepad2, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { GameSession } from "@/models/GameSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export const dynamic = "force-dynamic";

async function loadMetrics(userId: string, companyId: string | null) {
  try {
    await connectDB();
    const me = await User.findById(userId).lean<{
      totalPoints?: number;
      streak?: number;
      name?: string;
    }>();
    const sessions = await GameSession.countDocuments({ userId });
    let rank: number | null = null;
    if (companyId && me?.totalPoints != null) {
      const higher = await User.countDocuments({
        companyId,
        totalPoints: { $gt: me.totalPoints },
      });
      rank = higher + 1;
    }
    return {
      points: me?.totalPoints ?? 0,
      streak: me?.streak ?? 0,
      sessions,
      rank,
    };
  } catch {
    return { points: 0, streak: 0, sessions: 0, rank: null };
  }
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const companyId = session!.user.companyId ?? null;
  const metrics = await loadMetrics(userId, companyId);

  const nextRewardAt = 1000;
  const progressPct = Math.min(100, Math.round((metrics.points / nextRewardAt) * 100));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="gradient" className="mb-3">
            <Sparkles className="mr-1 h-3 w-3" /> {metrics.streak}-day streak
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Hey {session?.user.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening at your company today.</p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/games">Play a game</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total points" value={metrics.points} icon={Trophy} hint="All-time" />
        <StatCard
          label="Company rank"
          value={metrics.rank ? `#${metrics.rank}` : "—"}
          icon={Trophy}
          accent="amber"
          hint="Across your team"
        />
        <StatCard
          label="Streak"
          value={`${metrics.streak} days`}
          icon={Flame}
          accent="emerald"
          hint="Keep it alive!"
        />
        <StatCard
          label="Games played"
          value={metrics.sessions}
          icon={Gamepad2}
          accent="blue"
          hint="Lifetime"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card glass className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Progress to next reward</CardTitle>
            <Badge variant="secondary">{progressPct}%</Badge>
          </CardHeader>
          <CardContent>
            <Progress value={progressPct} />
            <p className="mt-3 text-sm text-muted-foreground">
              {nextRewardAt - metrics.points > 0
                ? `${nextRewardAt - metrics.points} more points until your next badge.`
                : "Reward unlocked — claim it on your profile."}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <GameCard
                title="Memory match"
                points={50}
                href="/games/memory"
                emoji="🧠"
              />
              <GameCard title="Quick quiz" points={75} href="/games" emoji="❓" disabled />
              <GameCard title="Reaction" points={40} href="/games" emoji="⚡" disabled />
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle>Live activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GameCard({
  title,
  points,
  href,
  emoji,
  disabled,
}: {
  title: string;
  points: number;
  href: string;
  emoji: string;
  disabled?: boolean;
}) {
  const inner = (
    <div
      className={`flex h-full flex-col justify-between rounded-2xl border bg-card/60 p-4 transition-colors ${
        disabled ? "opacity-60" : "hover:bg-accent"
      }`}
    >
      <div className="text-2xl">{emoji}</div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">+{points} pts</p>
        {disabled && (
          <Badge variant="secondary" className="mt-2">
            Coming soon
          </Badge>
        )}
      </div>
    </div>
  );
  return disabled ? inner : <Link href={href}>{inner}</Link>;
}
