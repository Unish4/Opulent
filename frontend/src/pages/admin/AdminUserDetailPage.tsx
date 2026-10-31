import { useState } from "react";
import { Link, useParams } from "react-router";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ReasonDialog from "../../components/admin/order/ReasonDialog";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import { Badge, Button, Card, Skeleton } from "../../components/ui";
import { useAdminUser, useSetUserStatus } from "../../hooks/useAdminUsers";
import type { ApiError } from "../../services/api";
import { formatNpr } from "../../utils/money";
import { formatDateTime } from "../../utils/time";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-secondary">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const { data: user, isLoading, isError, error, refetch } = useAdminUser(id);
  const setStatus = useSetUserStatus(id);
  const [dialog, setDialog] = useState<"suspend" | "reinstate" | null>(null);

  if (isLoading) return <Skeleton className="h-64 max-w-3xl" />;
  if (isError) {
    return (error as ApiError).status === 404 ? (
      <EmptyState title="Account not found" />
    ) : (
      <ErrorState message={error.message} onRetry={() => refetch()} />
    );
  }
  if (!user) return null;

  const run = (status: "active" | "suspended", reason?: string) =>
    setStatus.mutate(
      { status, reason },
      {
        onSuccess: () => {
          toast.success(
            status === "suspended" ? "Account suspended" : "Account reinstated",
          );
          setDialog(null);
        },
        onError: (err) => {
          toast.error(err.message);
          setDialog(null);
        },
      },
    );

  const canChange = user.role === "customer" && user.status !== "deleted";

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-secondary hover:text-fg"
      >
        <ArrowLeft size={16} /> All customers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{user.name}</h1>
          <p className="mt-1 text-sm text-secondary">
            Joined {formatDateTime(user.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user.role !== "customer" && (
            <Badge tone="primary">{user.role}</Badge>
          )}
          <Badge tone={user.status === "active" ? "success" : "amber"}>
            {user.status}
          </Badge>
        </div>
      </div>

      <Card className="space-y-2 p-5">
        <dl className="space-y-2">
          <Row label="Email">{user.email || "-"}</Row>
          <Row label="Phone">{user.phone ?? "-"}</Row>
          <Row label="Orders">{user.ordersCount}</Row>
          <Row label="Completed spend">
            <span className="font-mono text-amber">
              {formatNpr(user.completedSpendPaisa)}
            </span>
          </Row>
        </dl>
        {Object.keys(user.ordersByStatus).length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-line pt-3">
            {Object.entries(user.ordersByStatus).map(([status, count]) => (
              <Badge key={status}>
                {status.replace("_", " ")}: {count}
              </Badge>
            ))}
          </div>
        )}
        {user.role !== "customer" && (
          <p className="border-t border-line pt-3 text-sm text-muted">
            This is an admin account. Remove their admin access on the Team page
            before changing the account status.
          </p>
        )}
        {canChange && (
          <div className="border-t border-line pt-3">
            {user.status === "active" ? (
              <Button variant="danger" onClick={() => setDialog("suspend")}>
                Suspend account
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setDialog("reinstate")}
              >
                Reinstate account
              </Button>
            )}
          </div>
        )}
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-white font-semibold">Recent orders</h2>
        {user.recentOrders.length === 0 && (
          <p className="text-sm text-muted">No orders yet.</p>
        )}
        {user.recentOrders.map((order) => (
          <Link
            key={order.id}
            to={`/admin/orders/${order.id}`}
            className="block"
          >
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-primary">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold">
                  {order.reference}
                </p>
                <p className="truncate text-sm text-secondary">
                  {order.gameName} · {order.packageName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <span className="font-mono text-sm text-amber">
                  {formatNpr(order.pricePaisa)}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      {dialog === "suspend" && (
        <ReasonDialog
          title="Suspend this account"
          description="They will not be able to sign in to place or view orders. Their existing orders are not changed."
          confirmLabel="Suspend account"
          tone="danger"
          loading={setStatus.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(reason) => run("suspended", reason)}
        />
      )}
      <ConfirmDialog
        open={dialog === "reinstate"}
        title="Reinstate this account?"
        description="They will be able to use the store again."
        confirmLabel="Reinstate"
        loading={setStatus.isPending}
        onConfirm={() => run("active")}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
