import type { Request, Response } from "express";
import {
  createPackage,
  listAdminPackages,
  listPublicPackages,
  setPackageAvailability,
  updatePackage,
} from "../services/package.service.js";
import { getContext } from "../utils/requestContext.js";
import {
  toAdminPackageDto,
  toPublicPackageDto,
} from "../utils/toPackageDto.js";

const canSeeCost = (req: Request): boolean => req.appUser?.role === "owner";

export const getGamePackages = async (req: Request, res: Response) => {
  const packages = await listPublicPackages(String(req.params.slug));
  res.status(200).json({ data: packages.map(toPublicPackageDto) });
};

export const listAdminGamePackages = async (req: Request, res: Response) => {
  const packages = await listAdminPackages(String(req.params.id));
  res
    .status(200)
    .json({
      data: packages.map((pkg) => toAdminPackageDto(pkg, canSeeCost(req))),
    });
};

export const createGamePackage = async (req: Request, res: Response) => {
  const pkg = await createPackage(
    getContext(req),
    String(req.params.id),
    req.body,
  );
  res.status(201).json({ data: toAdminPackageDto(pkg, canSeeCost(req)) });
};

export const updatePackageHandler = async (req: Request, res: Response) => {
  const pkg = await updatePackage(
    getContext(req),
    String(req.params.id),
    req.body,
  );
  res.status(200).json({ data: toAdminPackageDto(pkg, canSeeCost(req)) });
};

export const setPackageAvailabilityHandler = async (
  req: Request,
  res: Response,
) => {
  const { isAvailable } = req.body as { isAvailable: boolean };
  const pkg = await setPackageAvailability(
    getContext(req),
    String(req.params.id),
    isAvailable,
  );
  res.status(200).json({ data: toAdminPackageDto(pkg, canSeeCost(req)) });
};
