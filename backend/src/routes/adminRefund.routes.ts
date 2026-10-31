import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { requireAdmin, requireOwner } from "../middleware/requireAdmin.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
  adminRefundSchema,
  approveRefundSchema,
  denyRefundSchema,
  listRefundsQuerySchema,
  markPaidSchema,
} from "../validators/refund.validator.js";
import {
  approveRefundHandler,
  createRefundHandler,
  denyRefundHandler,
  listRefundsHandler,
  markRefundPaidHandler,
  refundSummaryHandler,
} from "../controllers/refund.controller.js";

const router = Router();

router.use(attachUser, requireAdmin);

router.get(
  "/",
  validateRequest({ query: listRefundsQuerySchema }),
  listRefundsHandler,
);
router.get("/summary", refundSummaryHandler);
router.post(
  "/",
  validateRequest({ body: adminRefundSchema }),
  createRefundHandler,
);
router.post(
  "/:id/approve",
  requireOwner,
  validateRequest({ params: idParamSchema, body: approveRefundSchema }),
  approveRefundHandler,
);
router.post(
  "/:id/deny",
  requireOwner,
  validateRequest({ params: idParamSchema, body: denyRefundSchema }),
  denyRefundHandler,
);
router.post(
  "/:id/mark-paid",
  requireOwner,
  validateRequest({ params: idParamSchema, body: markPaidSchema }),
  markRefundPaidHandler,
);

export default router;
