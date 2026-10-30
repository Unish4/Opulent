import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { requireOwner } from "../middleware/requireAdmin.js";
import {
  uploadSingleImage,
  verifyImageContent,
} from "../middleware/uploadValidation.js";
import { uploadGameArtwork } from "../controllers/upload.controller.js";

const router = Router();

router.post(
  "/game-artwork",
  attachUser,
  requireOwner,
  uploadSingleImage,
  verifyImageContent,
  uploadGameArtwork,
);

export default router;
