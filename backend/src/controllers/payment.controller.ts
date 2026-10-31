import type { Request, Response } from "express";
import { getPaymentConfig } from "../services/payment.service.js";

export const getPaymentConfigHandler = async (_req: Request, res: Response) => {
  const config = await getPaymentConfig();
  res.status(200).json({
    data: {
      methodLabel: config.methodLabel,
      recipientName: config.recipientName,
      qrImageUrl: config.qrImageUrl,
      whatsappNumber: config.whatsappNumber,
      instructions: config.instructions,
    },
  });
};
