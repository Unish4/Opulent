import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../services/api";
import type {
  AdminAction,
  AdminOrderDetail,
  AdminOrdersResult,
} from "../types/adminOrder";

export interface OrderFilters {
  status?: string;
  assignee?: string;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit?: number;
}

const ACTION_PATHS: Record<AdminAction, string> = {
  confirmPayment: "confirm-payment",
  rejectPayment: "reject-payment",
  hold: "hold",
  releaseHold: "release-hold",
  complete: "complete",
  fail: "fail",
  retry: "retry",
  cancelByAdmin: "cancel",
  reassignClaim: "reassign",
  reopen: "reopen",
};

export function useAdminOrders(filters: OrderFilters) {
  return useQuery<AdminOrdersResult>({
    queryKey: ["admin", "orders", filters],
    queryFn: () =>
      api
        .get("/admin/orders", { params: filters })
        .then((res) => ({ orders: res.data.data, meta: res.data.meta })),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}

export function useAdminOrderSummary() {
  return useQuery<Record<string, number>>({
    queryKey: ["admin", "orders-summary"],
    queryFn: () =>
      api.get("/admin/orders/summary").then((res) => res.data.data),
    refetchInterval: 30_000,
  });
}

export function useAdminOrder(id: string | undefined) {
  return useQuery<AdminOrderDetail>({
    queryKey: ["admin", "order", id],
    queryFn: () => api.get(`/admin/orders/${id}`).then((res) => res.data.data),
    enabled: !!id,
    retry: false,
    refetchInterval: 30_000,
  });
}

export function useAdminOrderAction(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      action: AdminAction;
      body?: object;
    }): Promise<AdminOrderDetail> =>
      api
        .post(
          `/admin/orders/${id}/${ACTION_PATHS[input.action]}`,
          input.body ?? {},
        )
        .then((res) => res.data.data),
    onSuccess: (order) => {
      queryClient.setQueryData(["admin", "order", id], order);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders-summary"] });
    },
  });
}
