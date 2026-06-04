import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { NOTIFICATION_TYPES } from "@/types";

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    type: { type: String, enum: NOTIFICATION_TYPES, default: "SYSTEM" },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, default: "" },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export type NotificationDoc = InferSchemaType<typeof NotificationSchema> & { _id: string };
export const Notification =
  (models.Notification as Model<NotificationDoc>) ||
  model<NotificationDoc>("Notification", NotificationSchema);
