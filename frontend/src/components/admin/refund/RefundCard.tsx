import { Link } from "react-router";
import { Badge, Button, Card } from "../../ui";
import type { AdminRefund, RefundStatus } from "../../../types/refund";
import { REFUND_REASON_LABELS } from "../../../utils/orderLabels";
import { formatNpr } from "../../../utils/money";
import { formatDateTime } from "../../../utils/time";

const STATUS: Record<
  RefundStatus,
  { label: string; tone: "neutral" | "primary" | "success" | "amber" }
> = {
  requested: { label: "Requested", tone: "amber" },
  approved: { label: "Approved", tone: "primary" },
  denied: { label: "Denied", tone: "neutral" },
  paid_out: { label: "Paid", tone: "success" },
};

interface RefundCardProps {
  refund: AdminRefund;
  isOwner: boolean;
  busy: boolean;
  onApprove: () => void;
  onDeny: () => void;
  onMarkPaid: () => void;
}

export default function RefundCard({
  refund,
  isOwner,
  busy,
  onApprove,
  onDeny,
  onMarkPaid,
}: RefundCardProps) {
  const status = STATUS[refund.status];

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {refund.orderId ? (
            <Link
              to={`/admin/orders/${refund.orderId}`}
              className="font-mono text-sm font-semibold text-primary-hover hover:underline"
            >
              {refund.orderReference}
            </Link>
          ) : (
            <p className="text-sm font-semibold">Payment with no order</p>
          )}
          <p className="mt-1 text-sm text-secondary">
            {REFUND_REASON_LABELS[refund.reasonCode]} ·{" "}
            {refund.requestedByType === "customer"
              ? "customer"
              : (refund.requestedByName ?? "admin")}{" "}
            · {formatDateTime(refund.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-semibold text-amber">
            {formatNpr(refund.amountPaisa)}
          </p>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </div>

      <p className="text-sm">{refund.note}</p>

      <div className="space-y-1 text-xs text-muted">
        {refund.customerName && <p>Customer: {refund.customerName}</p>}
        {refund.incomingEsewaTxnIds.length > 0 && (
          <p className="font-mono">
            Paid with: {refund.incomingEsewaTxnIds.join(", ")}
          </p>
        )}
        {refund.decidedByName && (
          <p>
            Decided by {refund.decidedByName}
            {refund.decisionNote ? `: ${refund.decisionNote}` : ""}
          </p>
        )}
        {refund.paidOutTxnId && (
          <p className="font-mono">Refund transaction: {refund.paidOutTxnId}</p>
        )}
      </div>

      {isOwner && refund.status === "requested" && (
        <div className="flex gap-2">
          <Button size="sm" loading={busy} onClick={onApprove}>
            Approve
          </Button>
          <Button size="sm" variant="danger" disabled={busy} onClick={onDeny}>
            Deny
          </Button>
        </div>
      )}
      {isOwner && refund.status === "approved" && (
        <Button size="sm" loading={busy} onClick={onMarkPaid}>
          Mark as paid
        </Button>
      )}
      {!isOwner &&
        (refund.status === "requested" || refund.status === "approved") && (
          <p className="text-xs text-muted">
            Only an owner can decide and send refunds.
          </p>
        )}
    </Card>
  );
}
