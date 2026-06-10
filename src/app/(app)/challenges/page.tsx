import Link from "next/link";
import { Flame, Calendar, Trophy } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Challenge } from "@/models/Challenge";
import { ChallengeSubmission } from "@/models/ChallengeSubmission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type ChallengeRow = {
  _id: { toString(): string };
  title: string;
  description: string;
  type: string;
  cover?: string;
  startDate: Date;
  endDate: Date;
  rewardPoints: number;
};

async function loadChallenges() {
  try {
    await connectDB();
    const now = new Date();
    const [active, past, counts] = await Promise.all([
      Challenge.find({ active: true, endDate: { $gte: now } })
        .sort({ endDate: 1 })
        .lean<ChallengeRow[]>(),
      Challenge.find({ endDate: { $lt: now } })
        .sort({ endDate: -1 })
        .limit(8)
        .lean<ChallengeRow[]>(),
      ChallengeSubmission.aggregate<{ _id: { toString(): string }; count: number }>([
        { $group: { _id: "$challengeId", count: { $sum: 1 } } },
      ]),
    ]);
    const map: Record<string, number> = {};
    for (const c of counts) map[c._id.toString()] = c.count;
    return { active, past, counts: map };
  } catch {
    return { active: [], past: [], counts: {} };
  }
}

function daysLeft(end: Date) {
  const ms = new Date(end).getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const days = Math.ceil(ms / 86_400_000);
  return days === 1 ? "1 day left" : `${days} days left`;
}

export default async function ChallengesPage() {
  await auth();
  const { active, past, counts } = await loadChallenges();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Flame className="h-7 w-7 text-primary" /> Challenges
        </h1>
        <p className="text-muted-foreground">Weekly photo, video and activity challenges for everyone.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Active ({active.length})
        </h2>
        {active.length === 0 ? (
          <Card glass>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No active challenges. The admin can create one in the admin panel.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {active.map((c) => (
              <ChallengeCard key={c._id.toString()} c={c} count={counts[c._id.toString()] ?? 0} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Past</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {past.map((c) => (
              <ChallengeCard key={c._id.toString()} c={c} count={counts[c._id.toString()] ?? 0} ended />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ChallengeCard({ c, count, ended }: { c: ChallengeRow; count: number; ended?: boolean }) {
  return (
    <Link href={`/challenges/${c._id.toString()}`}>
      <Card glass className="h-full overflow-hidden transition-transform hover:-translate-y-0.5">
        {c.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.cover} alt="" className="h-32 w-full object-cover" />
        )}
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{c.type}</Badge>
            <Badge variant={ended ? "secondary" : "gradient"}>{daysLeft(c.endDate)}</Badge>
          </div>
          <CardTitle className="mt-2">{c.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">{c.description || "—"}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {new Date(c.endDate).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <Trophy className="h-3 w-3 text-amber-500" /> {c.rewardPoints} pts
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{count} submission{count === 1 ? "" : "s"}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
