import type { Request, Response } from "express";
import {
  getAdminPaymentConfig,
  updatePaymentConfig,
} from "../services/adminPayment.service.js";
import { getContext } from "../utils/requestContext.js";
import type { IPaymentConfig } from "../models/PaymentConfig.js";

const toDto = (config: IPaymentConfig) => ({
  methodLabel: config.methodLabel,
  recipientName: config.recipientName,
  qrImageUrl: config.qrImageUrl,
  whatsappNumber: config.whatsappNumber,
  instructions: config.instructions,
  updatedAt: config.updatedAt,
});

export const getPaymentConfigAdminHandler = async (
  _req: Request,
  res: Response,
) => {
  const config = await getAdminPaymentConfig();
  res.status(200).json({ data: config ? toDto(config) : null });
};

export const updatePaymentConfigHandler = async (
  req: Request,
  res: Response,
) => {
  const config = await updatePaymentConfig(getContext(req), req.body);
  res.status(200).json({ data: toDto(config) });
};
