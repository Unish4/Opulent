export type UserRole = "customer" | "operator" | "owner";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  status: "active" | "suspended" | "deleted";
  createdAt: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: "operator" | "owner";
  createdAt: string;
}

export interface TeamData {
  members: CurrentUser[];
  invites: TeamInvite[];
}

export const isAdminRole = (role?: UserRole): boolean =>
  role === "operator" || role === "owner";
