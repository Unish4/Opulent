import type { Request, Response } from "express";
import {
  inviteMember,
  listTeam,
  revokeInvite,
  setMemberRole,
} from "../services/team.service.js";
import { toUserDto } from "../utils/toUserDto.js";

const context = (req: Request) => ({
  actor: req.appUser!,
  requestId: String(req.id),
});

export const getTeam = async (_req: Request, res: Response) => {
  const { members, invites } = await listTeam();
  res.status(200).json({
    data: {
      members: members.map(toUserDto),
      invites: invites.map((i) => ({
        id: String(i._id),
        email: i.email,
        role: i.role,
        createdAt: i.createdAt,
      })),
    },
  });
};

export const createInvite = async (req: Request, res: Response) => {
  const result = await inviteMember(context(req), req.body);
  res.status(201).json({ data: result });
};

export const deleteInvite = async (req: Request, res: Response) => {
  await revokeInvite(context(req), String(req.params.id));
  res.status(200).json({ data: { revoked: true } });
};

export const updateMemberRole = async (req: Request, res: Response) => {
  const { role, reason } = req.body as {
    role: "customer" | "operator" | "owner";
    reason?: string;
  };
  const user = await setMemberRole(
    context(req),
    String(req.params.id),
    role,
    reason,
  );
  res.status(200).json({ data: toUserDto(user) });
};
