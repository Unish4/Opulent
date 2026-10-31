import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { PaymentConfig } from "../types/payment";

export function usePaymentConfig(enabled: boolean) {
  return useQuery<PaymentConfig>({
    queryKey: ["payment-config"],
    queryFn: () => api.get("/payment/config").then((res) => res.data.data),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
