import { Game } from "../models/Game.js";
import { ApiError } from "../utils/ApiError.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import type { ListGamesQuery } from "../validators/game.validator.js";

export const listPublishedGames = async ({
  search,
  featured,
  page,
  limit,
}: ListGamesQuery) => {
  const regex = search ? new RegExp(escapeRegex(search), "i") : null;

  const filter = {
    isPublished: true,
    ...(featured ? { isFeatured: true } : {}),
    ...(regex ? { $or: [{ name: regex }, { aliases: regex }] } : {}),
  };

  const [games, total] = await Promise.all([
    Game.find(filter)
      .sort({ isFeatured: -1, sortOrder: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Game.countDocuments(filter),
  ]);

  return { games, total };
};

export const getPublishedGameBySlug = async (slug: string) => {
  const game = await Game.findOne({ slug, isPublished: true });
  if (!game) throw new ApiError(404, "Game not found");
  return game;
};
