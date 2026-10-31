import type { Request, Response } from "express";
import { lookupPlayer } from "../services/lookup.service.js";

export const lookupPlayerHandler = async (req: Request, res: Response) => {
  const result = await lookupPlayer(
    req.appUser!,
    String(req.params.slug),
    req.body,
  );
  res.status(200).json({ data: result });
};
