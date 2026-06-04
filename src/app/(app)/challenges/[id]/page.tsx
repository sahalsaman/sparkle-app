import { notFound } from "next/navigation";
import { Calendar, Trophy } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Challenge } from "@/models/Challenge";
import { ChallengeSubmission } from "@/models/ChallengeSubmission";
import { User } from "@/models/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isCloudinaryEnabled } from "@/lib/cloudinary";
import { SubmissionGrid } from "@/components/challenges/submission-grid";
import { SubmitForm } from "@/components/challenges/submit-form";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function ChallengeDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  if (!/^[0-9a-f]{24}$/i.test(id)) notFound();
  const session = await auth();

  await connectDB();
  const challenge = await Challenge.findById(id).lean<{
    _id: { toString(): string };
    title: string;
    description: string;
    type: string;
    cover?: string;
    companyId: { toString(): string };
    startDate: Date;
    endDate: Date;
    rewardPoints: number;
    active: boolean;
  } | null>();
  if (!challenge) notFound();
  if (challenge.companyId.toString() !== (session?.user.companyId ?? "")) notFound();

  const subsRaw = await ChallengeSubmission.find({ challengeId: id })
    .sort({ voteCount: -1, createdAt: -1 })
    .lean<
      Array<{
        _id: { toString(): string };
        userId: { toString(): string };
        media: string;
        caption: string;
        votes: Array<{ toString(): string }>;
        voteCount: number;
        createdAt: Date;
      }>
    >();

  const userIds = Array.from(new Set(subsRaw.map((s) => s.userId.toString())));
  const users = await User.find({ _id: { $in: userIds } })
    .select("name avatar")
    .lean<Array<{ _id: { toString(): string }; name: string; avatar?: string }>>();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const submissions = subsRaw.map((s) => ({
    id: s._id.toString(),
    media: s.media,
    caption: s.caption,
    voteCount: s.voteCount,
    votedByMe: s.votes.some((v) => v.toString() === session?.user.id),
    isMine: s.userId.toString() === session?.user.id,
    user: userMap.get(s.userId.toString()) ?? { name: "Unknown" },
  }));

  const ended = new Date(challenge.endDate).getTime() < Date.now();
  const alreadySubmitted = submissions.some((s) => s.isMine);

  return (
    <div className="space-y-8">
      <Card glass className="overflow-hidden">
        {challenge.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={challenge.cover} alt="" className="h-48 w-full object-cover" />
        )}
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary">{challenge.type}</Badge>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> ends {new Date(challenge.endDate).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <Trophy className="h-3 w-3 text-amber-500" /> {challenge.rewardPoints} pts
              </span>
            </div>
          </div>
          <CardTitle className="mt-2 text-2xl">{challenge.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {challenge.description && (
            <p className="text-sm text-muted-foreground">{challenge.description}</p>
          )}
          {!ended && !alreadySubmitted && (
            <SubmitForm
              challengeId={id}
              cloudinaryEnabled={isCloudinaryEnabled()}
              requiresMedia={challenge.type === "PHOTO" || challenge.type === "VIDEO"}
            />
          )}
          {alreadySubmitted && (
            <p className="text-xs text-muted-foreground">You&apos;ve already submitted to this challenge.</p>
          )}
          {ended && <p className="text-xs text-muted-foreground">This challenge has ended.</p>}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Submissions ({submissions.length})
        </h2>
        <SubmissionGrid submissions={submissions} />
      </section>
    </div>
  );
}
