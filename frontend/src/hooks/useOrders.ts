import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { CreateOrderPayload, OrderDto } from "../types/order";

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
  });
}
