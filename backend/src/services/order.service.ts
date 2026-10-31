import mongoose from "mongoose";
import type { IGame } from "../models/Game.js";
import { Order, type IOrder, type NameSource } from "../models/Order.js";
import { Package } from "../models/Package.js";
import { TimelineEvent } from "../models/TimelineEvent.js";
import type { IUser } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { generateOrderReference } from "../utils/generateOrderReference.js";
import type { CreateOrderInput } from "../validators/order.validator.js";
import { buildPlayerDetailsSchema } from "../validators/playerDetails.validator.js";
import { getPublishedGameBySlug } from "./game.service.js";
import { verifyLookupToken, type LookupClaims } from "./lookupToken.service.js";
import { applyTransition } from "./orderTransition.service.js";

const MAX_OPEN_UNPAID_ORDERS = 3;
const MAX_REFERENCE_ATTEMPTS = 5;

const duplicateKeys = (err: unknown): string[] => {
  if (
    typeof err !== "object" ||
    err === null ||
    !("code" in err) ||
    err.code !== 11000
  )
    return [];
  const pattern =
    "keyPattern" in err
      ? (err.keyPattern as Record<string, unknown> | undefined)
      : undefined;
  return pattern ? Object.keys(pattern) : [];
};

const blank = (value?: string): string | undefined =>
  value && value.length > 0 ? value : undefined;

const resolvePlayerDetails = async (
  user: IUser,
  game: IGame,
  input: CreateOrderInput,
) => {
  const raw: Record<string, string> = { ...input.playerDetails };
  let lookup: LookupClaims | null = null;

  if (input.lookupToken) {
    if (!game.lookup.enabled) {
      throw new ApiError(
        400,
        "Player check is not available for this game.",
        "LOOKUP_NOT_SUPPORTED",
      );
    }
    lookup = await verifyLookupToken(input.lookupToken, {
      userId: String(user._id),
      gameId: String(game._id),
      playerId: (raw.playerId ?? "").trim(),
      serverId: (raw.serverId ?? "").trim(),
    });
    delete raw.playerName;
  }

  const hasNameField = game.playerFields.some(
    (field) => field.key === "playerName",
  );
  const fields = lookup
    ? game.playerFields.filter((field) => field.key !== "playerName")
    : game.playerFields;
  const parsed = buildPlayerDetailsSchema(fields).parse(raw) as Record<
    string,
    string
  >;

  const source: NameSource = lookup
    ? "lookup"
    : hasNameField
      ? "customer_typed"
      : "not_applicable";

  return {
    lookup,
    details: {
      playerId: blank(parsed.playerId),
      serverId: blank(parsed.serverId),
      email: blank(parsed.email),
      playerName: lookup ? lookup.playerName : blank(parsed.playerName),
      playerNameSource: source,
    },
  };
};

export const createOrder = async (
  user: IUser,
  input: CreateOrderInput,
  idempotencyKey: string,
): Promise<{ order: IOrder; created: boolean }> => {
  const existing = await Order.findOne({ userId: user._id, idempotencyKey });
  if (existing) return { order: existing, created: false };

  const game = await getPublishedGameBySlug(input.gameSlug);
  if (!game.acceptingOrders) {
    throw new ApiError(409, `Orders for ${game.name} are paused right now.`);
  }

  const pkg = await Package.findOne({
    _id: input.packageId,
    gameId: game._id,
    isAvailable: true,
  });
  if (!pkg) throw new ApiError(404, "This package is not available.");

  if (pkg.pricePaisa !== input.expectedPricePaisa) {
    throw new ApiError(
      409,
      "The price of this package has changed. Please review the new price.",
      "PRICE_CHANGED",
      [{ path: "pricePaisa", message: String(pkg.pricePaisa) }],
    );
  }

  const openOrders = await Order.countDocuments({
    userId: user._id,
    status: "pending_payment",
  });
  if (openOrders >= MAX_OPEN_UNPAID_ORDERS) {
    throw new ApiError(
      409,
      `You already have ${MAX_OPEN_UNPAID_ORDERS} unpaid orders. Pay or cancel one before placing another.`,
    );
  }

  const { details, lookup } = await resolvePlayerDetails(user, game, input);

  const base = {
    userId: user._id,
    gameId: game._id,
    packageId: pkg._id,
    gameSnapshot: { name: game.name, slug: game.slug },
    packageSnapshot: {
      name: pkg.name,
      group: pkg.group,
      type: pkg.type,
      description: pkg.description,
    },
    playerDetails: details,
    lookupSnapshot: lookup
      ? {
          playerName: lookup.playerName,
          level: lookup.level,
          region: lookup.region,
          provider: lookup.provider,
          checkedAt: new Date(),
        }
      : undefined,
    pricePaisaSnapshot: pkg.pricePaisa,
    costPaisaSnapshot: pkg.costPaisa,
    currency: "NPR" as const,
    status: "pending_payment" as const,
    paymentStatus: "unpaid" as const,
    version: 0,
    idempotencyKey,
  };

  for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt += 1) {
    const session = await mongoose.startSession();
    const holder: { order?: IOrder } = {};

    try {
      await session.withTransaction(async () => {
        const [order] = await Order.create(
          [{ ...base, reference: generateOrderReference() }],
          { session },
        );
        if (!order) throw new Error("Order was not created");

        await TimelineEvent.create(
          [
            {
              orderId: order._id,
              action: "created",
              toStatus: "pending_payment",
              toPaymentStatus: "unpaid",
              actorType: "customer",
              actorUserId: user._id,
              customerVisible: true,
            },
          ],
          { session },
        );
        holder.order = order;
      });

      if (holder.order) return { order: holder.order, created: true };
    } catch (err) {
      const keys = duplicateKeys(err);
      if (keys.includes("reference")) continue;
      if (keys.includes("idempotencyKey")) {
        const raced = await Order.findOne({ userId: user._id, idempotencyKey });
        if (raced) return { order: raced, created: false };
      }
      throw err;
    } finally {
      await session.endSession();
    }
  }

  throw new ApiError(503, "Could not create the order. Please try again.");
};

export const getOrderForUser = async (
  user: IUser,
  reference: string,
): Promise<IOrder> => {
  const order = await Order.findOne({ reference, userId: user._id });
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

export const transitionOwnOrder = async (
  user: IUser,
  reference: string,
  action: "signalProof" | "cancelByCustomer",
  requestId: string,
): Promise<IOrder> => {
  const order = await getOrderForUser(user, reference);
  return applyTransition({
    orderId: String(order._id),
    action,
    actor: { type: "customer", userId: String(user._id) },
    requestId,
  });
};
