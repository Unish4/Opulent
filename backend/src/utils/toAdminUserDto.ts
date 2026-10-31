import type { IUser } from "../models/User.js";

export const toAdminUserListItem = (user: IUser, ordersCount: number) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone ?? null,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  ordersCount,
});
