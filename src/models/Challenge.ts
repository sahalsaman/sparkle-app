import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { CHALLENGE_TYPES } from "@/types";

const ChallengeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: CHALLENGE_TYPES, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cover: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rewardPoints: { type: Number, default: 100 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ChallengeSchema.index({ endDate: -1 });

export type ChallengeDoc = InferSchemaType<typeof ChallengeSchema> & { _id: string };
export const Challenge =
  (models.Challenge as Model<ChallengeDoc>) ||
  model<ChallengeDoc>("Challenge", ChallengeSchema);
