export type PackageType = "topup" | "pass" | "bundle";

export interface PublicPackage {
  id: string;
  group: string;
  name: string;
  type: PackageType;
  description: string | null;
  badge: string | null;
  pricePaisa: number;
  isAvailable: boolean;
}

export interface AdminPackage extends PublicPackage {
  costPaisa: number | null;
  isAvailable: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface PackagePayload {
  group: string;
  name: string;
  type: PackageType;
  priceNpr: number;
  costNpr: number | null;
  description: string;
  badge: string;
  sortOrder: number;
}
