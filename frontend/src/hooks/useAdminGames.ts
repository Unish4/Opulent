import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { AdminGame, GamePayload } from "../types/game";

const KEY = ["admin", "games"];

export interface UploadedImage {
  url: string;
  publicId: string;
}

function useInvalidateGames() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: KEY }),
      queryClient.invalidateQueries({ queryKey: ["games"] }),
      queryClient.invalidateQueries({ queryKey: ["game"] }),
    ]);
}

export function useAdminGames() {
  return useQuery<AdminGame[]>({
    queryKey: KEY,
    queryFn: () => api.get("/admin/games").then((res) => res.data.data),
  });
}

export function useAdminGame(id: string | undefined) {
  return useQuery<AdminGame>({
    queryKey: [...KEY, id],
    queryFn: () => api.get(`/admin/games/${id}`).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useCreateGame() {
  const invalidate = useInvalidateGames();
  return useMutation({
    mutationFn: (payload: GamePayload): Promise<AdminGame> =>
      api.post("/admin/games", payload).then((res) => res.data.data),
    onSuccess: invalidate,
  });
}

export function useUpdateGame(id: string | undefined) {
  const invalidate = useInvalidateGames();
  return useMutation({
    mutationFn: (payload: GamePayload): Promise<AdminGame> =>
      api.patch(`/admin/games/${id}`, payload).then((res) => res.data.data),
    onSuccess: invalidate,
  });
}

export function useSetGameAvailability() {
  const invalidate = useInvalidateGames();
  return useMutation({
    mutationFn: (input: { id: string; acceptingOrders: boolean }) =>
      api
        .patch(`/admin/games/${input.id}/availability`, {
          acceptingOrders: input.acceptingOrders,
        })
        .then((res) => res.data.data),
    onSuccess: invalidate,
  });
}

export function useUploadArtwork() {
  return useMutation({
    mutationFn: (file: File): Promise<UploadedImage> => {
      const form = new FormData();
      form.append("image", file);
      return api
        .post("/admin/uploads/game-artwork", form)
        .then((res) => res.data.data);
    },
  });
}
