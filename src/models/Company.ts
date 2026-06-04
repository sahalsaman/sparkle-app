import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { PLANS } from "@/types";

const CompanySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: "" },
    plan: { type: String, enum: PLANS, default: "FREE" },
    employeeCount: { type: Number, default: 1 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type CompanyDoc = InferSchemaType<typeof CompanySchema> & { _id: string };
export const Company =
  (models.Company as Model<CompanyDoc>) || model<CompanyDoc>("Company", CompanySchema);
