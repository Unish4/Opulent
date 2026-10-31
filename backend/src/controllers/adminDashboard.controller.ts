import type { Request, Response } from "express";
import { getDashboard } from "../services/dashboard.service.js";
import { buildReconciliationCsv } from "../services/report.service.js";
import { resolveRange } from "../utils/dateRange.js";
import type { RangeQuery } from "../validators/adminDashboard.validator.js";

export const getDashboardHandler = async (req: Request, res: Response) => {
  const query = res.locals.query as RangeQuery;
  const data = await getDashboard(
    req.appUser!,
    resolveRange(query.from, query.to),
  );
  res.status(200).json({ data });
};

export const downloadReconciliationHandler = async (
  _req: Request,
  res: Response,
) => {
  const query = res.locals.query as RangeQuery;
  const range = resolveRange(query.from, query.to);
  const csv = await buildReconciliationCsv(range);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="reconciliation-${range.from}-to-${range.to}.csv"`,
  );
  res.status(200).send(`\uFEFF${csv}`);
};
