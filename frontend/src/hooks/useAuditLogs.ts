import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { AuditLogsResult } from "../types/admin";

interface AuditFilters {
  action?: string;
  reference?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit?: number;
}

export function useAuditLogs(filters: AuditFilters) {
  return useQuery<AuditLogsResult>({
    queryKey: ["admin", "audit-logs", filters],
    queryFn: () =>
      api
        .get("/admin/audit-logs", { params: filters })
        .then((res) => ({ logs: res.data.data, meta: res.data.meta })),
    placeholderData: keepPreviousData,
  });
}
