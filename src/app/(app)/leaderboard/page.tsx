import { Trophy } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initialsFromName, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function loadRanks(companyId: string | null) {
  if (!companyId) return [];
  try {
    await connectDB();
    return await User.find({ companyId })
      .sort({ totalPoints: -1 })
      .limit(50)
      .lean<
        Array<{ _id: { toString(): string }; name: string; avatar?: string; totalPoints: number; streak?: number }>
      >();
  } catch {
    return [];
  }
}

export default async function LeaderboardPage() {
  const session = await auth();
  const me = session!.user.id;
  const rows = await loadRanks(session?.user.companyId ?? null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Trophy className="h-7 w-7 text-amber-500" /> Leaderboard
        </h1>
        <p className="text-muted-foreground">Top 50 across your company. Updated live.</p>
      </div>

      <Card glass>
        <CardContent className="space-y-2 p-4">
          {rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No scores yet. Be the first — play a game!
            </p>
          ) : (
            rows.map((row, i) => {
              const isMe = row._id.toString() === me;
              const rank = i + 1;
              return (
                <div
                  key={row._id.toString()}
                  className={`flex items-center justify-between rounded-2xl border bg-card/50 px-4 py-3 ${
                    isMe ? "ring-1 ring-primary/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-xl text-sm font-semibold ${
                        rank === 1
                          ? "bg-amber-500/15 text-amber-500"
                          : rank === 2
                          ? "bg-zinc-400/15 text-zinc-400"
                          : rank === 3
                          ? "bg-orange-500/15 text-orange-500"
                          : "bg-secondary"
                      }`}
                    >
                      {rank}
                    </span>
                    <Avatar className="h-9 w-9">
                      {row.avatar && <AvatarImage src={row.avatar} alt={row.name} />}
                      <AvatarFallback>{initialsFromName(row.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {row.name} {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                      </p>
                      {row.streak ? (
                        <p className="text-xs text-muted-foreground">🔥 {row.streak}-day streak</p>
                      ) : null}
                    </div>
                  </div>
                  <Badge variant="gradient">{formatNumber(row.totalPoints)} pts</Badge>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
