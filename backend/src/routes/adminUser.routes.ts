import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { requireOwner } from "../middleware/requireAdmin.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
  listUsersQuerySchema,
  setUserStatusSchema,
} from "../validators/adminUser.validator.js";
import {
  getUserHandler,
  listUsersHandler,
  setUserStatusHandler,
} from "../controllers/adminUser.controller.js";

const router = Router();

router.use(attachUser, requireOwner);

router.get(
  "/",
  validateRequest({ query: listUsersQuerySchema }),
  listUsersHandler,
);
router.get("/:id", validateRequest({ params: idParamSchema }), getUserHandler);
router.patch(
  "/:id/status",
  validateRequest({ params: idParamSchema, body: setUserStatusSchema }),
  setUserStatusHandler,
);

export default router;
