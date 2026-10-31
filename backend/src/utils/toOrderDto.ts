import type { IOrder } from "../models/Order.js";

const statusReason = (order: IOrder): string | null => {
  if (order.status === "rejected") return order.rejectionReason ?? null;
  if (order.status === "cancelled") return order.cancellationReason ?? null;
  if (order.status === "on_hold") return order.holdReason ?? null;
  return null;
};

export const toOrderDto = (order: IOrder) => ({
  reference: order.reference,
  status: order.status,
  paymentStatus: order.paymentStatus,
  statusReason: statusReason(order),
  currency: order.currency,
  pricePaisa: order.pricePaisaSnapshot,
  game: { name: order.gameSnapshot.name, slug: order.gameSnapshot.slug },
  package: {
    name: order.packageSnapshot.name,
    group: order.packageSnapshot.group,
    description: order.packageSnapshot.description ?? null,
  },
  playerDetails: {
    playerId: order.playerDetails.playerId ?? null,
    serverId: order.playerDetails.serverId ?? null,
    playerName: order.playerDetails.playerName ?? null,
    email: order.playerDetails.email ?? null,
    playerNameSource: order.playerDetails.playerNameSource,
  },
  lookup: order.lookupSnapshot
    ? {
        playerName: order.lookupSnapshot.playerName,
        level: order.lookupSnapshot.level,
        region: order.lookupSnapshot.region,
      }
    : null,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});
