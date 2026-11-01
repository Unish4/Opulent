import { ENV } from "../../config/env.js";
import { LookupUsage } from "../../models/LookupUsage.js";
import { nepalDateString } from "../../utils/dateRange.js";

export const currentPeriod = (): string =>
  nepalDateString(new Date()).slice(0, 7);

const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  err.code === 11000;

export const reserveMonthlyQuota = async (
  quotaKey: string,
): Promise<boolean> => {
  const period = currentPeriod();

  const updated = await LookupUsage.findOneAndUpdate(
    {
      quotaKey,
      period,
      count: { $lt: ENV.LOOKUP.MONTHLY_LIMIT },
    },
    { $inc: { count: 1 } },
    { returnDocument: "after" },
  );

  if (updated) return true;

  const existing = await LookupUsage.findOne({ quotaKey, period });
  if (existing) {
    return false;
  }

  try {
    await LookupUsage.create({
      quotaKey,
      period,
      count: 1,
    });
    return true;
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      const retried = await LookupUsage.findOneAndUpdate(
        {
          quotaKey,
          period,
          count: { $lt: ENV.LOOKUP.MONTHLY_LIMIT },
        },
        { $inc: { count: 1 } },
        { returnDocument: "after" },
      );
      return !!retried;
    }
    throw err;
  }
};

const recent = new Map<string, number[]>();

export const allowPerMinute = (quotaKey: string): boolean => {
  const now = Date.now();
  const list = (recent.get(quotaKey) ?? []).filter(
    (time) => now - time < 60_000,
  );
  if (list.length >= ENV.LOOKUP.PER_MINUTE_LIMIT) {
    recent.set(quotaKey, list);
    return false;
  }
  list.push(now);
  recent.set(quotaKey, list);
  return true;
};
