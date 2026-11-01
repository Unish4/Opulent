import { useState } from "react";
import { Link, useParams } from "react-router";
import toast from "react-hot-toast";
import { ArrowLeft, MessageCircle } from "lucide-react";
import CopyButton from "../components/CopyButton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import CustomerStatusBadge from "../components/order/CustomerStatusBadge";
import OrderStatusBanner from "../components/order/OrderStatusBanner";
import OrderTimeline from "../components/order/OrderTimeline";
import RefundRequestDialog from "../components/order/RefundRequestDialog";
import { Badge, Button, Card, Skeleton } from "../components/ui";
import { useOrder, useRequestRefund } from "../hooks/useOrders";
import { usePaymentConfig } from "../hooks/usePaymentConfig";
import type { ApiError } from "../services/api";
import type { RefundReason } from "../types/refund";
import { REFUND_REASON_LABELS } from "../utils/orderLabels";
import { formatNpr } from "../utils/money";
import { formatDateTime } from "../utils/time";
import { buildWhatsAppLink } from "../utils/whatsapp";

const REFUND_STATUS = {
  requested: { label: "Under review", tone: "primary" as const },
  approved: { label: "Approved, being sent", tone: "success" as const },
  denied: { label: "Declined", tone: "neutral" as const },
  paid_out: { label: "Refunded", tone: "success" as const },
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

export default function OrderDetailPage() {
  const { reference } = useParams();
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrder(reference);
  const payment = usePaymentConfig(true);
  const requestRefund = useRequestRefund(reference);
  const [refundOpen, setRefundOpen] = useState(false);

  const supportLink = order
    ? buildWhatsAppLink(
        `Hello Opulent, I need help with order ${order.reference}.`,
        payment.data?.whatsappNumber,
      )
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        to="/account/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-secondary hover:text-fg"
      >
        <ArrowLeft size={16} /> My orders
      </Link>

      {isLoading && <Skeleton className="h-64" />}

      {isError &&
        ((error as ApiError).status === 404 ? (
          <EmptyState
            title="Order not found"
            description="This order does not exist or belongs to another account."
          />
        ) : (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ))}

      {order && (
        <div className="space-y-6">
          <OrderStatusBanner
            status={order.status}
            reason={order.statusReason}
          />

          <Card className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-secondary">Order ID</p>
                <p className="flex items-center gap-1 font-mono text-xl font-bold">
                  {order.reference}
                  <CopyButton value={order.reference} label="Order ID" />
                </p>
              </div>
              <CustomerStatusBadge status={order.status} />
            </div>

            <dl className="space-y-2 border-t border-line pt-4">
              <Row label="Game">{order.game.name}</Row>
              <Row label="Package">{order.package.name}</Row>
              {order.playerDetails.playerId && (
                <Row label="Player ID">
                  <span className="font-mono">
                    {order.playerDetails.playerId}
                  </span>
                </Row>
              )}
              {order.playerDetails.login && (
                <Row label="Login">
                  <span className="font-mono">{order.playerDetails.login}</span>
                </Row>
              )}
              {order.playerDetails.serverId && (
                <Row label="Server ID">
                  <span className="font-mono">
                    {order.playerDetails.serverId}
                  </span>
                </Row>
              )}
              {order.playerDetails.email && (
                <Row label="Account email">
                  <span className="font-mono">{order.playerDetails.email}</span>
                </Row>
              )}
              {order.playerDetails.password && (
                <Row label="Password">
                  <span className="font-mono">••••••••</span>
                </Row>
              )}
              {order.playerDetails.playerName && (
                <Row label="In-game name">{order.playerDetails.playerName}</Row>
              )}
              <Row label="Amount">
                <span className="font-mono text-amber">
                  {formatNpr(order.pricePaisa)}
                </span>
              </Row>
              <Row label="Placed on">{formatDateTime(order.createdAt)}</Row>
            </dl>

            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              {(order.status === "pending_payment" ||
                order.status === "awaiting_review") && (
                <Link
                  to={`/checkout/${order.reference}`}
                  className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  {order.status === "pending_payment"
                    ? "Pay and send proof"
                    : "View payment steps"}
                </Link>
              )}
              {supportLink && (
                <a
                  href={supportLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-success/15 px-4 text-sm font-semibold text-success hover:bg-success/25"
                >
                  <MessageCircle size={16} /> Get help on WhatsApp
                </a>
              )}
              {order.canRequestRefund && (
                <Button variant="secondary" onClick={() => setRefundOpen(true)}>
                  Request a refund
                </Button>
              )}
            </div>
          </Card>

          {order.refunds.length > 0 && (
            <Card className="space-y-3 p-6">
              <h2 className="font-display text-white font-semibold">Refunds</h2>
              {order.refunds.map((refund) => {
                const status = REFUND_STATUS[refund.status];
                return (
                  <div
                    key={refund.id}
                    className="space-y-1 rounded-md border border-line p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono font-semibold">
                        {formatNpr(refund.amountPaisa)}
                      </span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <p className="text-secondary">
                      {REFUND_REASON_LABELS[
                        refund.reasonCode as RefundReason
                      ] ?? refund.reasonCode}{" "}
                      · {formatDateTime(refund.createdAt)}
                    </p>
                    {refund.decisionNote && (
                      <p className="text-secondary">
                        Reason: {refund.decisionNote}
                      </p>
                    )}
                    {refund.paidOutTxnId && (
                      <p className="text-secondary">
                        eSewa reference:{" "}
                        <span className="font-mono">{refund.paidOutTxnId}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </Card>
          )}

          <Card className="p-6">
            <h2 className="mb-4 font-display text-white font-semibold">
              Order timeline
            </h2>
            <OrderTimeline events={order.timeline} />
          </Card>
        </div>
      )}

      {refundOpen && (
        <RefundRequestDialog
          loading={requestRefund.isPending}
          onClose={() => setRefundOpen(false)}
          onSubmit={(input) =>
            requestRefund.mutate(input, {
              onSuccess: () => {
                toast.success("Refund request sent");
                setRefundOpen(false);
              },
              onError: (err) => toast.error(err.message),
            })
          }
        />
      )}
    </div>
  );
}
