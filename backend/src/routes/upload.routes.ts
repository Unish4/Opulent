import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { requireOwner } from "../middleware/requireAdmin.js";
import {
  uploadSingleImage,
  verifyImageContent,
} from "../middleware/uploadValidation.js";
import {
  uploadGameArtwork,
  uploadPaymentQr,
} from "../controllers/upload.controller.js";

const router = Router();

router.use(attachUser, requireOwner);

router.post(
  "/game-artwork",
  uploadSingleImage,
  verifyImageContent,
  uploadGameArtwork,
);
router.post(
  "/payment-qr",
  uploadSingleImage,
  verifyImageContent,
  uploadPaymentQr,
);

export default router;
