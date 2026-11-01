import { ENV } from "../../config/env.js";
import { LookupCache } from "../../models/LookupCache.js";
import type { PlayerLookupResult } from "./types.js";

export const cacheKey = (
  providerGameCode: string,
  playerId: string,
  serverId?: string,
): string => `${providerGameCode}:${playerId}:${serverId ?? ""}`;

export const getCached = async (
  key: string,
): Promise<PlayerLookupResult | null> => {
  const entry = await LookupCache.findOne({
    key,
    expiresAt: { $gt: new Date() },
  });
  if (!entry) return null;
  return {
    playerName: entry.playerName,
    level: entry.level,
    region: entry.region,
  };
};

export const setCached = async (
  key: string,
  value: PlayerLookupResult,
): Promise<void> => {
  await LookupCache.findOneAndUpdate(
    { key },
    {
      $set: {
        playerName: value.playerName,
        level: value.level,
        region: value.region,
        expiresAt: new Date(Date.now() + ENV.LOOKUP.CACHE_TTL_SECONDS * 1000),
      },
    },
    { upsert: true },
  );
};
