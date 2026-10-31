import type { Request, Response } from "express";
import { z } from "zod";
import { createOrder, getOrderForUser } from "../services/order.service.js";
import { ApiError } from "../utils/ApiError.js";
import { toOrderDto } from "../utils/toOrderDto.js";

const idempotencyKeySchema = z.string().regex(/^[A-Za-z0-9-]{16,64}$/);

export const createOrderHandler = async (req: Request, res: Response) => {
  const key = idempotencyKeySchema.safeParse(req.header("idempotency-key"));
  if (!key.success)
    throw new ApiError(400, "A valid Idempotency-Key header is required.");

  const { order, created } = await createOrder(
    req.appUser!,
    req.body,
    key.data,
  );
  res.status(created ? 201 : 200).json({ data: toOrderDto(order) });
};

export const getOrderHandler = async (req: Request, res: Response) => {
  const order = await getOrderForUser(
    req.appUser!,
    String(req.params.reference),
  );
  res.status(200).json({ data: toOrderDto(order) });
};
