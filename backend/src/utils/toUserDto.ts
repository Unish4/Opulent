import type { IUser } from "../models/User.js";

export const toUserDto = (user: IUser) => ({
  id: String(user._id),
  email: user.email,
  name: user.name,
  phone: user.phone ?? null,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
});
