import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { GAME_TYPES, DIFFICULTIES } from "@/types";

const GameSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: GAME_TYPES, required: true, index: true },
    difficulty: { type: String, enum: DIFFICULTIES, default: "EASY" },
    rewardPoints: { type: Number, default: 50 },
    multiplayer: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
    cover: { type: String, default: "" },
  },
  { timestamps: true }
);

export type GameDoc = InferSchemaType<typeof GameSchema> & { _id: string };
export const Game =
  (models.Game as Model<GameDoc>) || model<GameDoc>("Game", GameSchema);
