import { cn } from "../../utils/cn";
import type { OrderStatus } from "../../types/order";

interface OrderStatusBannerProps {
  status: OrderStatus;
  reason: string | null;
}

const BANNERS: Record<
  OrderStatus,
  { tone: string; title: string; text: string }
> = {
  pending_payment: {
    tone: "border-amber/40 bg-amber/10 text-amber",
    title: "Waiting for your payment",
    text: "Pay with eSewa, then send your proof on WhatsApp.",
  },
  awaiting_review: {
    tone: "border-primary/40 bg-primary/10 text-primary-hover",
    title: "Proof sent",
    text: "Our team is checking your payment. We will update this page once it is confirmed.",
  },
  processing: {
    tone: "border-success/40 bg-success/10 text-success",
    title: "Payment confirmed",
    text: "Our team is topping up your account now.",
  },
  on_hold: {
    tone: "border-amber/40 bg-amber/10 text-amber",
    title: "Your order is on hold",
    text: "Our team will contact you on WhatsApp about this order.",
  },
  completed: {
    tone: "border-success/40 bg-success/10 text-success",
    title: "Top-up completed",
    text: "Your top-up has been delivered. Contact us on WhatsApp if anything looks wrong.",
  },
  failed: {
    tone: "border-danger/40 bg-danger/10 text-danger",
    title: "We could not complete this top-up",
    text: "Our team will contact you on WhatsApp to fix this or arrange a refund.",
  },
  rejected: {
    tone: "border-danger/40 bg-danger/10 text-danger",
    title: "Payment rejected",
    text: "We could not match a valid payment to this order. Contact us on WhatsApp if you think this is a mistake.",
  },
  cancelled: {
    tone: "border-line bg-elevated text-secondary",
    title: "Order cancelled",
    text: "This order is cancelled. If you already paid, contact us on WhatsApp.",
  },
};

export default function OrderStatusBanner({
  status,
  reason,
}: OrderStatusBannerProps) {
  const banner = BANNERS[status];

  return (
    <div role="status" className={cn("rounded-lg border p-4", banner.tone)}>
      <p className="font-semibold">{banner.title}</p>
      <p className="mt-1 text-sm opacity-90">{banner.text}</p>
      {reason && <p className="mt-2 text-sm">Reason: {reason}</p>}
    </div>
  );
}
