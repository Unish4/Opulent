import type { IPackage } from "../models/Package.js";

export const toPublicPackageDto = (pkg: IPackage) => ({
  id: String(pkg._id),
  group: pkg.group,
  name: pkg.name,
  type: pkg.type,
  description: pkg.description ?? null,
  badge: pkg.badge ?? null,
  pricePaisa: pkg.pricePaisa,
});

export const toAdminPackageDto = (pkg: IPackage, includeCost: boolean) => ({
  ...toPublicPackageDto(pkg),
  costPaisa: includeCost ? (pkg.costPaisa ?? null) : null,
  isAvailable: pkg.isAvailable,
  sortOrder: pkg.sortOrder,
  updatedAt: pkg.updatedAt,
});
