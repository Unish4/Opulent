import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { toUserDto } from "../utils/toUserDto.js";

export const getMe = async (req: Request, res: Response) => {
  res.status(200).json({ data: toUserDto(req.appUser!) });
};

export const updateProfile = async (req: Request, res: Response) => {
  const { name, phone } = req.body as { name?: string; phone?: string };

  const updated = await User.findByIdAndUpdate(
    req.appUser!._id,
    {
      $set: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
      },
    },
    { new: true, runValidators: true },
  );

  res.status(200).json({ data: toUserDto(updated!) });
};
