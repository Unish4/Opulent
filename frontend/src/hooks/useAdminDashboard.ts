import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { DashboardData } from "../types/admin";

export function useAdminDashboard(from: string, to: string) {
  return useQuery<DashboardData>({
    queryKey: ["admin", "dashboard", from, to],
    queryFn: () =>
      api
        .get("/admin/dashboard", { params: { from, to } })
        .then((res) => res.data.data),
    refetchInterval: 60_000,
  });
}

export const downloadReconciliation = async (
  from: string,
  to: string,
): Promise<void> => {
  const res = await api.get("/admin/dashboard/reconciliation.csv", {
    params: { from, to },
    responseType: "blob",
  });
  const url = URL.createObjectURL(res.data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `reconciliation-${from}-to-${to}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
