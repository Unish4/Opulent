import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { requireOwner } from "../middleware/requireAdmin.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  idParamSchema,
  inviteMemberSchema,
  setRoleSchema,
} from "../validators/team.validator.js";
import {
  createInvite,
  deleteInvite,
  getTeam,
  updateMemberRole,
} from "../controllers/adminTeam.controller.js";

const router = Router();

router.use(attachUser, requireOwner);

router.get("/", getTeam);
router.post(
  "/invitations",
  validateRequest({ body: inviteMemberSchema }),
  createInvite,
);
router.delete(
  "/invitations/:id",
  validateRequest({ params: idParamSchema }),
  deleteInvite,
);
router.patch(
  "/members/:id/role",
  validateRequest({ params: idParamSchema, body: setRoleSchema }),
  updateMemberRole,
);

export default router;
