import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../services/api";
import type { AdminUserDetail, AdminUsersResult } from "../types/admin";

interface UserFilters {
  q?: string;
  role?: string;
  status?: string;
  page: number;
  limit?: number;
}

export function useAdminUsers(filters: UserFilters) {
  return useQuery<AdminUsersResult>({
    queryKey: ["admin", "users", filters],
    queryFn: () =>
      api
        .get("/admin/users", { params: filters })
        .then((res) => ({ users: res.data.data, meta: res.data.meta })),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(id: string | undefined) {
  return useQuery<AdminUserDetail>({
    queryKey: ["admin", "user", id],
    queryFn: () => api.get(`/admin/users/${id}`).then((res) => res.data.data),
    enabled: !!id,
    retry: false,
  });
}

export function useSetUserStatus(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { status: "active" | "suspended"; reason?: string }) =>
      api
        .patch(`/admin/users/${id}/status`, input)
        .then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
