import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { actionLimiter } from "../middleware/rateLimiter.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { updateProfileSchema } from "../validators/user.validator.js";
import { getMe, updateProfile } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", attachUser, getMe);
router.patch(
  "/me",
  attachUser,
  actionLimiter,
  validateRequest({ body: updateProfileSchema }),
  updateProfile,
);

export default router;
