import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";
import { ENV } from "./env.js";

export const aj = ENV.ARCJET.KEY
  ? arcjet({
      key: ENV.ARCJET.KEY,
      characteristics: ["ip.src"],
      rules: [
        shield({ mode: ENV.ARCJET.MODE }),
        detectBot({
          mode: ENV.ARCJET.MODE,
          allow: [
            "CATEGORY:SEARCH_ENGINE",
            "CATEGORY:MONITOR",
            "CATEGORY:PREVIEW",
          ],
        }),
        tokenBucket({
          mode: ENV.ARCJET.MODE,
          refillRate: 5,
          interval: 1,
          capacity: 100,
        }),
      ],
    })
  : null;
