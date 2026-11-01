import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Pagination from "../../components/Pagination";
import SearchInput from "../../components/SearchInput";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import { Badge, Card, Input, Select, Skeleton } from "../../components/ui";
import {
  useAdminOrderSummary,
  useAdminOrders,
} from "../../hooks/useAdminOrders";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../utils/cn";
import { formatNpr } from "../../utils/money";
import { timeAgo } from "../../utils/time";

const TABS: { key: string; label: string }[] = [
  { key: "awaiting_review", label: "Needs review" },
  { key: "pending_payment", label: "Unpaid" },
  { key: "processing", label: "Processing" },
  { key: "on_hold", label: "On hold" },
  { key: "failed", label: "Failed" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

export default function AdminOrdersPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "awaiting_review";
  const assignee = params.get("assignee") ?? "";
  const dateFrom = params.get("dateFrom") ?? "";
  const dateTo = params.get("dateTo") ?? "";
  const page = Number(params.get("page") ?? 1) || 1;
  const q = params.get("q") ?? "";

  const [qInput, setQInput] = useState(q);
  const debouncedQ = useDebounce(qInput.trim(), 400);

  const update = useCallback(
    (patch: Record<string, string | undefined>, resetPage = true) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(patch)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        if (resetPage) next.delete("page");
        return next;
      });
    },
    [setParams],
  );

  useEffect(() => {
    if (debouncedQ !== q) update({ q: debouncedQ || undefined });
  }, [debouncedQ, q, update]);

  const { data, isLoading, isError, error, refetch, isPlaceholderData } =
    useAdminOrders({
      status: status === "all" ? undefined : status,
      assignee: assignee || undefined,
      q: q || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: 20,
    });
  const { data: summary } = useAdminOrderSummary();
  const totalPages = data ? Math.ceil(data.meta.total / data.meta.limit) : 0;

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="mt-1 text-sm text-secondary">
          Oldest first for open orders. This list refreshes by itself.
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Order status"
      >
        {TABS.map((tab) => {
          const count = tab.key === "all" ? undefined : summary?.[tab.key];
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={status === tab.key}
              onClick={() => update({ status: tab.key })}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                status === tab.key
                  ? "border-primary bg-primary/20 text-primary-hover"
                  : "border-line bg-elevated text-secondary hover:text-fg",
              )}
            >
              {tab.label}
              {count !== undefined && count > 0 && (
                <Badge tone={status === tab.key ? "primary" : "neutral"}>
                  {count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <SearchInput
          className="sm:col-span-2"
          value={qInput}
          onChange={setQInput}
          placeholder="Order ID, player ID or customer email"
          label="Search orders"
        />
        <Select
          aria-label="Assignee"
          value={assignee}
          onChange={(e) => update({ assignee: e.target.value || undefined })}
        >
          <option value="">Any admin</option>
          <option value="me">Claimed by me</option>
          <option value="unclaimed">Unclaimed</option>
        </Select>
        <div className="grid grid-cols-2 gap-2">
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
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}
      {isError && (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      )}
      {data && data.orders.length === 0 && (
        <EmptyState
          title="No orders here"
          description="Nothing matches these filters."
        />
      )}

      <div
        className={cn(
          "space-y-3 transition-opacity",
          isPlaceholderData && "opacity-60",
        )}
      >
        {data?.orders.map((order) => (
          <Link
            key={order.id}
            to={`/admin/orders/${order.id}`}
            className="block"
          >
            <Card className="p-4 transition-colors hover:border-primary">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold">
                    {order.reference}
                  </p>
                  <p className="mt-1 truncate text-sm">
                    {order.gameName}{" "}
                    <span className="text-secondary">
                      · {order.packageName}
                    </span>
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-muted">
                    {order.playerId ?? order.email ?? order.login ?? "-"}
                    {order.serverId ? ` (${order.serverId})` : ""}
                    {order.playerName ? ` · ${order.playerName}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-white font-semibold text-amber">
                    {formatNpr(order.pricePaisa)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {timeAgo(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={order.status} />
                {order.proofSignalAt && order.status === "awaiting_review" && (
                  <Badge tone="primary">Proof signal</Badge>
                )}
                {order.nameUnverified && (
                  <Badge tone="amber">Name not checked</Badge>
                )}
                {order.claimedByName && (
                  <Badge>Claimed: {order.claimedByName}</Badge>
                )}
                <span className="ml-auto text-xs text-muted">
                  {order.customerName}
                </span>
              </div>
            </Card>
          </Link>
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
