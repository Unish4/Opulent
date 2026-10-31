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
