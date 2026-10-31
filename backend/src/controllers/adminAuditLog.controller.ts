import type { Request, Response } from "express";
import { listAuditLogs } from "../services/auditLog.service.js";
import type { ListAuditLogsQuery } from "../validators/auditLog.validator.js";

export const listAuditLogsHandler = async (_req: Request, res: Response) => {
  const query = res.locals.query as ListAuditLogsQuery;
  const { logs, total } = await listAuditLogs(query);
  res
    .status(200)
    .json({
      data: logs,
      meta: { page: query.page, limit: query.limit, total },
    });
};
