import type { Request, Response } from "express";
import { Webhook } from "svix";
import { ENV } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    primary_email_address_id?: string | null;
    email_addresses?: { id: string; email_address: string }[];
  };
}

export const handleClerkWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const secret = ENV.CLERK.WEBHOOK_SECRET;
  if (!secret) throw new ApiError(503, "Webhook is not configured");

  const svixId = req.header("svix-id");
  const svixTimestamp = req.header("svix-timestamp");
  const svixSignature = req.header("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature)
    throw new ApiError(400, "Missing svix headers");

  let event: ClerkWebhookEvent;
  try {
    event = new Webhook(secret).verify(req.body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as unknown as ClerkWebhookEvent;
  } catch {
    throw new ApiError(400, "Invalid webhook signature");
  }

  const { type, data } = event;

  if (type === "user.updated") {
    const primary =
      data.email_addresses?.find(
        (e) => e.id === data.primary_email_address_id,
      ) ?? data.email_addresses?.[0];
    if (primary) {
      await User.updateOne(
        { clerkId: data.id },
        { $set: { email: primary.email_address.toLowerCase() } },
      );
    }
  }

  if (type === "user.deleted") {
    await User.updateOne({ clerkId: data.id }, { $set: { status: "deleted" } });
  }

  res.status(200).json({ data: { received: true } });
};
