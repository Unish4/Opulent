import type { Request, Response } from "express";
import {
  adjustLookupUsage,
  listLookupUsage,
} from "../services/lookupUsage.service.js";
import { getContext } from "../utils/requestContext.js";
import type { AdjustUsageBody } from "../validators/lookupUsage.validator.js";

export const listLookupUsageHandler = async (_req: Request, res: Response) => {
  res.status(200).json({ data: await listLookupUsage() });
};

export const adjustLookupUsageHandler = async (req: Request, res: Response) => {
  const { group, used } = req.body as AdjustUsageBody;
  await adjustLookupUsage(getContext(req), group, used);
  res.status(200).json({ data: await listLookupUsage() });
};
