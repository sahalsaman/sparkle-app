import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ChallengeSubmissionSchema = new Schema(
  {
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    media: { type: String, default: "" },
    caption: { type: String, default: "" },
    votes: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    voteCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

ChallengeSubmissionSchema.index({ challengeId: 1, voteCount: -1 });

export type ChallengeSubmissionDoc = InferSchemaType<typeof ChallengeSubmissionSchema> & {
  _id: string;
};
export const ChallengeSubmission =
  (models.ChallengeSubmission as Model<ChallengeSubmissionDoc>) ||
  model<ChallengeSubmissionDoc>("ChallengeSubmission", ChallengeSubmissionSchema);
