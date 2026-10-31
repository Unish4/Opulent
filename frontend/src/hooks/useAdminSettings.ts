import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { AdminPaymentConfig } from "../types/admin";

export interface PaymentConfigPayload {
  methodLabel: string;
  recipientName: string;
  qrImageUrl: string;
  whatsappNumber: string;
  instructions: string;
}

export function useAdminPaymentConfig() {
  return useQuery<AdminPaymentConfig | null>({
    queryKey: ["admin", "payment-config"],
    queryFn: () =>
      api.get("/admin/payment-config").then((res) => res.data.data),
  });
}

export function useUpdatePaymentConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentConfigPayload): Promise<AdminPaymentConfig> =>
      api.put("/admin/payment-config", payload).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payment-config"] });
      queryClient.invalidateQueries({ queryKey: ["payment-config"] });
    },
  });
}

export function useUploadPaymentQr() {
  return useMutation({
    mutationFn: (file: File): Promise<{ url: string; publicId: string }> => {
      const form = new FormData();
      form.append("image", file);
      return api
        .post("/admin/uploads/payment-qr", form)
        .then((res) => res.data.data);
    },
  });
}
