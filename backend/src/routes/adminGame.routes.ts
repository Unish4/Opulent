import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { requireAdmin, requireOwner } from "../middleware/requireAdmin.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
  availabilitySchema,
  createGameSchema,
  updateGameSchema,
} from "../validators/game.validator.js";
import { createPackageSchema } from "../validators/package.validator.js";
import {
  createGameHandler,
  getAdminGameHandler,
  listAdminGamesHandler,
  setGameAvailabilityHandler,
  updateGameHandler,
} from "../controllers/adminGame.controller.js";
import {
  createGamePackage,
  listAdminGamePackages,
} from "../controllers/package.controller.js";

const router = Router();

router.use(attachUser, requireAdmin);

router.get("/", listAdminGamesHandler);
router.post(
  "/",
  requireOwner,
  validateRequest({ body: createGameSchema }),
  createGameHandler,
);
router.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  getAdminGameHandler,
);
router.patch(
  "/:id",
  requireOwner,
  validateRequest({ params: idParamSchema, body: updateGameSchema }),
  updateGameHandler,
);
router.patch(
  "/:id/availability",
  validateRequest({ params: idParamSchema, body: availabilitySchema }),
  setGameAvailabilityHandler,
);
router.get(
  "/:id/packages",
  validateRequest({ params: idParamSchema }),
  listAdminGamePackages,
);
router.post(
  "/:id/packages",
  requireOwner,
  validateRequest({ params: idParamSchema, body: createPackageSchema }),
  createGamePackage,
);

export default router;
