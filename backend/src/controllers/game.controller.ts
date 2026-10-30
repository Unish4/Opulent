import type { Request, Response } from "express";
import {
  getPublishedGameBySlug,
  listPublishedGames,
} from "../services/game.service.js";
import { toGameDetailDto, toGameListDto } from "../utils/toGameDto.js";
import type { ListGamesQuery } from "../validators/game.validator.js";

export const listGames = async (_req: Request, res: Response) => {
  const query = res.locals.query as ListGamesQuery;
  const { games, total } = await listPublishedGames(query);

  res.status(200).json({
    data: games.map(toGameListDto),
    meta: { page: query.page, limit: query.limit, total },
  });
};

export const getGame = async (req: Request, res: Response) => {
  const game = await getPublishedGameBySlug(String(req.params.slug));
  res.status(200).json({ data: toGameDetailDto(game) });
};
