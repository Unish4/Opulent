import { ENV } from "../../config/env.js";

export const resolveKeyGroup = (slug: string): string =>
  ENV.VOLSEVER.KEYS[slug] ? slug : "default";

export const resolveApiKey = (slug: string): string | undefined =>
  ENV.VOLSEVER.KEYS[slug] ?? ENV.VOLSEVER.DEFAULT_KEY;
