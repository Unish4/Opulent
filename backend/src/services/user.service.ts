import { clerkClient } from "@clerk/express";
import { ENV } from "../config/env.js";
import { AdminInvite, type IAdminInvite } from "../models/AdminInvite.js";
import { User, type IUser, type UserRole } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { writeAuditLog } from "./audit.service.js";

const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  err.code === 11000;

export const getOrProvisionUser = async (clerkId: string): Promise<IUser> => {
  const existing = await User.findOne({ clerkId });
  if (existing) return existing;

  const clerkUser = await clerkClient.users.getUser(clerkId);
  const emailObj =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    ) ?? clerkUser.emailAddresses[0];

  const email = emailObj?.emailAddress.toLowerCase() ?? "";
  const emailVerified = emailObj?.verification?.status === "verified";
  const name =
    [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ")
      .slice(0, 80) ||
    clerkUser.username ||
    "Player";
  const phone = clerkUser.phoneNumbers[0]?.phoneNumber;

  let role: UserRole = "customer";
  let invite: IAdminInvite | null = null;
  let bootstrapped = false;

  if (emailVerified && email) {
    if (ENV.OWNER_EMAILS.includes(email)) {
      role = "owner";
      bootstrapped = true;
    } else {
      invite = await AdminInvite.findOne({ email, status: "pending" });
      if (invite) role = invite.role;
    }
  }

  let user: IUser;
  try {
    user = await User.create({ clerkId, email, name, phone, role });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      const raced = await User.findOne({ clerkId });
      if (raced) return raced;
    }
    throw err;
  }

  if (invite) {
    invite.status = "accepted";
    invite.acceptedAt = new Date();
    await invite.save();
    await writeAuditLog({
      actorUserId: user._id,
      action: "admin_invite_accepted",
      targetType: "User",
      targetId: String(user._id),
      change: { role },
    });
  }
  if (bootstrapped) {
    await writeAuditLog({
      actorUserId: user._id,
      action: "owner_bootstrapped",
      targetType: "User",
      targetId: String(user._id),
      change: { role, source: "OWNER_EMAILS" },
    });
  }

  return user;
};

export const assertVerifiedEmail = async (user: IUser): Promise<void> => {
  const clerkUser = await clerkClient.users.getUser(user.clerkId);
  const emailObj =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    ) ?? clerkUser.emailAddresses[0];
  if (emailObj?.verification?.status !== "verified") {
    throw new ApiError(
      409,
      "This account's email is not verified, so it cannot be made an admin.",
    );
  }
};
