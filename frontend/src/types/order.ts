export type OrderStatus =
  | "pending_payment"
  | "awaiting_review"
  | "processing"
  | "on_hold"
  | "completed"
  | "failed"
  | "rejected"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "claimed"
  | "confirmed"
  | "rejected"
  | "refunded";

export interface OrderDto {
  reference: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  statusReason: string | null;
  currency: "NPR";
  pricePaisa: number;
  game: { name: string; slug: string };
  package: { name: string; group: string; description: string | null };
  playerDetails: {
    playerId: string | null;
    serverId: string | null;
    playerName: string | null;
    email: string | null;
    playerNameSource: "lookup" | "customer_typed" | "not_applicable";
  };
  lookup: {
    playerName: string;
    level: number | null;
    region: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  gameSlug: string;
  packageId: string;
  expectedPricePaisa: number;
  playerDetails: Record<string, string>;
  lookupToken?: string;
}

export interface OrderListItem {
  reference: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  gameName: string;
  packageName: string;
  pricePaisa: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResult {
  orders: OrderListItem[];
  meta: { page: number; limit: number; total: number };
}

export interface CustomerTimelineEvent {
  id: string;
  action: string;
  note: string | null;
  createdAt: string;
}

export interface CustomerRefund {
  id: string;
  status: "requested" | "approved" | "denied" | "paid_out";
  amountPaisa: number;
  reasonCode: string;
  decisionNote: string | null;
  paidOutTxnId: string | null;
  createdAt: string;
  decidedAt: string | null;
  paidOutAt: string | null;
}

export interface OrderDetailDto extends OrderDto {
  canCancel: boolean;
  canRequestRefund: boolean;
  timeline: CustomerTimelineEvent[];
  refunds: CustomerRefund[];
}
