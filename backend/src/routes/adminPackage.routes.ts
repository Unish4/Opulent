import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { requireAdmin, requireOwner } from "../middleware/requireAdmin.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
  packageAvailabilitySchema,
  updatePackageSchema,
} from "../validators/package.validator.js";
import {
  setPackageAvailabilityHandler,
  updatePackageHandler,
} from "../controllers/package.controller.js";

const router = Router();

router.use(attachUser, requireAdmin);

router.patch(
  "/:id",
  requireOwner,
  validateRequest({ params: idParamSchema, body: updatePackageSchema }),
  updatePackageHandler,
);
router.patch(
  "/:id/availability",
  validateRequest({ params: idParamSchema, body: packageAvailabilitySchema }),
  setPackageAvailabilityHandler,
);

export default router;
