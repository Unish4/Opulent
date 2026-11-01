import type { IUser } from "../models/User.js";
import type { PlayerFieldKey } from "../models/Game.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { buildPlayerDetailsSchema } from "../validators/playerDetails.validator.js";
import type { LookupBody } from "../validators/lookup.validator.js";
import { getPublishedGameBySlug } from "./game.service.js";
import { resolveApiKey, resolveKeyGroup } from "./lookup/keys.js";
import { cacheKey, getCached, setCached } from "./lookup/lookupCache.js";
import { allowPerMinute, reserveMonthlyQuota } from "./lookup/quota.js";
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

  const apiKey = resolveApiKey(game.slug);
  if (!apiKey) throw unavailable();

  const key = cacheKey(providerGameCode, playerId, serverId);
  let result = await getCached(key);

  if (!result) {
    const quotaKey = `volsever:${resolveKeyGroup(game.slug)}`;

    if (!allowPerMinute(quotaKey)) {
      logger.warn({ quotaKey }, "Lookup per-minute limit reached");
      throw unavailable();
    }
    if (!(await reserveMonthlyQuota(quotaKey))) {
      logger.warn({ quotaKey }, "Lookup monthly quota reached");
      throw unavailable();
    }

    try {
      result = await provider.lookup({
        providerGameCode,
        playerId,
        serverId,
        apiKey,
      });
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

    await setCached(key, result);
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
