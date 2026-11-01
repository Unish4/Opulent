import { ENV } from "../config/env.js";
import type { IOrder } from "../models/Order.js";
import { logger } from "../utils/logger.js";

export const sendAdminAlert = async (text: string): Promise<boolean> => {
  const token = ENV.TELEGRAM.BOT_TOKEN;
  const chatId = ENV.TELEGRAM.CHAT_ID;

  if (!token || !chatId) {
    logger.debug("Telegram alert skipped: bot token or chat ID not configured");
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logger.warn({ status: res.status, body }, "Telegram alert failed to send");
      return false;
    }

    return true;
  } catch (err) {
    logger.warn({ err }, "Telegram alert error");
    return false;
  }
};

export const alertProofSignal = async (order: IOrder): Promise<boolean> => {
  const text = `Proof signaled for order ${order.reference}\nGame: ${order.gameSnapshot.name}\nPackage: ${order.packageSnapshot.name}\nAmount: NPR ${order.pricePaisaSnapshot / 100}`;
  return sendAdminAlert(text);
};
