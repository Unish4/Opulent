import { useState } from "react";
import { Link, useParams } from "react-router";
import toast from "react-hot-toast";
import { ArrowLeft, MessageCircle } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import CopyButton from "../../components/CopyButton";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import CompleteOrderDialog from "../../components/admin/order/CompleteOrderDialog";
import ConfirmPaymentDialog from "../../components/admin/order/ConfirmPaymentDialog";
import ReasonDialog from "../../components/admin/order/ReasonDialog";
import ReassignDialog from "../../components/admin/order/ReassignDialog";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import { Badge, Button, Card, Skeleton } from "../../components/ui";
import { useAdminOrder, useAdminOrderAction } from "../../hooks/useAdminOrders";
import type { ApiError } from "../../services/api";
import type { AdminAction } from "../../types/adminOrder";
import { formatNpr } from "../../utils/money";
import { formatDateTime } from "../../utils/time";
import { buildWhatsAppLink } from "../../utils/whatsapp";
import OrderRefundsPanel from "../../components/admin/refund/OrderRefundsPanel";

const BUTTONS: {
  action: AdminAction;
  label: string;
  variant: "primary" | "secondary" | "danger";
}[] = [
  { action: "confirmPayment", label: "Confirm payment", variant: "primary" },
  { action: "complete", label: "Mark completed", variant: "primary" },
  { action: "releaseHold", label: "Release hold", variant: "primary" },
  { action: "retry", label: "Retry top-up", variant: "primary" },
  { action: "hold", label: "Put on hold", variant: "secondary" },
  { action: "reassignClaim", label: "Reassign", variant: "secondary" },
  { action: "reopen", label: "Reopen", variant: "secondary" },
  { action: "fail", label: "Top-up failed", variant: "danger" },
  { action: "rejectPayment", label: "Reject payment", variant: "danger" },
  { action: "cancelByAdmin", label: "Cancel order", variant: "danger" },
];

const SUCCESS: Record<AdminAction, string> = {
  confirmPayment: "Payment confirmed. This order is now yours.",
  rejectPayment: "Payment rejected",
  hold: "Order put on hold",
  releaseHold: "Hold released",
  complete: "Order completed",
  fail: "Marked as failed",
  retry: "Order is processing again",
  cancelByAdmin: "Order cancelled",
  reassignClaim: "Order reassigned",
  reopen: "Order reopened",
};

const EVENT_LABELS: Record<string, string> = {
  created: "Order created",
  signalProof: "Customer sent a proof signal",
  confirmPayment: "Payment confirmed",
  rejectPayment: "Payment rejected",
  hold: "Put on hold",
  releaseHold: "Hold released",
  complete: "Completed",
  fail: "Top-up failed",
  retry: "Retried",
  cancelByCustomer: "Cancelled by customer",
  cancelByAdmin: "Cancelled by admin",
  staleCleanup: "Cancelled automatically",
  reassignClaim: "Reassigned",
  reopen: "Reopened",
};

