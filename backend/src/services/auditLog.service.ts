import { AuditLog } from "../models/AuditLog.js";
import { loadUserMap } from "../utils/loadUserMap.js";
import type { ListAuditLogsQuery } from "../validators/auditLog.validator.js";

const startOfDay = (date: string): Date =>
  new Date(`${date}T00:00:00.000+05:45`);
const endOfDay = (date: string): Date => new Date(`${date}T23:59:59.999+05:45`);

export const listAuditLogs = async (query: ListAuditLogsQuery) => {
  const filter: Record<string, unknown> = {};
  if (query.action) filter.action = query.action;
  if (query.targetType) filter.targetType = query.targetType;
  if (query.reference) filter["change.reference"] = query.reference;
  if (query.dateFrom || query.dateTo) {
    const range: Record<string, Date> = {};
    if (query.dateFrom) range.$gte = startOfDay(query.dateFrom);
    if (query.dateTo) range.$lte = endOfDay(query.dateTo);
    filter.createdAt = range;
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
    AuditLog.countDocuments(filter),
  ]);

  const users = await loadUserMap(logs.map((log) => log.actorUserId));

  return {
    logs: logs.map((log) => ({
      id: String(log._id),
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      reason: log.reason ?? null,
      change: log.change ?? null,
      requestId: log.requestId ?? null,
      actorName: log.actorUserId
        ? (users.get(String(log.actorUserId))?.name ?? null)
        : null,
      createdAt: log.createdAt,
    })),
    total,
  };
};
