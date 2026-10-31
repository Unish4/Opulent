import type { OrderStatus, PaymentStatus } from "./order";

export type AdminAction =
  | "confirmPayment"
  | "rejectPayment"
  | "hold"
  | "releaseHold"
  | "complete"
  | "fail"
  | "retry"
  | "cancelByAdmin"
  | "reassignClaim"
  | "reopen";

export interface AdminOrderListItem {
  id: string;
  reference: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  gameName: string;
  packageName: string;
  pricePaisa: number;
  playerId: string | null;
  serverId: string | null;
  email: string | null;
  playerName: string | null;
  nameUnverified: boolean;
  customerName: string | null;
  claimedByName: string | null;
  createdAt: string;
  proofSignalAt: string | null;
}

export interface AdminOrdersResult {
  orders: AdminOrderListItem[];
  meta: { page: number; limit: number; total: number };
}

export interface AdminTimelineEvent {
  id: string;
  action: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actorType: "customer" | "admin" | "system";
  actorName: string | null;
  note: string | null;
  createdAt: string;
}

export interface AdminOrderDetail {
  id: string;
  reference: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  allowedActions: string[];
  game: { name: string; slug: string };
  package: { name: string; group: string; description: string | null };
  pricePaisa: number;
  costPaisa: number | null;
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
    checkedAt: string;
  } | null;
  nameUnverified: boolean;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  claimedBy: { id: string; name: string | null } | null;
  paymentConfirmation: {
    payments: { esewaTxnId: string; amountPaisa: number }[];
    totalReceivedPaisa: number;
    overpaidPaisa: number;
    confirmedAt: string;
    confirmedByName: string | null;
  } | null;
  completion: { seenPlayerName: string; completedByName: string | null } | null;
  reasons: {
    hold: string | null;
    failure: string | null;
    rejection: string | null;
    cancellation: string | null;
    reopen: string | null;
  };
  dates: Record<string, string | null>;
  timeline: AdminTimelineEvent[];
}
