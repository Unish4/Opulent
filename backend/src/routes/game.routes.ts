import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  listGamesQuerySchema,
  slugParamSchema,
} from "../validators/game.validator.js";
import { getGame, listGames } from "../controllers/game.controller.js";

const router = Router();

router.get("/", validateRequest({ query: listGamesQuerySchema }), listGames);
router.get("/:slug", validateRequest({ params: slugParamSchema }), getGame);

export default router;
