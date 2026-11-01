import { Schema, model, type Document } from "mongoose";

export interface ILookupUsage extends Document {
  quotaKey: string;
  period: string;
  count: number;
}

const lookupUsageSchema = new Schema<ILookupUsage>(
  {
    quotaKey: { type: String, required: true },
    period: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

lookupUsageSchema.index({ quotaKey: 1, period: 1 }, { unique: true });

export const LookupUsage = model<ILookupUsage>(
  "LookupUsage",
  lookupUsageSchema,
);
