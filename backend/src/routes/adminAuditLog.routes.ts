import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { requireOwner } from "../middleware/requireAdmin.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { listAuditLogsQuerySchema } from "../validators/auditLog.validator.js";
import { listAuditLogsHandler } from "../controllers/adminAuditLog.controller.js";

const router = Router();

router.use(attachUser, requireOwner);

router.get(
  "/",
  validateRequest({ query: listAuditLogsQuerySchema }),
  listAuditLogsHandler,
);

export default router;
