import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { GameDetail, GamesResult } from "../types/game";

interface GamesParams {
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export function useGames(params: GamesParams = {}) {
  return useQuery<GamesResult>({
    queryKey: ["games", params],
    queryFn: () =>
      api
        .get("/games", {
          params: {
            search: params.search || undefined,
            featured: params.featured ? "true" : undefined,
            page: params.page,
            limit: params.limit,
          },
        })
        .then((res) => ({ games: res.data.data, meta: res.data.meta })),
    placeholderData: keepPreviousData,
  });
}

export function useGame(slug: string | undefined) {
  return useQuery<GameDetail>({
    queryKey: ["game", slug],
    queryFn: () => api.get(`/games/${slug}`).then((res) => res.data.data),
    enabled: !!slug,
    retry: false,
  });
}
