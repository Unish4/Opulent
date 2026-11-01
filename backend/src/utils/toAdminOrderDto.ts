import type { IOrder } from "../models/Order.js";
import type { ITimelineEvent } from "../models/TimelineEvent.js";
import type { IUser } from "../models/User.js";
import { getAllowedActions } from "./allowedActions.js";
import { canRevealPassword } from "./credentialAccess.js";

export type UserMap = Map<string, IUser>;

const nameOf = (users: UserMap, id: unknown): string | null => {
  if (!id) return null;
  return users.get(String(id))?.name ?? null;
};

export const toAdminOrderListItem = (order: IOrder, users: UserMap) => ({
  id: String(order._id),
  reference: order.reference,
  status: order.status,
  paymentStatus: order.paymentStatus,
  gameName: order.gameSnapshot.name,
  packageName: order.packageSnapshot.name,
  pricePaisa: order.pricePaisaSnapshot,
  playerId: order.playerDetails.playerId ?? null,
  serverId: order.playerDetails.serverId ?? null,
  email: order.playerDetails.email ?? null,
  login: order.playerDetails.login ?? null,
  playerName: order.playerDetails.playerName ?? null,
  nameUnverified: order.playerDetails.playerNameSource === "customer_typed",
  customerName: nameOf(users, order.userId),
  claimedByName: nameOf(users, order.claimedBy),
  createdAt: order.createdAt,
  proofSignalAt: order.proofSignalAt ?? null,
});

export const toAdminOrderDetail = (
  order: IOrder,
  users: UserMap,
  events: ITimelineEvent[],
  viewer: IUser,
) => {
  const customer = users.get(String(order.userId));
  const confirmation = order.paymentConfirmation;

  return {
    id: String(order._id),
    reference: order.reference,
    status: order.status,
    paymentStatus: order.paymentStatus,
    allowedActions: getAllowedActions(order, viewer),
    game: { name: order.gameSnapshot.name, slug: order.gameSnapshot.slug },
    package: {
      name: order.packageSnapshot.name,
      group: order.packageSnapshot.group,
      description: order.packageSnapshot.description ?? null,
    },
    pricePaisa: order.pricePaisaSnapshot,
    costPaisa:
      viewer.role === "owner" ? (order.costPaisaSnapshot ?? null) : null,
    playerDetails: {
      playerId: order.playerDetails.playerId ?? null,
      serverId: order.playerDetails.serverId ?? null,
      playerName: order.playerDetails.playerName ?? null,
      email: order.playerDetails.email ?? null,
      login: order.playerDetails.login ?? null,
      password: order.playerDetails.password ?? null,
      playerNameSource: order.playerDetails.playerNameSource,
    },
    lookup: order.lookupSnapshot
      ? {
          playerName: order.lookupSnapshot.playerName,
          level: order.lookupSnapshot.level,
          region: order.lookupSnapshot.region,
          checkedAt: order.lookupSnapshot.checkedAt,
        }
      : null,
    nameUnverified: order.playerDetails.playerNameSource === "customer_typed",
    hasCredential: order.hasCredential,
    canRevealPassword: canRevealPassword(order, viewer),
    credentialRevealCount: order.credentialRevealCount,
    customer: customer
      ? {
          id: String(customer._id),
          name: customer.name,
          email: customer.email,
          phone: customer.phone ?? null,
        }
      : null,
    claimedBy: order.claimedBy
      ? { id: String(order.claimedBy), name: nameOf(users, order.claimedBy) }
      : null,
    paymentConfirmation: confirmation
      ? {
          payments: confirmation.payments.map((payment) => ({
            esewaTxnId: payment.esewaTxnId,
            amountPaisa: payment.amountPaisa,
          })),
          totalReceivedPaisa: confirmation.totalReceivedPaisa,
          overpaidPaisa: confirmation.overpaidPaisa,
          confirmedAt: confirmation.confirmedAt,
          confirmedByName: nameOf(users, confirmation.confirmedBy),
        }
      : null,
    completion: order.completion
      ? {
          seenPlayerName: order.completion.seenPlayerName,
          completedByName: nameOf(users, order.completion.completedBy),
        }
      : null,
    reasons: {
      hold: order.holdReason ?? null,
      failure: order.failureReason ?? null,
      rejection: order.rejectionReason ?? null,
      cancellation: order.cancellationReason ?? null,
      reopen: order.reopenReason ?? null,
    },
    dates: {
      createdAt: order.createdAt,
      proofSignalAt: order.proofSignalAt ?? null,
      paymentConfirmedAt: order.paymentConfirmedAt ?? null,
      claimedAt: order.claimedAt ?? null,
      heldAt: order.heldAt ?? null,
      completedAt: order.completedAt ?? null,
      failedAt: order.failedAt ?? null,
      rejectedAt: order.rejectedAt ?? null,
      cancelledAt: order.cancelledAt ?? null,
    },
    timeline: events.map((event) => ({
      id: String(event._id),
      action: event.action,
      fromStatus: event.fromStatus ?? null,
      toStatus: event.toStatus,
      actorType: event.actorType,
      actorName: nameOf(users, event.actorUserId),
      note: event.note ?? null,
      createdAt: event.createdAt,
    })),
  };
};
