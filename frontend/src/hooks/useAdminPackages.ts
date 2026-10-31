import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { AdminPackage, PackagePayload } from "../types/package";

export function useAdminPackages(gameId: string | undefined) {
  return useQuery<AdminPackage[]>({
    queryKey: ["admin", "packages", gameId],
    queryFn: () =>
      api.get(`/admin/games/${gameId}/packages`).then((res) => res.data.data),
    enabled: !!gameId,
  });
}

function useInvalidatePackages(gameId: string | undefined) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin", "packages", gameId],
      }),
      queryClient.invalidateQueries({ queryKey: ["packages"] }),
    ]);
}

export function useCreatePackage(gameId: string | undefined) {
  const invalidate = useInvalidatePackages(gameId);
  return useMutation({
    mutationFn: (payload: PackagePayload): Promise<AdminPackage> =>
      api
        .post(`/admin/games/${gameId}/packages`, payload)
        .then((res) => res.data.data),
    onSuccess: invalidate,
  });
}

export function useUpdatePackage(gameId: string | undefined) {
  const invalidate = useInvalidatePackages(gameId);
  return useMutation({
    mutationFn: (input: {
      id: string;
      payload: PackagePayload;
    }): Promise<AdminPackage> =>
      api
        .patch(`/admin/packages/${input.id}`, input.payload)
        .then((res) => res.data.data),
    onSuccess: invalidate,
  });
}

export function useSetPackageAvailability(gameId: string | undefined) {
  const invalidate = useInvalidatePackages(gameId);
  return useMutation({
    mutationFn: (input: {
      id: string;
      isAvailable: boolean;
    }): Promise<AdminPackage> =>
      api
        .patch(`/admin/packages/${input.id}/availability`, {
          isAvailable: input.isAvailable,
        })
        .then((res) => res.data.data),
    onSuccess: invalidate,
  });
}
