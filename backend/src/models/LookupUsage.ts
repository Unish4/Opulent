import { Schema, model, type Document } from "mongoose";

export interface ILookupUsage extends Document {
  provider: string;
  date: string;
  count: number;
}

const lookupUsageSchema = new Schema<ILookupUsage>(
  {
    provider: { type: String, required: true },
    date: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

lookupUsageSchema.index({ provider: 1, date: 1 }, { unique: true });

export const LookupUsage = model<ILookupUsage>(
  "LookupUsage",
  lookupUsageSchema,
);
