import { pino } from "pino";
import { ENV, isDevelopment } from "../config/env.js";

export const logger = pino({
  level: ENV.LOG_LEVEL,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'req.headers["x-api-key"]',
      'res.headers["set-cookie"]',
      "*.authorization",
      "*.password",
      "*.token",
      "*.lookupToken",
      "*.apiKey",
    ],
    censor: "[REDACTED]",
  },
  ...(isDevelopment
    ? { transport: { target: "pino-pretty", options: { colorize: true } } }
    : {}),
});
