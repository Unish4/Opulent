import type { OrderStatus } from "./order";

export interface DashboardData {
  range: { from: string; to: string };
  queues: {
    awaitingReview: number;
    pendingPayment: number;
    processing: number;
    onHold: number;
    failed: number;
    refundsRequested: number;
    refundsToPay: number;
  };
  period: {
    created: number;
    completed: number;
    completedSalesPaisa: number;
    rejected: number;
    cancelled: number;
    refundsPaidCount: number;
    refundsPaidPaisa: number;
    avgVerifyMinutes: number | null;
    avgFulfilMinutes: number | null;
    estimatedGrossProfitPaisa: number | null;
    ordersMissingCost: number | null;
  };
  byGame: {
    slug: string;
    name: string;
    completed: number;
    salesPaisa: number;
    estimatedProfitPaisa: number | null;
  }[];
  catalogue: { gamesPublished: number; packagesAvailable: number };
  lookup: {
    provider: string;
    usedToday: number;
    dailyLimit: number;
    keyConfigured: boolean;
  };
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "customer" | "operator" | "owner";
  status: "active" | "suspended" | "deleted";
  createdAt: string;
  ordersCount: number;
}

export interface AdminUserDetail extends AdminUserListItem {
  ordersByStatus: Record<string, number>;
  completedSpendPaisa: number;
  recentOrders: {
    id: string;
    reference: string;
    status: OrderStatus;
    gameName: string;
    packageName: string;
    pricePaisa: number;
    createdAt: string;
  }[];
}

export interface AdminUsersResult {
  users: AdminUserListItem[];
  meta: { page: number; limit: number; total: number };
}

export interface AdminPaymentConfig {
  methodLabel: string;
  recipientName: string;
  qrImageUrl: string;
  whatsappNumber: string;
  instructions: string;
  updatedAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  change: Record<string, unknown> | null;
  requestId: string | null;
  actorName: string | null;
  createdAt: string;
}

export interface AuditLogsResult {
  logs: AuditLogItem[];
  meta: { page: number; limit: number; total: number };
}
