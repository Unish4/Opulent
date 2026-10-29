import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { TeamData, UserRole } from "../types/user";

const TEAM_KEY = ["admin", "team"];

export function useTeam() {
  return useQuery<TeamData>({
    queryKey: TEAM_KEY,
    queryFn: () => api.get("/admin/team").then((res) => res.data.data),
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; role: "operator" | "owner" }) =>
      api.post("/admin/team/invitations", input).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEAM_KEY }),
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) =>
      api.delete(`/admin/team/invitations/${inviteId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEAM_KEY }),
  });
}

export function useSetMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; role: UserRole; reason?: string }) =>
      api
        .patch(`/admin/team/members/${input.userId}/role`, {
          role: input.role,
          reason: input.reason,
        })
        .then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEAM_KEY }),
  });
}
