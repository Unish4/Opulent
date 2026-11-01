import mongoose from "mongoose";
import { ENV } from "../config/env.js";
import type { IGame } from "../models/Game.js";
import { Order, type IOrder, type NameSource } from "../models/Order.js";
import { Package } from "../models/Package.js";
import { TimelineEvent } from "../models/TimelineEvent.js";
import type { IUser } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { encryptSecret } from "../utils/credentialCrypto.js";
import { nepalDateString } from "../utils/dateRange.js";
import { generateOrderReference } from "../utils/generateOrderReference.js";
import type { CreateOrderInput } from "../validators/order.validator.js";
import { buildPlayerDetailsSchema } from "../validators/playerDetails.validator.js";
import { getPublishedGameBySlug } from "./game.service.js";
import { verifyLookupToken, type LookupClaims } from "./lookupToken.service.js";
import { alertProofSignal } from "./notify.service.js";
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

  const hasPasswordField = game.playerFields.some(
    (field) => field.key === "password",
  );
  if (hasPasswordField && input.credentialConsent !== true) {
    throw new ApiError(
      400,
      "Please confirm that our team may sign in to your account for this top-up.",
    );
  }

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
  const password = hasPasswordField ? parsed.password : undefined;

  const source: NameSource = lookup
    ? "lookup"
    : hasNameField
      ? "customer_typed"
      : "not_applicable";

  return {
    lookup,
    password,
    details: {
      playerId: blank(parsed.playerId),
      serverId: blank(parsed.serverId),
      email: blank(parsed.email),
      login: blank(parsed.login),
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

  if (
    ENV.PILOT_EMAILS.length > 0 &&
    user.role === "customer" &&
    !ENV.PILOT_EMAILS.includes(user.email)
  ) {
    throw new ApiError(
      403,
      "Ordering is open to invited customers only for now.",
    );
  }

  if (ENV.DAILY_ORDER_CAP > 0) {
    const startOfToday = new Date(
      `${nepalDateString(new Date())}T00:00:00.000+05:45`,
    );
    const todayCount = await Order.countDocuments({
      createdAt: { $gte: startOfToday },
    });
    if (todayCount >= ENV.DAILY_ORDER_CAP) {
      throw new ApiError(
        409,
        "We have reached today's order limit. Please try again tomorrow.",
      );
    }
  }

  const game = await getPublishedGameBySlug(input.gameSlug);
  if (!game.acceptingOrders) {
    throw new ApiError(409, `Orders for ${game.name} are paused right now.`);
  }

  const pkg = await Package.findOne({
    _id: input.packageId,
    gameId: game._id,
    isAvailable: true,
  });
  if (!pkg) throw new ApiError(409, "This package is currently unavailable.");

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

  const { details, lookup, password } = await resolvePlayerDetails(
    user,
    game,
    input,
  );

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
    const reference = generateOrderReference();

    try {
      await session.withTransaction(async () => {
        const [order] = await Order.create(
          [
            {
              ...base,
              reference,
              ...(password
                ? {
                    credentialSecret: encryptSecret(password, reference),
                    hasCredential: true,
                  }
                : {}),
            },
          ],
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
  const wasPending = order.status === "pending_payment";

  const updated = await applyTransition({
    orderId: String(order._id),
    action,
    actor: { type: "customer", userId: String(user._id) },
    requestId,
  });

  if (action === "signalProof" && wasPending) void alertProofSignal(updated);
  return updated;
};
