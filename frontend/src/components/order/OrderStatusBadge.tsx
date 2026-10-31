import { Badge } from "../ui";
import type { OrderStatus } from "../../types/order";

const MAP: Record<
  OrderStatus,
  { label: string; tone: "neutral" | "primary" | "success" | "amber" }
> = {
  pending_payment: { label: "Unpaid", tone: "amber" },
  awaiting_review: { label: "Needs review", tone: "primary" },
  processing: { label: "Processing", tone: "primary" },
  on_hold: { label: "On hold", tone: "amber" },
  completed: { label: "Completed", tone: "success" },
  failed: { label: "Failed", tone: "amber" },
  rejected: { label: "Rejected", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, tone } = MAP[status];
  return <Badge tone={tone}>{label}</Badge>;
}
