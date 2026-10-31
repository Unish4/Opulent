import { ENV } from "../config/env.js";
import type { IUser } from "../models/User.js";
import type { PlayerFieldKey } from "../models/Game.js";
import { LookupUsage } from "../models/LookupUsage.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { buildPlayerDetailsSchema } from "../validators/playerDetails.validator.js";
import type { LookupBody } from "../validators/lookup.validator.js";
import { getPublishedGameBySlug } from "./game.service.js";
import { cacheKey, getCached, setCached } from "./lookup/lookupCache.js";
import { LookupError, type PlayerLookupProvider } from "./lookup/types.js";
import { VolseverProvider } from "./lookup/volsever.provider.js";
import { signLookupToken } from "./lookupToken.service.js";

const provider: PlayerLookupProvider = new VolseverProvider();

const unavailable = () =>
  new ApiError(
    503,
    "Player check is unavailable right now.",
    "LOOKUP_UNAVAILABLE",
  );

const nepalDate = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kathmandu" }).format(
    new Date(),
  );

const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  err.code === 11000;

// Atomic: the filter only matches while count is below the limit. Once the limit is reached the
// upsert tries to insert a second (provider, date) document and the unique index rejects it.
const reserveDailyQuota = async (providerName: string): Promise<boolean> => {
  try {
    await LookupUsage.findOneAndUpdate(
      {
        provider: providerName,
        date: nepalDate(),
        count: { $lt: ENV.LOOKUP.DAILY_LIMIT },
      },
      { $inc: { count: 1 } },
      { upsert: true, new: true },
    );
    return true;
  } catch (err) {
    if (isDuplicateKeyError(err)) return false;
    throw err;
  }
};

export const lookupPlayer = async (
  user: IUser,
  slug: string,
  input: LookupBody,
) => {
  const game = await getPublishedGameBySlug(slug);
  const providerGameCode = game.lookup.providerGameCode;

  if (!game.lookup.enabled || !providerGameCode) {
    throw new ApiError(
      400,
      "Player check is not available for this game.",
      "LOOKUP_NOT_SUPPORTED",
    );
  }

  const hasServer = game.playerFields.some((field) => field.key === "serverId");
  const keys: PlayerFieldKey[] = hasServer
    ? ["playerId", "serverId"]
    : ["playerId"];
  const parsed = buildPlayerDetailsSchema(game.playerFields, keys).parse({
    playerId: input.playerId,
    ...(hasServer ? { serverId: input.serverId ?? "" } : {}),
  }) as Record<string, string>;

  const playerId = parsed.playerId as string;
  const serverId = hasServer ? (parsed.serverId as string) : undefined;

  if (!ENV.VOLSEVER.API_KEY) throw unavailable();

  const key = cacheKey(providerGameCode, playerId, serverId);
  let result = getCached(key);

  if (!result) {
    if (!(await reserveDailyQuota(provider.name))) {
      logger.warn({ provider: provider.name }, "Lookup daily quota reached");
      throw unavailable();
    }

    try {
      result = await provider.lookup({ providerGameCode, playerId, serverId });
    } catch (err) {
      if (err instanceof LookupError) {
        if (err.kind === "not_found") {
          throw new ApiError(
            404,
            "No account found for this ID.",
            "PLAYER_NOT_FOUND",
          );
        }
        if (err.kind === "invalid_input") {
          throw new ApiError(400, "That ID format was not accepted.");
        }
        logger.warn({ kind: err.kind, game: slug }, "Player lookup failed");
      } else {
        logger.error({ err, game: slug }, "Player lookup crashed");
      }
      throw unavailable();
    }

    setCached(key, result);
  }

  const { token, expiresAt } = await signLookupToken(String(user._id), {
    gameId: String(game._id),
    playerId,
    serverId: serverId ?? "",
    playerName: result.playerName,
    level: result.level,
    region: result.region,
    provider: provider.name,
  });

  return {
    playerName: result.playerName,
    level: result.level,
    region: result.region,
    lookupToken: token,
    expiresAt,
  };
};
