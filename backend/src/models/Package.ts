import { Schema, model, type Document, type Types } from "mongoose";

export const PACKAGE_TYPES = ["topup", "pass", "bundle"] as const;
export type PackageType = (typeof PACKAGE_TYPES)[number];

export interface IPackage extends Document {
  gameId: Types.ObjectId;
  group: string;
  name: string;
  type: PackageType;
  description?: string;
  badge?: string;
  pricePaisa: number;
  costPaisa?: number;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>(
  {
    gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true },
    group: { type: String, required: true, trim: true, maxlength: 40 },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, enum: PACKAGE_TYPES, default: "topup" },
    description: { type: String, trim: true, maxlength: 120 },
    badge: { type: String, trim: true, maxlength: 20 },
    pricePaisa: {
      type: Number,
      required: true,
      validate: {
        validator: (value: number) =>
          Number.isSafeInteger(value) && value > 0 && value <= 10_000_000,
        message:
          "Price must be a positive whole number of paisa, up to Rs 100,000",
      },
    },
    costPaisa: {
      type: Number,
      validate: {
        validator: (value: number) =>
          Number.isSafeInteger(value) && value >= 0 && value <= 10_000_000,
        message: "Cost must be a whole number of paisa, up to Rs 100,000",
      },
    },
    isAvailable: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

packageSchema.index({ gameId: 1, sortOrder: 1 });
packageSchema.index({ gameId: 1, name: 1 }, { unique: true });

export const Package = model<IPackage>("Package", packageSchema);
