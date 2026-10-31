import { ENV } from "../../config/env.js";
import type { PlayerLookupResult } from "./types.js";

interface Entry {
  value: PlayerLookupResult;
  expiresAt: number;
}

const MAX_ENTRIES = 1000;
const store = new Map<string, Entry>();

export const cacheKey = (
  providerGameCode: string,
  playerId: string,
  serverId?: string,
): string => `${providerGameCode}:${playerId}:${serverId ?? ""}`;

export const getCached = (key: string): PlayerLookupResult | null => {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

export const setCached = (key: string, value: PlayerLookupResult): void => {
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  store.set(key, {
    value,
    expiresAt: Date.now() + ENV.LOOKUP.CACHE_TTL_SECONDS * 1000,
  });
};
