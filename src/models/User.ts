import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ROLES } from "@/types";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, select: false },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ROLES, default: "USER", index: true },
    totalPoints: { type: Number, default: 0, index: true },
    streak: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
    fcmTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

UserSchema.index({ totalPoints: -1 });

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string };
export const User =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
