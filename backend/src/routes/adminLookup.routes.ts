import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { requireAdmin, requireOwner } from "../middleware/requireAdmin.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { adjustUsageSchema } from "../validators/lookupUsage.validator.js";
import {
  adjustLookupUsageHandler,
  listLookupUsageHandler,
} from "../controllers/adminLookup.controller.js";

const router = Router();

router.use(attachUser, requireAdmin);

router.get("/usage", listLookupUsageHandler);
router.patch(
  "/usage",
  requireOwner,
  validateRequest({ body: adjustUsageSchema }),
  adjustLookupUsageHandler,
);

export default router;
