import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const GameSessionSchema = new Schema(
  {
    gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    score: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    pointsAwarded: { type: Number, default: 0 },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

GameSessionSchema.index({ userId: 1, createdAt: -1 });
GameSessionSchema.index({ score: -1 });

export type GameSessionDoc = InferSchemaType<typeof GameSessionSchema> & { _id: string };
export const GameSession =
  (models.GameSession as Model<GameSessionDoc>) ||
  model<GameSessionDoc>("GameSession", GameSessionSchema);
