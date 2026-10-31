import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { requireOwner } from "../middleware/requireAdmin.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paymentConfigSchema } from "../validators/paymentConfig.validator.js";
import {
  getPaymentConfigAdminHandler,
  updatePaymentConfigHandler,
} from "../controllers/adminPaymentConfig.controller.js";

const router = Router();

router.use(attachUser, requireOwner);

router.get("/", getPaymentConfigAdminHandler);
router.put(
  "/",
  validateRequest({ body: paymentConfigSchema }),
  updatePaymentConfigHandler,
);

export default router;
