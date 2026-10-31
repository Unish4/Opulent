import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { requireAdmin, requireOwner } from "../middleware/requireAdmin.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { rangeQuerySchema } from "../validators/adminDashboard.validator.js";
import {
  downloadReconciliationHandler,
  getDashboardHandler,
} from "../controllers/adminDashboard.controller.js";

const router = Router();

router.use(attachUser, requireAdmin);

router.get(
  "/",
  validateRequest({ query: rangeQuerySchema }),
  getDashboardHandler,
);
router.get(
  "/reconciliation.csv",
  requireOwner,
  validateRequest({ query: rangeQuerySchema }),
  downloadReconciliationHandler,
);

export default router;
