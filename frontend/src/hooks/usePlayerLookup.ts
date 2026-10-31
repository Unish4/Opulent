import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";
import type { LookupResponse } from "../types/lookup";

export function usePlayerLookup(slug: string) {
  return useMutation({
    mutationFn: (input: {
      playerId: string;
      serverId?: string;
    }): Promise<LookupResponse> =>
      api
        .post(`/games/${slug}/lookup-player`, input)
        .then((res) => res.data.data),
  });
}
