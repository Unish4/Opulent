import { AdminInvite } from "../models/AdminInvite.js";
import { User, type IUser, type UserRole } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { writeAuditLog } from "./audit.service.js";
import { assertVerifiedEmail } from "./user.service.js";

interface Context {
  actor: IUser;
  requestId: string;
}

export const listTeam = async () => {
  const [members, invites] = await Promise.all([
    User.find({
      role: { $in: ["operator", "owner"] },
      status: { $ne: "deleted" },
    }).sort({
      createdAt: 1,
    }),
    AdminInvite.find({ status: "pending" }).sort({ createdAt: -1 }),
  ]);
  return { members, invites };
};

export const inviteMember = async (
  { actor, requestId }: Context,
  input: { email: string; role: "operator" | "owner" },
) => {
  const email = input.email.toLowerCase();

  const existing = await User.findOne({ email, status: "active" });
  if (existing) {
    if (existing.role !== "customer") {
      throw new ApiError(409, "This person is already on the admin team.");
    }
    await assertVerifiedEmail(existing);
    existing.role = input.role;
    await existing.save();
    await writeAuditLog({
      actorUserId: actor._id,
      action: "user_role_changed",
      targetType: "User",
      targetId: String(existing._id),
      change: { before: "customer", after: input.role, via: "invite" },
      requestId,
    });
    return { kind: "promoted" as const, userId: String(existing._id) };
  }

  const invite = await AdminInvite.create({
    email,
    role: input.role,
    invitedBy: actor._id,
  });
  await writeAuditLog({
    actorUserId: actor._id,
    action: "admin_invite_created",
    targetType: "AdminInvite",
    targetId: String(invite._id),
    change: { email, role: input.role },
    requestId,
  });
  return { kind: "invited" as const, inviteId: String(invite._id) };
};

export const revokeInvite = async (
  { actor, requestId }: Context,
  inviteId: string,
) => {
  const invite = await AdminInvite.findOneAndUpdate(
    { _id: inviteId, status: "pending" },
    { status: "revoked" },
    { new: true },
  );
  if (!invite) throw new ApiError(404, "Invite not found");
  await writeAuditLog({
    actorUserId: actor._id,
    action: "admin_invite_revoked",
    targetType: "AdminInvite",
    targetId: String(invite._id),
    change: { email: invite.email },
    requestId,
  });
};

export const setMemberRole = async (
  { actor, requestId }: Context,
  userId: string,
  role: UserRole,
  reason?: string,
) => {
  if (String(actor._id) === userId) {
    throw new ApiError(409, "You cannot change your own role.");
  }

  const target = await User.findById(userId);
  if (!target || target.status !== "active")
    throw new ApiError(404, "User not found");
  if (target.role === role) return target;

  if (target.role === "owner") {
    const owners = await User.countDocuments({
      role: "owner",
      status: "active",
    });
    if (owners <= 1)
      throw new ApiError(409, "There must always be at least one owner.");
  }
  if (target.role === "customer") await assertVerifiedEmail(target);

  const updated = await User.findOneAndUpdate(
    { _id: target._id, role: target.role },
    { role },
    { new: true },
  );
  if (!updated)
    throw new ApiError(
      409,
      "This user was changed by someone else. Reload and retry.",
    );

  await writeAuditLog({
    actorUserId: actor._id,
    action: "user_role_changed",
    targetType: "User",
    targetId: String(target._id),
    reason,
    change: { before: target.role, after: role },
    requestId,
  });
  return updated;
};
