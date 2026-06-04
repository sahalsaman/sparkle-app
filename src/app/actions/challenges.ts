"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Challenge } from "@/models/Challenge";
import { ChallengeSubmission } from "@/models/ChallengeSubmission";
import { Notification } from "@/models/Notification";
import { emitToUser } from "@/lib/socket-server";

const submitSchema = z.object({
  challengeId: z.string().length(24),
  media: z.string().url().optional().or(z.literal("")),
  caption: z.string().max(280).optional().default(""),
});

export async function submitToChallenge(input: {
  challengeId: string;
  media: string;
  caption: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid submission");

  await connectDB();
  const challenge = await Challenge.findById(parsed.data.challengeId).lean<{
    _id: { toString(): string };
    title: string;
    companyId: { toString(): string };
    endDate: Date;
    active: boolean;
  } | null>();
  if (!challenge || !challenge.active) throw new Error("Challenge not found");
  if (challenge.companyId.toString() !== (session.user.companyId ?? ""))
    throw new Error("Wrong company");
  if (new Date(challenge.endDate).getTime() < Date.now())
    throw new Error("Challenge ended");

  await ChallengeSubmission.create({
    challengeId: parsed.data.challengeId,
    userId: session.user.id,
    media: parsed.data.media,
    caption: parsed.data.caption,
  });

  revalidatePath(`/challenges/${parsed.data.challengeId}`);
  revalidatePath("/challenges");
}

export async function toggleVote(submissionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!/^[0-9a-f]{24}$/i.test(submissionId)) throw new Error("Invalid id");

  await connectDB();
  const uid = new mongoose.Types.ObjectId(session.user.id);
  const sub = await ChallengeSubmission.findById(submissionId).select(
    "votes userId challengeId"
  );
  if (!sub) throw new Error("Not found");
  const has = sub.votes.some((v) => v.toString() === uid.toString());
  if (has) {
    sub.votes = sub.votes.filter((v) => v.toString() !== uid.toString());
  } else {
    sub.votes.push(uid);
    if (sub.userId.toString() !== session.user.id) {
      const notif = await Notification.create({
        userId: sub.userId,
        title: "Someone liked your challenge entry",
        body: `${session.user.name ?? "A teammate"} voted for your submission.`,
        type: "CHALLENGE",
        link: `/challenges/${sub.challengeId.toString()}`,
      });
      emitToUser(sub.userId.toString(), "notification:new", {
        _id: notif._id.toString(),
        title: notif.title,
        body: notif.body,
        type: notif.type,
        link: notif.link,
        createdAt: notif.createdAt,
      });
    }
  }
  sub.voteCount = sub.votes.length;
  await sub.save();
  revalidatePath(`/challenges/${sub.challengeId.toString()}`);
}
