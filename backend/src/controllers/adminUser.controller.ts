import type { Request, Response } from "express";
import {
  getUserDetail,
  listUsers,
  setUserStatus,
} from "../services/adminUser.service.js";
import { getContext } from "../utils/requestContext.js";
import { toAdminUserListItem } from "../utils/toAdminUserDto.js";
import type {
  ListUsersQuery,
  SetUserStatusBody,
} from "../validators/adminUser.validator.js";

export const listUsersHandler = async (_req: Request, res: Response) => {
  const query = res.locals.query as ListUsersQuery;
  const { users, total } = await listUsers(query);
  res
    .status(200)
    .json({
      data: users,
      meta: { page: query.page, limit: query.limit, total },
    });
};

export const getUserHandler = async (req: Request, res: Response) => {
  res.status(200).json({ data: await getUserDetail(String(req.params.id)) });
};

export const setUserStatusHandler = async (req: Request, res: Response) => {
  const { status, reason } = req.body as SetUserStatusBody;
  const user = await setUserStatus(
    getContext(req),
    String(req.params.id),
    status,
    reason,
  );
  res.status(200).json({ data: toAdminUserListItem(user, 0) });
};
