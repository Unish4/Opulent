import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { PublicPackage } from "../types/package";

export function usePackages(slug: string | undefined) {
  return useQuery<PublicPackage[]>({
    queryKey: ["packages", slug],
    queryFn: () =>
      api.get(`/games/${slug}/packages`).then((res) => res.data.data),
    enabled: !!slug,
  });
}
