import type { IGame } from "../models/Game.js";

export const toGameListDto = (game: IGame) => ({
  id: String(game._id),
  name: game.name,
  slug: game.slug,
  publisher: game.publisher ?? null,
  imageUrl: game.imageUrl ?? null,
  isFeatured: game.isFeatured,
  acceptingOrders: game.acceptingOrders,
});

export const toGameDetailDto = (game: IGame) => ({
  ...toGameListDto(game),
  description: game.description ?? null,
  instructions: game.instructions ?? null,
  fulfilmentType: game.fulfilmentType,
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
  lookup: { enabled: game.lookup.enabled },
});
