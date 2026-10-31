import { Game, type IGame, type IPlayerField } from "../models/Game.js";
import { ApiError } from "../utils/ApiError.js";
import { diffFields } from "../utils/diffFields.js";
import { logger } from "../utils/logger.js";
import type { RequestContext } from "../utils/requestContext.js";
import type {
  CreateGameInput,
  UpdateGameInput,
} from "../validators/game.validator.js";
import { writeAuditLog } from "./audit.service.js";
import { deleteImage } from "./cloudinary.service.js";

const blank = (value?: string): string | undefined =>
  value && value.length > 0 ? value : undefined;

const normalizeField = (
  field: CreateGameInput["playerFields"][number],
): IPlayerField => ({
  key: field.key,
  label: field.label,
  placeholder: blank(field.placeholder),
  helpText: blank(field.helpText),
  required: field.required,
  ruleType: field.ruleType,
  minLength: field.minLength,
  maxLength: field.maxLength,
});

const snapshot = (game: IGame) => ({
  name: game.name,
  aliases: [...game.aliases],
  publisher: game.publisher ?? null,
  description: game.description ?? null,
  instructions: game.instructions ?? null,
  imageUrl: game.imageUrl ?? null,
  playerFields: game.playerFields.map((field) => ({
    key: field.key,
    label: field.label,
    placeholder: field.placeholder ?? null,
    helpText: field.helpText ?? null,
    required: field.required,
    ruleType: field.ruleType,
    minLength: field.minLength,
    maxLength: field.maxLength,
  })),
  lookup: {
    enabled: game.lookup.enabled,
    providerGameCode: game.lookup.providerGameCode ?? null,
  },
  isPublished: game.isPublished,
  isFeatured: game.isFeatured,
  sortOrder: game.sortOrder,
});

export const listAdminGames = () => Game.find().sort({ sortOrder: 1, name: 1 });

export const getAdminGame = async (id: string): Promise<IGame> => {
  const game = await Game.findById(id);
  if (!game) throw new ApiError(404, "Game not found");
  return game;
};

export const createGame = async (
  { actor, requestId }: RequestContext,
  input: CreateGameInput,
) => {
  const game = await Game.create({
    name: input.name,
    slug: input.slug,
    aliases: input.aliases,
    publisher: blank(input.publisher),
    description: blank(input.description),
    instructions: blank(input.instructions),
    imageUrl: input.imageUrl,
    imagePublicId: input.imagePublicId,
    fulfilmentType: "uid_topup",
    playerFields: input.playerFields.map(normalizeField),
    lookup: {
      enabled: input.lookup.enabled,
      providerGameCode: blank(input.lookup.providerGameCode),
    },
    isPublished: input.isPublished,
    acceptingOrders: true,
    isFeatured: input.isFeatured,
    sortOrder: input.sortOrder,
  });

  await writeAuditLog({
    actorUserId: actor._id,
    action: "game_created",
    targetType: "Game",
    targetId: String(game._id),
    change: { name: game.name, slug: game.slug, isPublished: game.isPublished },
    requestId,
  });

  return game;
};

export const updateGame = async (
  { actor, requestId }: RequestContext,
  id: string,
  input: UpdateGameInput,
) => {
  const game = await getAdminGame(id);
  const before = snapshot(game);
  const previousPublicId = game.imagePublicId;

  if (input.name !== undefined) game.name = input.name;
  if (input.aliases !== undefined) game.aliases = input.aliases;
  if (input.publisher !== undefined) game.publisher = blank(input.publisher);
  if (input.description !== undefined)
    game.description = blank(input.description);
  if (input.instructions !== undefined)
    game.instructions = blank(input.instructions);
  if (input.playerFields !== undefined)
    game.playerFields = input.playerFields.map(normalizeField);
  if (input.lookup !== undefined) {
    game.lookup = {
      enabled: input.lookup.enabled,
      providerGameCode: blank(input.lookup.providerGameCode),
    };
  }
  if (input.imageUrl !== undefined) {
    game.imageUrl = input.imageUrl;
    game.imagePublicId = input.imagePublicId;
  }
  if (input.isPublished !== undefined) game.isPublished = input.isPublished;
  if (input.isFeatured !== undefined) game.isFeatured = input.isFeatured;
  if (input.sortOrder !== undefined) game.sortOrder = input.sortOrder;

  await game.save();

  const after = snapshot(game);
  const { isPublished, ...rest } = diffFields(
    before,
    after,
    Object.keys(before) as (keyof typeof before)[],
  );

  if (isPublished) {
    await writeAuditLog({
      actorUserId: actor._id,
      action: game.isPublished ? "game_published" : "game_unpublished",
      targetType: "Game",
      targetId: String(game._id),
      change: { name: game.name },
      requestId,
    });
  }
  if (Object.keys(rest).length > 0) {
    await writeAuditLog({
      actorUserId: actor._id,
      action: "game_updated",
      targetType: "Game",
      targetId: String(game._id),
      change: rest,
      requestId,
    });
  }

  if (previousPublicId && previousPublicId !== game.imagePublicId) {
    deleteImage(previousPublicId).catch((err) =>
      logger.warn({ err }, "Failed to delete old artwork"),
    );
  }

  return game;
};

export const setGameAvailability = async (
  { actor, requestId }: RequestContext,
  id: string,
  acceptingOrders: boolean,
) => {
  const game = await getAdminGame(id);
  if (game.acceptingOrders === acceptingOrders) return game;

  const previous = game.acceptingOrders;
  game.acceptingOrders = acceptingOrders;
  await game.save();

  await writeAuditLog({
    actorUserId: actor._id,
    action: "game_availability_changed",
    targetType: "Game",
    targetId: String(game._id),
    change: { name: game.name, before: previous, after: acceptingOrders },
    requestId,
  });

  return game;
};
