import { ENV } from "../config/env.js";
import { Game } from "../models/Game.js";
import { LookupUsage } from "../models/LookupUsage.js";
import { ApiError } from "../utils/ApiError.js";
import type { RequestContext } from "../utils/requestContext.js";
import { writeAuditLog } from "./audit.service.js";
import { resolveApiKey, resolveKeyGroup } from "./lookup/keys.js";
import { currentPeriod } from "./lookup/quota.js";

export const listLookupUsage = async () => {
  const period = currentPeriod();
  const [games, rows] = await Promise.all([
    Game.find({ "lookup.enabled": true }).sort({ sortOrder: 1 }),
    LookupUsage.find({ period }),
  ]);
  const usage = new Map(rows.map((row) => [row.quotaKey, row.count]));

  return {
    period,
    monthlyLimit: ENV.LOOKUP.MONTHLY_LIMIT,
    keys: games.map((game) => {
      const group = resolveKeyGroup(game.slug);
      return {
        slug: game.slug,
        name: game.name,
        group,
        shared: group === "default",
        usedThisMonth: usage.get(`volsever:${group}`) ?? 0,
        keyConfigured: !!resolveApiKey(game.slug),
      };
    }),
  };
};

export const adjustLookupUsage = async (
  { actor, requestId }: RequestContext,
  group: string,
  used: number,
): Promise<void> => {
  if (group !== "default") {
    const exists = await Game.exists({ slug: group });
    if (!exists) throw new ApiError(404, "Unknown key group.");
  }

  const quotaKey = `volsever:${group}`;
  const period = currentPeriod();
  const before = await LookupUsage.findOne({ quotaKey, period });

  await LookupUsage.findOneAndUpdate(
    { quotaKey, period },
    { $set: { count: used } },
    { upsert: true, returnDocument: "after" },
  );

  await writeAuditLog({
    actorUserId: actor._id,
    action: "lookup_usage_adjusted",
    targetType: "LookupUsage",
    targetId: quotaKey,
    change: { period, before: before?.count ?? 0, after: used },
    requestId,
  });
};
