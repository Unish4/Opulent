import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { getPaymentConfigHandler } from "../controllers/payment.controller.js";

const router = Router();

router.get("/config", attachUser, getPaymentConfigHandler);

export default router;
