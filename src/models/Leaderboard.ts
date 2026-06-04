import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const LeaderboardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    totalPoints: { type: Number, default: 0, index: true },
    rank: { type: Number, default: 0 },
    period: { type: String, enum: ["ALL_TIME", "WEEKLY", "MONTHLY"], default: "ALL_TIME" },
  },
  { timestamps: true }
);

LeaderboardSchema.index(
  { companyId: 1, period: 1, userId: 1 },
  { unique: true }
);
LeaderboardSchema.index({ companyId: 1, period: 1, totalPoints: -1 });

export type LeaderboardDoc = InferSchemaType<typeof LeaderboardSchema> & { _id: string };
export const Leaderboard =
  (models.Leaderboard as Model<LeaderboardDoc>) ||
  model<LeaderboardDoc>("Leaderboard", LeaderboardSchema);
