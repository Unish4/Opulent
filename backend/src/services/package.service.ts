import { Game } from "../models/Game.js";
import { Package, type IPackage } from "../models/Package.js";
import { ApiError } from "../utils/ApiError.js";
import { diffFields } from "../utils/diffFields.js";
import { nprToPaisa } from "../utils/money.js";
import type { RequestContext } from "../utils/requestContext.js";
import type {
  CreatePackageInput,
  UpdatePackageInput,
} from "../validators/package.validator.js";
import { writeAuditLog } from "./audit.service.js";
import { getPublishedGameBySlug } from "./game.service.js";

const blank = (value?: string): string | undefined =>
  value && value.length > 0 ? value : undefined;

const snapshot = (pkg: IPackage) => ({
  group: pkg.group,
  name: pkg.name,
  type: pkg.type,
  description: pkg.description ?? null,
  badge: pkg.badge ?? null,
  pricePaisa: pkg.pricePaisa,
  costPaisa: pkg.costPaisa ?? null,
  sortOrder: pkg.sortOrder,
});

const assertGameExists = async (gameId: string): Promise<void> => {
  const exists = await Game.exists({ _id: gameId });
  if (!exists) throw new ApiError(404, "Game not found");
};

const findPackage = async (id: string): Promise<IPackage> => {
  const pkg = await Package.findById(id);
  if (!pkg) throw new ApiError(404, "Package not found");
  return pkg;
};

export const listPublicPackages = async (slug: string) => {
  const game = await getPublishedGameBySlug(slug);
  return Package.find({ gameId: game._id, isAvailable: true }).sort({
    sortOrder: 1,
    name: 1,
  });
};

export const listAdminPackages = async (gameId: string) => {
  await assertGameExists(gameId);
  return Package.find({ gameId }).sort({ sortOrder: 1, name: 1 });
};

export const createPackage = async (
  { actor, requestId }: RequestContext,
  gameId: string,
  input: CreatePackageInput,
) => {
  await assertGameExists(gameId);

  const pkg = await Package.create({
    gameId,
    group: input.group,
    name: input.name,
    type: input.type,
    description: blank(input.description),
    badge: blank(input.badge),
    pricePaisa: nprToPaisa(input.priceNpr),
    costPaisa: input.costNpr == null ? undefined : nprToPaisa(input.costNpr),
    sortOrder: input.sortOrder,
  });

  await writeAuditLog({
    actorUserId: actor._id,
    action: "package_created",
    targetType: "Package",
    targetId: String(pkg._id),
    change: { gameId, ...snapshot(pkg) },
    requestId,
  });

  return pkg;
};

export const updatePackage = async (
  { actor, requestId }: RequestContext,
  id: string,
  input: UpdatePackageInput,
) => {
  const pkg = await findPackage(id);
  const before = snapshot(pkg);

  if (input.group !== undefined) pkg.group = input.group;
  if (input.name !== undefined) pkg.name = input.name;
  if (input.type !== undefined) pkg.type = input.type;
  if (input.description !== undefined)
    pkg.description = blank(input.description);
  if (input.badge !== undefined) pkg.badge = blank(input.badge);
  if (input.sortOrder !== undefined) pkg.sortOrder = input.sortOrder;
  if (input.priceNpr !== undefined) pkg.pricePaisa = nprToPaisa(input.priceNpr);
  if (input.costNpr !== undefined) {
    pkg.costPaisa =
      input.costNpr === null ? undefined : nprToPaisa(input.costNpr);
  }

  await pkg.save();

  const changed = diffFields(
    before,
    snapshot(pkg),
    Object.keys(before) as (keyof typeof before)[],
  );
  const { pricePaisa, costPaisa, ...rest } = changed;
  const priceChange = {
    ...(pricePaisa ? { pricePaisa } : {}),
    ...(costPaisa ? { costPaisa } : {}),
  };

  if (Object.keys(priceChange).length > 0) {
    await writeAuditLog({
      actorUserId: actor._id,
      action: "package_price_changed",
      targetType: "Package",
      targetId: String(pkg._id),
      change: { name: pkg.name, ...priceChange },
      requestId,
    });
  }
  if (Object.keys(rest).length > 0) {
    await writeAuditLog({
      actorUserId: actor._id,
      action: "package_updated",
      targetType: "Package",
      targetId: String(pkg._id),
      change: rest,
      requestId,
    });
  }

  return pkg;
};

export const setPackageAvailability = async (
  { actor, requestId }: RequestContext,
  id: string,
  isAvailable: boolean,
) => {
  const pkg = await findPackage(id);
  if (pkg.isAvailable === isAvailable) return pkg;

  const previous = pkg.isAvailable;
  pkg.isAvailable = isAvailable;
  await pkg.save();

  await writeAuditLog({
    actorUserId: actor._id,
    action: "package_availability_changed",
    targetType: "Package",
    targetId: String(pkg._id),
    change: { name: pkg.name, before: previous, after: isAvailable },
    requestId,
  });

  return pkg;
};
