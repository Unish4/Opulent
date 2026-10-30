import type { Request, Response } from "express";
import { uploadImageBuffer } from "../services/cloudinary.service.js";

export const uploadGameArtwork = async (req: Request, res: Response) => {
  const image = await uploadImageBuffer(req.file!.buffer, "opulent/games");
  res.status(201).json({ data: image });
};
