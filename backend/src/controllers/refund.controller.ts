import type { Request, Response } from "express";
import {
  createRefundAsAdmin,
  decideRefund,
  getRefundSummary,
  listRefunds,
  markRefundPaid,
  presentAdminRefund,
} from "../services/refund.service.js";
import { getContext } from "../utils/requestContext.js";
import type { ListRefundsQuery } from "../validators/refund.validator.js";

export const listRefundsHandler = async (_req: Request, res: Response) => {
  const query = res.locals.query as ListRefundsQuery;
  const { refunds, total } = await listRefunds(query);
  res
    .status(200)
    .json({
      data: refunds,
      meta: { page: query.page, limit: query.limit, total },
    });
};

export const refundSummaryHandler = async (_req: Request, res: Response) => {
  res.status(200).json({ data: await getRefundSummary() });
};

export const createRefundHandler = async (req: Request, res: Response) => {
  const refund = await createRefundAsAdmin(getContext(req), req.body);
  res.status(201).json({ data: await presentAdminRefund(refund) });
};

export const approveRefundHandler = async (req: Request, res: Response) => {
  const { note } = req.body as { note?: string };
  const refund = await decideRefund(
    getContext(req),
    String(req.params.id),
    "approve",
    note,
  );
  res.status(200).json({ data: await presentAdminRefund(refund) });
};

export const denyRefundHandler = async (req: Request, res: Response) => {
  const { note } = req.body as { note: string };
  const refund = await decideRefund(
    getContext(req),
    String(req.params.id),
    "deny",
    note,
  );
  res.status(200).json({ data: await presentAdminRefund(refund) });
};

export const markRefundPaidHandler = async (req: Request, res: Response) => {
  const { paidOutTxnId } = req.body as { paidOutTxnId: string };
  const refund = await markRefundPaid(
    getContext(req),
    String(req.params.id),
    paidOutTxnId,
  );
  res.status(200).json({ data: await presentAdminRefund(refund) });
};
