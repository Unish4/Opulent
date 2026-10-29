import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { CurrentUser } from "../types/user";
import type { ProfileFormValues } from "../schemas/profileSchema.ts";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProfileFormValues): Promise<CurrentUser> =>
      api
        .patch("/users/me", {
          name: values.name,
          ...(values.phone ? { phone: values.phone } : {}),
        })
        .then((res) => res.data.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
  });
}
