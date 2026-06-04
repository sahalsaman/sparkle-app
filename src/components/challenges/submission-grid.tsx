"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsFromName } from "@/lib/utils";
import { toggleVote } from "@/app/actions/challenges";

export type SubmissionRow = {
  id: string;
  media: string;
  caption: string;
  voteCount: number;
  votedByMe: boolean;
  isMine: boolean;
  user: { name: string; avatar?: string };
};

export function SubmissionGrid({ submissions }: { submissions: SubmissionRow[] }) {
  if (submissions.length === 0) {
    return (
      <Card glass>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          No submissions yet — be the first!
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {submissions.map((s) => (
        <SubmissionCard key={s.id} s={s} />
      ))}
    </div>
  );
}

function SubmissionCard({ s }: { s: SubmissionRow }) {
  const [pending, start] = useTransition();
  return (
    <Card glass className="overflow-hidden">
      {s.media && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.media} alt="" className="h-48 w-full object-cover" />
      )}
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {s.user.avatar && <AvatarImage src={s.user.avatar} alt={s.user.name} />}
            <AvatarFallback>{initialsFromName(s.user.name)}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium">{s.user.name}</p>
        </div>
        {s.caption && <p className="text-sm text-muted-foreground">{s.caption}</p>}
        <button
          type="button"
          disabled={pending || s.isMine}
          onClick={() => start(() => toggleVote(s.id))}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors ${
            s.votedByMe ? "bg-primary/10 text-primary" : "hover:bg-accent"
          } disabled:opacity-50`}
        >
          <Heart className={s.votedByMe ? "fill-current" : ""} />
          {s.voteCount}
        </button>
      </CardContent>
    </Card>
  );
}
