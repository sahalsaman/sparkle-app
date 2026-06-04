import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const MessageSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    attachments: { type: [String], default: [] },
  },
  { timestamps: true }
);

MessageSchema.index({ roomId: 1, createdAt: -1 });

export type MessageDoc = InferSchemaType<typeof MessageSchema> & { _id: string };
export const Message =
  (models.Message as Model<MessageDoc>) ||
  model<MessageDoc>("Message", MessageSchema);
