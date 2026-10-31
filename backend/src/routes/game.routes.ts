import { Router } from "express";
import { attachUser } from "../middleware/attachUser.js";
import { lookupLimiter } from "../middleware/rateLimiter.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  listGamesQuerySchema,
  slugParamSchema,
} from "../validators/game.validator.js";
import { lookupBodySchema } from "../validators/lookup.validator.js";
import { getGame, listGames } from "../controllers/game.controller.js";
import { getGamePackages } from "../controllers/package.controller.js";
import { lookupPlayerHandler } from "../controllers/lookup.controller.js";

const router = Router();

router.get("/", validateRequest({ query: listGamesQuerySchema }), listGames);
router.get("/:slug", validateRequest({ params: slugParamSchema }), getGame);
router.get(
  "/:slug/packages",
  validateRequest({ params: slugParamSchema }),
  getGamePackages,
);
router.post(
  "/:slug/lookup-player",
  attachUser,
  lookupLimiter,
  validateRequest({ params: slugParamSchema, body: lookupBodySchema }),
  lookupPlayerHandler,
);

export default router;
