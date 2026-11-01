import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { LookupUsageData } from "../types/admin";

export function useLookupUsage() {
  return useQuery<LookupUsageData>({
    queryKey: ["admin", "lookup-usage"],
    queryFn: () => api.get("/admin/lookup/usage").then((res) => res.data.data),
    refetchInterval: 60_000,
  });
}

export function useAdjustLookupUsage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      group: string;
      used: number;
    }): Promise<LookupUsageData> =>
      api.patch("/admin/lookup/usage", input).then((res) => res.data.data),
    onSuccess: (data) =>
      queryClient.setQueryData(["admin", "lookup-usage"], data),
  });
}
