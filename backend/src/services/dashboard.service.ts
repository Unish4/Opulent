import { ENV } from "../config/env.js";
import { Game } from "../models/Game.js";
import { LookupUsage } from "../models/LookupUsage.js";
import { Order } from "../models/Order.js";
import { Package } from "../models/Package.js";
import { Refund } from "../models/Refund.js";
import type { IUser } from "../models/User.js";
import { nepalDateString, type DateRange } from "../utils/dateRange.js";

const HAS_COST = {
  $in: [{ $type: "$costPaisaSnapshot" }, ["int", "long", "double", "decimal"]],
};

const countMap = (
  rows: { _id: string; count: number }[],
): Record<string, number> =>
  Object.fromEntries(rows.map((row) => [row._id, row.count]));

const toMinutes = (ms: number | null | undefined): number | null =>
  typeof ms === "number" ? Math.round(ms / 60_000) : null;

export const getDashboard = async (viewer: IUser, range: DateRange) => {
  const isOwner = viewer.role === "owner";
  const today = nepalDateString(new Date());
  const completedMatch = {
    status: "completed",
    completedAt: { $gte: range.start, $lte: range.end },
  };

  const [
    openRows,
    createdRows,
    completedRows,
    byGame,
    refundsPaid,
    refundQueue,
    gamesPublished,
    packagesAvailable,
    usage,
  ] = await Promise.all([
    Order.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Order.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: range.start, $lte: range.end } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Order.aggregate<{
      count: number;
      sales: number;
      cost: number;
      salesWithCost: number;
      withCost: number;
      avgVerifyMs: number | null;
      avgFulfilMs: number | null;
    }>([
      { $match: completedMatch },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          sales: { $sum: "$pricePaisaSnapshot" },
          cost: { $sum: { $ifNull: ["$costPaisaSnapshot", 0] } },
          salesWithCost: {
            $sum: { $cond: [HAS_COST, "$pricePaisaSnapshot", 0] },
          },
          withCost: { $sum: { $cond: [HAS_COST, 1, 0] } },
          avgVerifyMs: {
            $avg: { $subtract: ["$paymentConfirmedAt", "$proofSignalAt"] },
          },
          avgFulfilMs: {
            $avg: { $subtract: ["$completedAt", "$paymentConfirmedAt"] },
          },
        },
      },
    ]),
    Order.aggregate<{
      _id: string;
      name: string;
      count: number;
      sales: number;
      cost: number;
      salesWithCost: number;
    }>([
      { $match: completedMatch },
      {
        $group: {
          _id: "$gameSnapshot.slug",
          name: { $first: "$gameSnapshot.name" },
          count: { $sum: 1 },
          sales: { $sum: "$pricePaisaSnapshot" },
          cost: { $sum: { $ifNull: ["$costPaisaSnapshot", 0] } },
          salesWithCost: {
            $sum: { $cond: [HAS_COST, "$pricePaisaSnapshot", 0] },
          },
        },
      },
      { $sort: { sales: -1 } },
    ]),
    Refund.aggregate<{ count: number; total: number }>([
      {
        $match: {
          status: "paid_out",
          paidOutAt: { $gte: range.start, $lte: range.end },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: "$amountPaisa" },
        },
      },
    ]),
    Refund.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Game.countDocuments({ isPublished: true }),
    Package.countDocuments({ isAvailable: true }),
    LookupUsage.findOne({ provider: "volsever", date: today }),
  ]);

  const open = countMap(openRows);
  const created = countMap(createdRows);
  const refunds = countMap(refundQueue);
  const completed = completedRows[0];
  const paid = refundsPaid[0];

  return {
    range: { from: range.from, to: range.to },
    queues: {
      awaitingReview: open.awaiting_review ?? 0,
      pendingPayment: open.pending_payment ?? 0,
      processing: open.processing ?? 0,
      onHold: open.on_hold ?? 0,
      failed: open.failed ?? 0,
      refundsRequested: refunds.requested ?? 0,
      refundsToPay: refunds.approved ?? 0,
    },
    period: {
      created: Object.values(created).reduce((sum, value) => sum + value, 0),
      completed: completed?.count ?? 0,
      completedSalesPaisa: completed?.sales ?? 0,
      rejected: created.rejected ?? 0,
      cancelled: created.cancelled ?? 0,
      refundsPaidCount: paid?.count ?? 0,
      refundsPaidPaisa: paid?.total ?? 0,
      avgVerifyMinutes: toMinutes(completed?.avgVerifyMs),
      avgFulfilMinutes: toMinutes(completed?.avgFulfilMs),
      estimatedGrossProfitPaisa: isOwner
        ? completed
          ? completed.salesWithCost - completed.cost
          : 0
        : null,
      ordersMissingCost: isOwner
        ? completed
          ? completed.count - completed.withCost
          : 0
        : null,
    },
    byGame: byGame.map((row) => ({
      slug: row._id,
      name: row.name,
      completed: row.count,
      salesPaisa: row.sales,
      estimatedProfitPaisa: isOwner ? row.salesWithCost - row.cost : null,
    })),
    catalogue: { gamesPublished, packagesAvailable },
    lookup: {
      provider: "volsever",
      usedToday: usage?.count ?? 0,
      dailyLimit: ENV.LOOKUP.DAILY_LIMIT,
      keyConfigured: !!ENV.VOLSEVER.API_KEY,
    },
  };
};
