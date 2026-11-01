import { Schema, model, type Document } from "mongoose";

export interface ILookupCache extends Document {
  key: string;
  playerName: string;
  level: number | null;
  region: string | null;
  expiresAt: Date;
}

const lookupCacheSchema = new Schema<ILookupCache>({
  key: { type: String, required: true, unique: true },
  playerName: { type: String, required: true },
  level: { type: Number, default: null },
  region: { type: String, default: null },
  expiresAt: { type: Date, required: true },
});

lookupCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const LookupCache = model<ILookupCache>(
  "LookupCache",
  lookupCacheSchema,
);
