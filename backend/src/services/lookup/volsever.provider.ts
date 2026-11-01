import { ENV } from "../../config/env.js";
import {
  LookupError,
  type PlayerLookupInput,
  type PlayerLookupProvider,
  type PlayerLookupResult,
} from "./types.js";

interface VolseverResponse {
  status?: boolean;
  code?: number;
  message?: string;
  data?: {
    username?: string;
    level?: number | null;
    region?: string | null;
    [key: string]: unknown;
  };
}

const SLUG = /^[a-z0-9-]{2,60}$/;

const cleanName = (value: string): string =>
  value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, 60);

export class VolseverProvider implements PlayerLookupProvider {
  readonly name = "volsever";

  async lookup({
    providerGameCode,
    playerId,
    serverId,
    apiKey,
  }: PlayerLookupInput): Promise<PlayerLookupResult> {
    if (!SLUG.test(providerGameCode))
      throw new LookupError("invalid_input", "Bad provider game code");

    const url = new URL(
      `/proxy/api/game/${providerGameCode}`,
      ENV.VOLSEVER.BASE_URL,
    );
    url.searchParams.set("id", playerId);
    if (serverId) url.searchParams.set("zone", serverId);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ENV.LOOKUP.TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        headers: { "X-API-KEY": apiKey, Accept: "application/json" },
        signal: controller.signal,
      });

      if (res.status === 404) throw new LookupError("not_found");
      if (res.status === 400 || res.status === 422)
        throw new LookupError("invalid_input");
      if (!res.ok)
        throw new LookupError("unavailable", `Provider returned ${res.status}`);

      let body: VolseverResponse;
      try {
        body = (await res.json()) as VolseverResponse;
      } catch {
        throw new LookupError("unavailable", "Provider returned invalid JSON");
      }

      const rawName =
        body.data?.username ??
        (body.data as Record<string, unknown> | undefined)?.name ??
        (body.data as Record<string, unknown> | undefined)?.nickname;
      const username = rawName ? cleanName(String(rawName)) : "";
      if (body.status === true && username) {
        return {
          playerName: username,
          level: typeof body.data?.level === "number" ? body.data.level : null,
          region: body.data?.region
            ? String(body.data.region).toUpperCase().slice(0, 10)
            : null,
        };
      }

      if (
        body.code === 404 ||
        /not\s*found|invalid\s*(?:user|account|id|player)/i.test(
          body.message ?? "",
        )
      ) {
        throw new LookupError("not_found");
      }
      throw new LookupError("unavailable", "Unexpected provider response");
    } catch (err) {
      if (err instanceof LookupError) throw err;
      throw new LookupError(
        "unavailable",
        err instanceof Error ? err.name : "Unknown error",
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
