import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { CreateOrderPayload, OrderDto } from "../types/order";

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
  return useQuery<OrderDto>({
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

function useOrderAction(
  reference: string | undefined,
  path: "proof-signal" | "cancel",
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (): Promise<OrderDto> =>
      api.post(`/orders/${reference}/${path}`).then((res) => res.data.data),
    onSuccess: (order) => queryClient.setQueryData(["order", reference], order),
  });
}

export const useSignalProof = (reference: string | undefined) =>
  useOrderAction(reference, "proof-signal");
export const useCancelOrder = (reference: string | undefined) =>
  useOrderAction(reference, "cancel");
