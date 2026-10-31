import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../services/api";
import type {
  AdminRefund,
  AdminRefundPayload,
  AdminRefundsResult,
} from "../types/refund";

interface RefundFilters {
  status?: string;
  order?: string;
  page: number;
  limit?: number;
}

export function useAdminRefunds(filters: RefundFilters) {
  return useQuery<AdminRefundsResult>({
    queryKey: ["admin", "refunds", filters],
    queryFn: () =>
      api
        .get("/admin/refunds", { params: filters })
        .then((res) => ({ refunds: res.data.data, meta: res.data.meta })),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}

export function useAdminRefundSummary() {
  return useQuery<Record<string, number>>({
    queryKey: ["admin", "refunds-summary"],
    queryFn: () =>
      api.get("/admin/refunds/summary").then((res) => res.data.data),
    refetchInterval: 30_000,
  });
}

function useInvalidateRefunds() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "refunds-summary"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "order"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
    ]);
}

export function useCreateRefund() {
  const invalidate = useInvalidateRefunds();
  return useMutation({
    mutationFn: (payload: AdminRefundPayload): Promise<AdminRefund> =>
      api.post("/admin/refunds", payload).then((res) => res.data.data),
    onSuccess: invalidate,
  });
}

export function useRefundAction() {
  const invalidate = useInvalidateRefunds();
  return useMutation({
    mutationFn: (input: {
      id: string;
      path: "approve" | "deny" | "mark-paid";
      body?: object;
    }): Promise<AdminRefund> =>
      api
        .post(`/admin/refunds/${input.id}/${input.path}`, input.body ?? {})
        .then((res) => res.data.data),
    onSuccess: invalidate,
  });
}
