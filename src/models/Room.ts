import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ROOM_TYPES } from "@/types";

const RoomSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ROOM_TYPES, default: "TEAM" },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    members: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

RoomSchema.index({ companyId: 1, lastMessageAt: -1 });

export type RoomDoc = InferSchemaType<typeof RoomSchema> & { _id: string };
export const Room =
  (models.Room as Model<RoomDoc>) || model<RoomDoc>("Room", RoomSchema);
