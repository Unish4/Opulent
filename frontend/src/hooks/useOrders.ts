import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../services/api";
import type {
  CreateOrderPayload,
  CustomerRefund,
  OrderDetailDto,
  OrderDto,
  OrderListResult,
} from "../types/order";
import type { RefundReason } from "../types/refund";

const ACTIVE_STATUSES = [
  "pending_payment",
  "awaiting_review",
  "processing",
  "on_hold",
];

export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: {
      payload: CreateOrderPayload;
      idempotencyKey: string;
    }): Promise<OrderDto> =>
      api
        .post("/orders", input.payload, {
          headers: { "Idempotency-Key": input.idempotencyKey },
        })
        .then((res) => res.data.data),
  });
}

export function useOrder(reference: string | undefined) {
  return useQuery<OrderDetailDto>({
    queryKey: ["order", reference],
    queryFn: () => api.get(`/orders/${reference}`).then((res) => res.data.data),
    enabled: !!reference,
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      query.state.data && ACTIVE_STATUSES.includes(query.state.data.status)
        ? 30_000
        : false,
  });
}

export function useMyOrders(group: string, page: number) {
  return useQuery<OrderListResult>({
    queryKey: ["my-orders", group, page],
    queryFn: () =>
      api
        .get("/orders", { params: { group, page, limit: 10 } })
        .then((res) => ({ orders: res.data.data, meta: res.data.meta })),
    placeholderData: keepPreviousData,
  });
}

function useOrderAction(
  reference: string | undefined,
  path: "proof-signal" | "cancel",
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (): Promise<OrderDto> =>
      api.post(`/orders/${reference}/${path}`).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", reference] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
}

export const useSignalProof = (reference: string | undefined) =>
  useOrderAction(reference, "proof-signal");
export const useCancelOrder = (reference: string | undefined) =>
  useOrderAction(reference, "cancel");

export function useRequestRefund(reference: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      reasonCode: RefundReason;
      note: string;
    }): Promise<CustomerRefund> =>
      api
        .post(`/orders/${reference}/refund-request`, input)
        .then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", reference] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
}