const toWhatsAppNumber = (phone: string | null): string | null => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("977")) return digits;
  if (digits.length === 10 && digits.startsWith("9")) return `977${digits}`;
  return null;
};

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

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { data: order, isLoading, isError, error, refetch } = useAdminOrder(id);
  const mutation = useAdminOrderAction(id);
  const [dialog, setDialog] = useState<AdminAction | null>(null);

  const run = (action: AdminAction, body: object = {}) =>
    mutation.mutate(
      { action, body },
      {
        onSuccess: () => {
          toast.success(SUCCESS[action]);
          setDialog(null);
        },
        onError: (err) => toast.error(err.message),
      },
    );

  if (isLoading) return <Skeleton className="h-96 max-w-4xl" />;
  if (isError) {
    return (error as ApiError).status === 404 ? (
      <EmptyState title="Order not found" />
    ) : (
      <ErrorState message={error.message} onRetry={() => refetch()} />
    );
  }
  if (!order) return null;

  const loading = mutation.isPending;
  const customerNumber = toWhatsAppNumber(order.customer?.phone ?? null);
  const customerLink = customerNumber
    ? buildWhatsAppLink(
        `Hello ${order.customer?.name}, this is Opulent about your order ${order.reference}.`,
        customerNumber,
      )
    : null;
  const orderName = order.playerDetails.playerName ?? "";
  const allowed = BUTTONS.filter((button) =>
    order.allowedActions.includes(button.action),
  );

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-secondary hover:text-fg"
      >
        <ArrowLeft size={16} /> All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1 font-mono text-2xl font-bold">
            {order.reference}
            <CopyButton value={order.reference} label="Order ID" />
          </p>
          <p className="mt-1 text-sm text-secondary">
            Created {formatDateTime(order.dates.createdAt as string)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <Badge>{order.paymentStatus}</Badge>
        </div>
      </div>

      {order.status === "awaiting_review" ||
      order.status === "pending_payment" ? (
        <div className="rounded-lg border border-line bg-elevated p-4 text-sm text-secondary">
          Before confirming: open the eSewa statement, find a payment of exactly{" "}
          <span className="font-mono font-semibold text-amber">
            {formatNpr(order.pricePaisa)}
          </span>{" "}
          received after this order was created, and copy its transaction ID
          from the statement. A screenshot alone is not proof.
        </div>
      ) : null}

      {allowed.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allowed.map((button) => (
            <Button
              key={button.action}
              variant={button.variant}
              onClick={() => setDialog(button.action)}
            >
              {button.label}
            </Button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="space-y-3 p-5">
            <h2 className="font-display text-white font-semibold">
              Top-up details
            </h2>
            <dl className="space-y-2">
              <Row label="Game">{order.game.name}</Row>
              <Row label="Package">{order.package.name}</Row>
              {order.package.description && (
                <Row label="Note">{order.package.description}</Row>
              )}
              {order.playerDetails.playerId && (
                <Row label="Player ID">
                  <span className="font-mono">
                    {order.playerDetails.playerId}
                  </span>
                  <CopyButton
                    value={order.playerDetails.playerId}
                    label="Player ID"
                  />
                </Row>
              )}
              {order.playerDetails.serverId && (
                <Row label="Server ID">
                  <span className="font-mono">
                    {order.playerDetails.serverId}
                  </span>
                  <CopyButton
                    value={order.playerDetails.serverId}
                    label="Server ID"
                  />
                </Row>
              )}
              {order.playerDetails.email && (
                <Row label="Account email">
                  <span className="font-mono">{order.playerDetails.email}</span>
                  <CopyButton value={order.playerDetails.email} label="Email" />
                </Row>
              )}
            </dl>

            {order.lookup && (
              <div className="rounded-md border border-success/40 bg-success/10 p-3 text-sm">
                <p className="font-semibold text-success">
                  Player check found this account
                </p>
                <p className="mt-1">
                  {order.lookup.playerName}
                  {order.lookup.level !== null
                    ? ` · level ${order.lookup.level}`
                    : ""}
                  {order.lookup.region ? ` · ${order.lookup.region}` : ""}
                </p>
              </div>
            )}
            {order.nameUnverified && (
              <div className="rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-amber">
                Name typed by the customer, not checked:{" "}
                <span className="font-semibold">{orderName || "-"}</span>. Check
                the account in the game before topping up.
              </div>
            )}
          </Card>

          <Card className="space-y-3 p-5">
            <h2 className="font-display text-white font-semibold">Payment</h2>
            <dl className="space-y-2">
              <Row label="Order price">
                <span className="font-mono text-amber">
                  {formatNpr(order.pricePaisa)}
                </span>
              </Row>
              {order.costPaisa !== null && (
                <Row label="Distributor cost">
                  <span className="font-mono">
                    {formatNpr(order.costPaisa)}
                  </span>
                </Row>
              )}
            </dl>
            {order.paymentConfirmation ? (
              <div className="space-y-2 border-t border-line pt-3 text-sm">
                {order.paymentConfirmation.payments.map((payment) => (
                  <div
                    key={payment.esewaTxnId}
                    className="flex justify-between gap-3"
                  >
                    <span className="font-mono">{payment.esewaTxnId}</span>
                    <span className="font-mono">
                      {formatNpr(payment.amountPaisa)}
                    </span>
                  </div>
                ))}
                <p className="text-xs text-muted">
                  Confirmed by{" "}
                  {order.paymentConfirmation.confirmedByName ?? "an admin"} on{" "}
                  {formatDateTime(order.paymentConfirmation.confirmedAt)}
                </p>
                {order.paymentConfirmation.overpaidPaisa > 0 && (
                  <p className="text-sm text-amber">
                    Overpaid by{" "}
                    {formatNpr(order.paymentConfirmation.overpaidPaisa)}. This
                    excess must be refunded.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">No payment confirmed yet.</p>
            )}
            {order.claimedBy && (
              <p className="border-t border-line pt-3 text-sm text-secondary">
                Claimed by{" "}
                <span className="font-medium text-fg">
                  {order.claimedBy.name}
                </span>
              </p>
            )}
            {order.completion && (
              <p className="text-sm text-secondary">
                Completed. Name seen in game:{" "}
                <span className="font-medium text-fg">
                  {order.completion.seenPlayerName}
                </span>
              </p>
            )}
            {Object.entries(order.reasons)
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <p key={key} className="text-sm text-amber">
                  {key} reason: {value}
                </p>
              ))}
          </Card>

          <Card className="space-y-2 p-5">
            <h2 className="font-display text-white font-semibold">Customer</h2>
            {order.customer ? (
              <>
                <dl className="space-y-2">
                  <Row label="Name">{order.customer.name}</Row>
                  <Row label="Email">{order.customer.email || "-"}</Row>
                  <Row label="Phone">{order.customer.phone ?? "-"}</Row>
                </dl>
                {customerLink && (
                  <a
                    href={customerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-success hover:underline"
                  >
                    <MessageCircle size={16} /> Message on WhatsApp
                  </a>
                )}
              </>
            ) : (
              <p className="text-sm text-muted">Customer record not found.</p>
            )}
          </Card>
          <OrderRefundsPanel reference={order.reference} />
        </div>

        <Card className="h-fit p-5">
          <h2 className="font-display text-white font-semibold">Timeline</h2>
          <ol className="mt-4 space-y-4">
            {[...order.timeline].reverse().map((event) => (
              <li key={event.id} className="border-l-2 border-line pl-3">
                <p className="text-sm font-medium">
                  {EVENT_LABELS[event.action] ?? event.action}
                </p>
                <p className="text-xs text-muted">
                  {event.actorName ?? event.actorType} ·{" "}
                  {formatDateTime(event.createdAt)}
                </p>
                {event.note && (
                  <p className="mt-1 text-xs text-secondary">{event.note}</p>
                )}
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {dialog === "confirmPayment" && (
        <ConfirmPaymentDialog
          pricePaisa={order.pricePaisa}
          loading={loading}
          onClose={() => setDialog(null)}
          onSubmit={(payload) => run("confirmPayment", payload)}
        />
      )}
      {dialog === "complete" && (
        <CompleteOrderDialog
          orderName={order.lookup?.playerName ?? orderName}
          loading={loading}
          onClose={() => setDialog(null)}
          onSubmit={(seenPlayerName) => run("complete", { seenPlayerName })}
        />
      )}
      {dialog === "rejectPayment" && (
        <ReasonDialog
          title="Reject payment"
          description="Use this when no valid payment matches this order. The customer sees your reason."
          confirmLabel="Reject payment"
          tone="danger"
          loading={loading}
          onClose={() => setDialog(null)}
          onSubmit={(reason) => run("rejectPayment", { reason })}
        />
      )}
      {dialog === "hold" && (
        <ReasonDialog
          title="Put order on hold"
          description="The customer sees this reason on their order page. Use this when something needs sorting out with the customer, such as a short payment or a name mismatch."
          confirmLabel="Put on hold"
          loading={loading}
          onClose={() => setDialog(null)}
          onSubmit={(reason) => run("hold", { reason })}
        />
      )}
      {dialog === "fail" && (
        <ReasonDialog
          title="Top-up failed"
          description="The payment stays confirmed. Describe what went wrong so the customer can choose a retry or a refund."
          confirmLabel="Mark as failed"
          tone="danger"
          loading={loading}
          onClose={() => setDialog(null)}
          onSubmit={(reason) => run("fail", { reason })}
        />
      )}
      {dialog === "cancelByAdmin" && (
        <ReasonDialog
          title="Cancel order"
          description="If the customer already paid, do not cancel. Put the order on hold and arrange a refund instead."
          confirmLabel="Cancel order"
          tone="danger"
          loading={loading}
          onClose={() => setDialog(null)}
          onSubmit={(reason) => run("cancelByAdmin", { reason })}
        />
      )}
      {dialog === "reassignClaim" && (
        <ReassignDialog
          title="Reassign order"
          description="The chosen admin becomes responsible for this order."
          withReason={false}
          defaultClaimantId={order.claimedBy?.id}
          confirmLabel="Reassign"
          loading={loading}
          onClose={() => setDialog(null)}
          onSubmit={({ claimantId }) => run("reassignClaim", { claimantId })}
        />
      )}
      {dialog === "reopen" && (
        <ReassignDialog
          title="Reopen completed order"
          description="Use this only when our own delivery was wrong and the top-up must be done again."
          withReason
          defaultClaimantId={order.claimedBy?.id}
          confirmLabel="Reopen"
          loading={loading}
          onClose={() => setDialog(null)}
          onSubmit={({ claimantId, reason }) =>
            run("reopen", { claimantId, reason })
          }
        />
      )}
      <ConfirmDialog
        open={dialog === "releaseHold"}
        title="Release the hold?"
        description="The order returns to the status it had before it was put on hold."
        confirmLabel="Release hold"
        loading={loading}
        onConfirm={() => run("releaseHold")}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === "retry"}
        title="Retry the top-up?"
        description="The order goes back to processing so you can try the top-up again."
        confirmLabel="Retry"
        loading={loading}
        onConfirm={() => run("retry")}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
