import { useState } from "react";
import { Link, useParams } from "react-router";
import toast from "react-hot-toast";
import { MessageCircle } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import CopyButton from "../components/CopyButton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import StepHeading from "../components/game/StepHeading";
import OrderStatusBanner from "../components/order/OrderStatusBanner";
import { Button, Card, Skeleton } from "../components/ui";
import { useCancelOrder, useOrder, useSignalProof } from "../hooks/useOrders";
import { usePaymentConfig } from "../hooks/usePaymentConfig";
import type { ApiError } from "../services/api";
import { formatNpr } from "../utils/money";
import { buildWhatsAppLink } from "../utils/whatsapp";

export default function CheckoutPage() {
  const { reference } = useParams();
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrder(reference);
  const signalProof = useSignalProof(reference);
  const cancelOrder = useCancelOrder(reference);
  const [cancelOpen, setCancelOpen] = useState(false);

  const showPayment =
    order?.status === "pending_payment" || order?.status === "awaiting_review";
  const paymentQuery = usePaymentConfig(!!showPayment);
  const payment = paymentQuery.data;

  const amountText = order ? formatNpr(order.pricePaisa) : "";
  const whatsappMessage = order
    ? `Hello Opulent, I have paid for order ${order.reference}.\nGame: ${order.game.name}\nPackage: ${order.package.name}\nAmount: ${amountText}\n(My eSewa screenshot is attached.)`
    : "";
  const whatsappLink = payment
    ? buildWhatsAppLink(whatsappMessage, payment.whatsappNumber)
    : null;
  const supportLink = payment
    ? buildWhatsAppLink(
        `Hello Opulent, I need help with order ${order?.reference}.`,
        payment.whatsappNumber,
      )
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {isLoading && <Skeleton className="h-64" />}

      {isError &&
        ((error as ApiError).status === 404 ? (
          <EmptyState
            title="Order not found"
            description="This order does not exist or belongs to another account."
            action={
              <Link
                to="/games"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Browse games
              </Link>
            }
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

          <Card className="space-y-5 p-6">
            <div>
              <p className="text-sm text-secondary">Order ID</p>
              <p className="flex items-center gap-2 font-mono text-2xl font-bold">
                {order.reference}
                <CopyButton value={order.reference} label="Order ID" />
              </p>
            </div>

            <dl className="space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-secondary">Game</dt>
                <dd className="font-medium">{order.game.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-secondary">Package</dt>
                <dd className="font-medium">{order.package.name}</dd>
              </div>
              {order.playerDetails.playerId && (
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary">Player ID</dt>
                  <dd className="font-mono">{order.playerDetails.playerId}</dd>
                </div>
              )}
              {order.playerDetails.login && (
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary">Login</dt>
                  <dd className="font-mono">{order.playerDetails.login}</dd>
                </div>
              )}
              {order.playerDetails.serverId && (
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary">Server ID</dt>
                  <dd className="font-mono">{order.playerDetails.serverId}</dd>
                </div>
              )}
              {order.playerDetails.email && (
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary">Account email</dt>
                  <dd className="font-mono">{order.playerDetails.email}</dd>
                </div>
              )}
              {order.playerDetails.password && (
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary">Password</dt>
                  <dd className="font-mono">••••••••</dd>
                </div>
              )}
              {order.playerDetails.playerName && (
                <div className="flex justify-between gap-3">
                  <dt className="text-secondary">In-game name</dt>
                  <dd>{order.playerDetails.playerName}</dd>
                </div>
              )}
            </dl>

            <div className="flex items-end justify-between border-t border-line pt-4">
              <span className="text-sm text-secondary">Amount due</span>
              <span className="flex items-center gap-1 font-mono text-2xl font-bold text-amber">
                {amountText}
                <CopyButton
                  value={String(order.pricePaisa / 100)}
                  label="Amount"
                />
              </span>
            </div>
          </Card>

          {showPayment && paymentQuery.isLoading && (
            <Skeleton className="h-64" />
          )}
          {showPayment && paymentQuery.isError && (
            <ErrorState
              message={paymentQuery.error.message}
              onRetry={() => paymentQuery.refetch()}
            />
          )}

          {showPayment && payment && (
            <>
              {order.status === "pending_payment" && (
                <Card className="p-6">
                  <StepHeading
                    step={1}
                    title={`Pay with ${payment.methodLabel}`}
                  />
                  <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
                    <div>
                      <img
                        src={payment.qrImageUrl}
                        alt={`${payment.methodLabel} QR code for ${payment.recipientName}`}
                        className="mx-auto aspect-square w-full max-w-56 rounded-lg bg-white p-2"
                      />
                      <a
                        href={payment.qrImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block text-center text-xs text-primary-hover hover:underline"
                      >
                        Open QR full size
                      </a>
                    </div>
                    <div className="space-y-3 text-sm">
                      <p>
                        <span className="text-secondary">Pay to: </span>
                        <span className="font-semibold">
                          {payment.recipientName}
                        </span>
                      </p>
                      <p>
                        <span className="text-secondary">Exact amount: </span>
                        <span className="font-mono font-semibold text-amber">
                          {amountText}
                        </span>
                      </p>
                      <p className="whitespace-pre-line text-secondary">
                        {payment.instructions}
                      </p>
                      <p className="rounded-md border border-line bg-elevated p-3 text-xs text-muted">
                        The QR code does not contain the amount or your order
                        ID, so please enter the exact amount yourself.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <StepHeading
                  step={order.status === "pending_payment" ? 2 : 1}
                  title="Send your proof on WhatsApp"
                />
                <p className="text-sm text-secondary">
                  WhatsApp opens with your order details filled in. Attach your{" "}
                  {payment.methodLabel} payment screenshot to the message before
                  sending. Our team checks your payment by hand.
                </p>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex h-11 items-center gap-2 rounded-md bg-success/15 px-4 text-sm font-semibold text-success hover:bg-success/25"
                  >
                    <MessageCircle size={18} /> Send proof on WhatsApp
                  </a>
                )}
              </Card>

              {order.status === "pending_payment" && (
                <Card className="p-6">
                  <StepHeading step={3} title="Let us know" />
                  <p className="text-sm text-secondary">
                    After you have sent the message, press the button so our
                    team sees your order straight away. This does not confirm
                    your payment.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      loading={signalProof.isPending}
                      onClick={() =>
                        signalProof.mutate(undefined, {
                          onSuccess: () =>
                            toast.success(
                              "Thanks. Our team has been notified.",
                            ),
                          onError: (err) => toast.error(err.message),
                        })
                      }
                    >
                      I have sent my proof
                    </Button>
                    <Button variant="ghost" onClick={() => setCancelOpen(true)}>
                      Cancel order
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}

          {!showPayment && supportLink && (
            <a
              href={supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-success hover:underline"
            >
              <MessageCircle size={16} /> Need help? Message us on WhatsApp
            </a>
          )}

          <ConfirmDialog
            open={cancelOpen}
            tone="danger"
            title="Cancel this order?"
            description="Only cancel if you have not paid. If you already paid, message us on WhatsApp instead."
            confirmLabel="Cancel order"
            loading={cancelOrder.isPending}
            onConfirm={() =>
              cancelOrder.mutate(undefined, {
                onSuccess: () => {
                  toast.success("Order cancelled");
                  setCancelOpen(false);
                },
                onError: (err) => {
                  toast.error(err.message);
                  setCancelOpen(false);
                },
              })
            }
            onCancel={() => setCancelOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
