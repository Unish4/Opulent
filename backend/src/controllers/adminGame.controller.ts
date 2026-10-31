import type { Request, Response } from "express";
import {
  createGame,
  getAdminGame,
  listAdminGames,
  setGameAvailability,
  updateGame,
} from "../services/adminGame.service.js";
import { getContext } from "../utils/requestContext.js";
import { toAdminGameDto } from "../utils/toGameDto.js";

export const listAdminGamesHandler = async (_req: Request, res: Response) => {
  const games = await listAdminGames();
  res.status(200).json({ data: games.map(toAdminGameDto) });
};

export const getAdminGameHandler = async (req: Request, res: Response) => {
  const game = await getAdminGame(String(req.params.id));
  res.status(200).json({ data: toAdminGameDto(game) });
};

export const createGameHandler = async (req: Request, res: Response) => {
  const game = await createGame(getContext(req), req.body);
  res.status(201).json({ data: toAdminGameDto(game) });
};

export const updateGameHandler = async (req: Request, res: Response) => {
  const game = await updateGame(
    getContext(req),
    String(req.params.id),
    req.body,
  );
  res.status(200).json({ data: toAdminGameDto(game) });
};

export const setGameAvailabilityHandler = async (
  req: Request,
  res: Response,
) => {
  const { acceptingOrders } = req.body as { acceptingOrders: boolean };
  const game = await setGameAvailability(
    getContext(req),
    String(req.params.id),
    acceptingOrders,
  );
  res.status(200).json({ data: toAdminGameDto(game) });
};
