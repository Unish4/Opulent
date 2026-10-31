import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import {
  actionLimiter,
  orderLimiter,
  refundLimiter,
} from "../middleware/rateLimiter.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { myOrdersQuerySchema } from "../validators/customerOrder.validator.js";
import {
  createOrderSchema,
  referenceParamSchema,
} from "../validators/order.validator.js";
import { customerRefundSchema } from "../validators/refund.validator.js";
import {
  cancelOrderHandler,
  createOrderHandler,
  signalProofHandler,
} from "../controllers/order.controller.js";
import {
  getMyOrderHandler,
  listMyOrdersHandler,
  requestRefundHandler,
} from "../controllers/customerOrder.controller.js";

const router = Router();

router.use(attachUser);

router.get(
  "/",
  validateRequest({ query: myOrdersQuerySchema }),
  listMyOrdersHandler,
);
router.post(
  "/",
  orderLimiter,
  validateRequest({ body: createOrderSchema }),
  createOrderHandler,
);
router.get(
  "/:reference",
  validateRequest({ params: referenceParamSchema }),
  getMyOrderHandler,
);
router.post(
  "/:reference/proof-signal",
  actionLimiter,
  validateRequest({ params: referenceParamSchema }),
  signalProofHandler,
);
router.post(
  "/:reference/cancel",
  actionLimiter,
  validateRequest({ params: referenceParamSchema }),
  cancelOrderHandler,
);
router.post(
  "/:reference/refund-request",
  refundLimiter,
  validateRequest({ params: referenceParamSchema, body: customerRefundSchema }),
  requestRefundHandler,
);

export default router;
