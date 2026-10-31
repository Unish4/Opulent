import { Link, useSearchParams } from "react-router";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Pagination from "../components/Pagination";
import CustomerStatusBadge from "../components/order/CustomerStatusBadge";
import { Card, Skeleton } from "../components/ui";
import { useMyOrders } from "../hooks/useOrders";
import { cn } from "../utils/cn";
import { formatNpr } from "../utils/money";
import { formatDateTime } from "../utils/time";

const GROUPS = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
];

export default function MyOrdersPage() {
  const [params, setParams] = useSearchParams();
  const group = params.get("group") ?? "active";
  const page = Number(params.get("page") ?? 1) || 1;

  const { data, isLoading, isError, error, refetch, isPlaceholderData } =
    useMyOrders(group, page);
  const totalPages = data ? Math.ceil(data.meta.total / data.meta.limit) : 0;

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold">My orders</h1>

      <div
        className="mt-5 flex flex-wrap gap-2"
        role="group"
        aria-label="Order filter"
      >
        {GROUPS.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={group === item.key}
            onClick={() => update({ group: item.key, page: undefined })}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              group === item.key
                ? "border-primary bg-primary/20 text-primary-hover"
                : "border-line bg-elevated text-secondary hover:text-fg",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        )}
        {isError && (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        )}
        {data && data.orders.length === 0 && (
          <EmptyState
            title="No orders here"
            description="Orders you place will show up here."
            action={
              <Link
                to="/games"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Browse games
              </Link>
            }
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
              key={order.reference}
              to={`/account/orders/${order.reference}`}
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
                  </div>
                  <p className="font-mono text-base font-semibold text-amber">
                    {formatNpr(order.pricePaisa)}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <CustomerStatusBadge status={order.status} />
                  <span className="text-xs text-muted">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(next) => update({ page: String(next) })}
      />
    </div>
  );
}
