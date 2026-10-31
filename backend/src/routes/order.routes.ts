import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { orderLimiter } from "../middleware/rateLimiter.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createOrderSchema,
  referenceParamSchema,
} from "../validators/order.validator.js";
import {
  createOrderHandler,
  getOrderHandler,
} from "../controllers/order.controller.js";

const router = Router();

router.use(attachUser);

router.post(
  "/",
  orderLimiter,
  validateRequest({ body: createOrderSchema }),
  createOrderHandler,
);
router.get(
  "/:reference",
  validateRequest({ params: referenceParamSchema }),
  getOrderHandler,
);

export default router;
