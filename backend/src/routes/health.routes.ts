import { Router } from "express";
import { pingDB } from "../config/db.js";

const router = Router();

router.get("/live", (_req, res) => {
  res.json({ data: { status: "ok" } });
});

router.get("/", async (_req, res) => {
  const dbUp = await pingDB();
  res.status(dbUp ? 200 : 503).json({
    data: {
      status: dbUp ? "ok" : "degraded",
      db: dbUp ? "up" : "down",
      uptimeSeconds: Math.round(process.uptime()),
    },
  });
});

export default router;
