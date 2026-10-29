import { Schema, model, type Document } from "mongoose";

export const USER_ROLES = ["customer", "operator", "owner"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["active", "suspended", "deleted"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: [true, "Clerk ID is required"],
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80,
    },
    phone: { type: String, trim: true },
    role: { type: String, enum: USER_ROLES, default: "customer" },
    status: { type: String, enum: USER_STATUSES, default: "active" },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

export const User = model<IUser>("User", userSchema);
