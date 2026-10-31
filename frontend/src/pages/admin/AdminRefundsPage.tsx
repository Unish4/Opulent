import { useState } from "react";
import { useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Pagination from "../../components/Pagination";
import ReasonDialog from "../../components/admin/order/ReasonDialog";
import MarkPaidDialog from "../../components/admin/refund/MarkPaidDialog";
import RefundCard from "../../components/admin/refund/RefundCard";
import RefundFormDialog from "../../components/admin/refund/RefundFormDialog";
import { Badge, Button, Skeleton } from "../../components/ui";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  useAdminRefundSummary,
  useAdminRefunds,
  useCreateRefund,
  useRefundAction,
} from "../../hooks/useAdminRefunds";
import type { AdminRefund } from "../../types/refund";
import { cn } from "../../utils/cn";

const TABS = [
  { key: "requested", label: "Requested" },
  { key: "approved", label: "To pay" },
  { key: "paid_out", label: "Paid" },
  { key: "denied", label: "Denied" },
  { key: "all", label: "All" },
];

type Target = { refund: AdminRefund; kind: "approve" | "deny" | "paid" } | null;

export default function AdminRefundsPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "requested";
  const page = Number(params.get("page") ?? 1) || 1;

  const { data: me } = useCurrentUser();
  const isOwner = me?.role === "owner";
  const { data, isLoading, isError, error, refetch } = useAdminRefunds({
    status: status === "all" ? undefined : status,
    page,
    limit: 20,
  });
  const { data: summary } = useAdminRefundSummary();
  const action = useRefundAction();
  const create = useCreateRefund();
  const [target, setTarget] = useState<Target>(null);
  const [creating, setCreating] = useState(false);
  const totalPages = data ? Math.ceil(data.meta.total / data.meta.limit) : 0;

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next);
  };

  const run = (
    path: "approve" | "deny" | "mark-paid",
    body: object,
    success: string,
  ) => {
    if (!target) return;
    action.mutate(
      { id: target.refund.id, path, body },
      {
        onSuccess: () => {
          toast.success(success);
          setTarget(null);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Refunds</h1>
          <p className="mt-1 text-sm text-secondary">
            Refund only to the eSewa account that paid. Check the statement
            first.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={16} /> New request
        </Button>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Refund status"
      >
        {TABS.map((tab) => {
          const count = tab.key === "all" ? undefined : summary?.[tab.key];
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={status === tab.key}
              onClick={() => update({ status: tab.key, page: undefined })}
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

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      )}
      {isError && (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      )}
      {data && data.refunds.length === 0 && (
        <EmptyState title="No refunds here" />
      )}

      <div className="space-y-3">
        {data?.refunds.map((refund) => (
          <RefundCard
            key={refund.id}
            refund={refund}
            isOwner={isOwner}
            busy={action.isPending && action.variables?.id === refund.id}
            onApprove={() => setTarget({ refund, kind: "approve" })}
            onDeny={() => setTarget({ refund, kind: "deny" })}
            onMarkPaid={() => setTarget({ refund, kind: "paid" })}
          />
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(next) => update({ page: String(next) })}
      />

      <ConfirmDialog
        open={target?.kind === "approve"}
        title="Approve this refund?"
        description="After approving, send the money from eSewa and then mark the refund as paid."
        confirmLabel="Approve"
        loading={action.isPending}
        onConfirm={() => run("approve", {}, "Refund approved")}
        onCancel={() => setTarget(null)}
      />
      {target?.kind === "deny" && (
        <ReasonDialog
          title="Deny this refund"
          description="The customer sees this reason on their order page."
          confirmLabel="Deny refund"
          tone="danger"
          loading={action.isPending}
          onClose={() => setTarget(null)}
          onSubmit={(note) => run("deny", { note }, "Refund denied")}
        />
      )}
      {target?.kind === "paid" && (
        <MarkPaidDialog
          amountPaisa={target.refund.amountPaisa}
          loading={action.isPending}
          onClose={() => setTarget(null)}
          onSubmit={(paidOutTxnId) =>
            run("mark-paid", { paidOutTxnId }, "Refund marked as paid")
          }
        />
      )}
      {creating && (
        <RefundFormDialog
          loading={create.isPending}
          onClose={() => setCreating(false)}
          onSubmit={(payload) =>
            create.mutate(payload, {
              onSuccess: () => {
                toast.success("Refund request created");
                setCreating(false);
              },
              onError: (err) => toast.error(err.message),
            })
          }
        />
      )}
    </div>
  );
}
