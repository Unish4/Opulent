import { PaymentConfig } from "../models/PaymentConfig.js";
import { ApiError } from "../utils/ApiError.js";

export const getPaymentConfig = async () => {
  const config = await PaymentConfig.findOne({ key: "default" });
  if (!config) {
    throw new ApiError(
      503,
      "Payment details are not set up yet. Please contact support.",
    );
  }
  return config;
};
