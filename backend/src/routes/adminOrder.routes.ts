import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { requireAdmin, requireOwner } from "../middleware/requireAdmin.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
  completeSchema,
  confirmPaymentSchema,
  listOrdersQuerySchema,
  noteSchema,
  reasonSchema,
  reassignSchema,
  reopenSchema,
} from "../validators/adminOrder.validator.js";
import {
  cancelHandler,
  completeHandler,
  confirmPaymentHandler,
  failHandler,
  getOrderDetailHandler,
  holdHandler,
  listOrdersHandler,
  orderSummaryHandler,
  reassignHandler,
  rejectPaymentHandler,
  releaseHoldHandler,
  reopenHandler,
  retryHandler,
} from "../controllers/adminOrder.controller.js";

const router = Router();

router.use(attachUser, requireAdmin);

const params = validateRequest({ params: idParamSchema });

router.get(
  "/",
  validateRequest({ query: listOrdersQuerySchema }),
  listOrdersHandler,
);
router.get("/summary", orderSummaryHandler);
router.get("/:id", params, getOrderDetailHandler);

router.post(
  "/:id/confirm-payment",
  validateRequest({ params: idParamSchema, body: confirmPaymentSchema }),
  confirmPaymentHandler,
);
router.post(
  "/:id/reject-payment",
  validateRequest({ params: idParamSchema, body: reasonSchema }),
  rejectPaymentHandler,
);
router.post(
  "/:id/hold",
  validateRequest({ params: idParamSchema, body: reasonSchema }),
  holdHandler,
);
router.post(
  "/:id/release-hold",
  validateRequest({ params: idParamSchema, body: noteSchema }),
  releaseHoldHandler,
);
router.post(
  "/:id/complete",
  validateRequest({ params: idParamSchema, body: completeSchema }),
  completeHandler,
);
router.post(
  "/:id/fail",
  validateRequest({ params: idParamSchema, body: reasonSchema }),
  failHandler,
);
router.post(
  "/:id/retry",
  validateRequest({ params: idParamSchema, body: noteSchema }),
  retryHandler,
);
router.post(
  "/:id/cancel",
  validateRequest({ params: idParamSchema, body: reasonSchema }),
  cancelHandler,
);
router.post(
  "/:id/reassign",
  requireOwner,
  validateRequest({ params: idParamSchema, body: reassignSchema }),
  reassignHandler,
);
router.post(
  "/:id/reopen",
  requireOwner,
  validateRequest({ params: idParamSchema, body: reopenSchema }),
  reopenHandler,
);

export default router;
