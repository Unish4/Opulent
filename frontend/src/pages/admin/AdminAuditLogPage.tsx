import { useState } from "react";
import { useSearchParams } from "react-router";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Pagination from "../../components/Pagination";
import { Badge, Card, Input, Select, Skeleton } from "../../components/ui";
import { useAuditLogs } from "../../hooks/useAuditLogs";
import { cn } from "../../utils/cn";
import { formatDateTime } from "../../utils/time";

const ACTIONS = [
  "user_role_changed",
  "admin_invite_created",
  "admin_invite_revoked",
  "admin_invite_accepted",
  "owner_bootstrapped",
  "game_created",
  "game_updated",
  "game_published",
  "game_unpublished",
  "game_availability_changed",
  "package_created",
  "package_updated",
  "package_price_changed",
  "package_availability_changed",
  "order_payment_confirmed",
  "order_payment_rejected",
  "order_held",
  "order_hold_released",
  "order_completed",
  "order_failed",
  "order_retried",
  "order_cancelled",
  "order_claim_reassigned",
  "order_reopened",
  "refund_requested",
  "refund_approved",
  "refund_denied",
  "refund_paid_out",
  "user_status_changed",
  "payment_config_changed",
  "lookup_usage_adjusted",
  "order_credential_revealed",
];

const label = (action: string): string => action.replace(/_/g, " ");

export default function AdminAuditLogPage() {
  const [params, setParams] = useSearchParams();
  const action = params.get("action") ?? "";
  const reference = params.get("reference") ?? "";
  const dateFrom = params.get("dateFrom") ?? "";
  const dateTo = params.get("dateTo") ?? "";
  const page = Number(params.get("page") ?? 1) || 1;
  const [referenceInput, setReferenceInput] = useState(reference);

  const update = (
    patch: Record<string, string | undefined>,
    resetPage = true,
  ) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) next.delete("page");
    setParams(next);
  };

  const referenceValid = /^OP-[A-HJ-NP-Z2-9]{8}$/.test(
    referenceInput.trim().toUpperCase(),
  );

  const { data, isLoading, isError, error, refetch, isPlaceholderData } =
    useAuditLogs({
      action: action || undefined,
      reference: reference || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: 25,
    });
  const totalPages = data ? Math.ceil(data.meta.total / data.meta.limit) : 0;

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Audit log</h1>
        <p className="mt-1 text-sm text-secondary">
          A read-only record of admin actions. Entries cannot be edited or
          deleted.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Select
          aria-label="Action"
          value={action}
          onChange={(e) => update({ action: e.target.value || undefined })}
        >
          <option value="">All actions</option>
          {ACTIONS.map((item) => (
            <option key={item} value={item}>
              {label(item)}
            </option>
          ))}
        </Select>
        <Input
          aria-label="Order ID"
          placeholder="Order ID, e.g. OP-ABCD2345"
          value={referenceInput}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            setReferenceInput(value);
            if (value.trim() === "") update({ reference: undefined });
            else if (/^OP-[A-HJ-NP-Z2-9]{8}$/.test(value.trim()))
              update({ reference: value.trim() });
          }}
        />
        <Input
          type="date"
          aria-label="From date"
          value={dateFrom}
          onChange={(e) => update({ dateFrom: e.target.value || undefined })}
        />
        <Input
          type="date"
          aria-label="To date"
          value={dateTo}
          onChange={(e) => update({ dateTo: e.target.value || undefined })}
        />
      </div>
      {referenceInput.trim() !== "" && !referenceValid && (
        <p className="text-xs text-muted">
          Enter the full order ID to filter by order.
        </p>
      )}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      )}
      {isError && (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      )}
      {data && data.logs.length === 0 && (
        <EmptyState
          title="No entries"
          description="Nothing matches these filters."
        />
      )}

      <div
        className={cn(
          "space-y-3 transition-opacity",
          isPlaceholderData && "opacity-60",
        )}
      >
        {data?.logs.map((log) => (
          <Card key={log.id} className="space-y-2 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge tone="primary">{label(log.action)}</Badge>
              <span className="text-xs text-muted">
                {formatDateTime(log.createdAt)}
              </span>
            </div>
            <p className="text-sm">
              <span className="font-medium">{log.actorName ?? "System"}</span>
              <span className="text-secondary">
                {" "}
                · {log.targetType}{" "}
                {log.targetId.length > 12
                  ? `…${log.targetId.slice(-6)}`
                  : log.targetId}
              </span>
            </p>
            {log.reason && (
              <p className="text-sm text-amber">Reason: {log.reason}</p>
            )}
            {log.change && (
              <details className="text-xs">
                <summary className="cursor-pointer text-secondary">
                  Details
                </summary>
                <pre className="mt-2 overflow-x-auto rounded-md bg-elevated p-3 font-mono text-xs">
                  {JSON.stringify(log.change, null, 2)}
                </pre>
              </details>
            )}
          </Card>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(next) => update({ page: String(next) }, false)}
      />
    </div>
  );
}
