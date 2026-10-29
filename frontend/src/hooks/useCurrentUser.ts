import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { api } from "../services/api";
import type { CurrentUser } from "../types/user";

export function useCurrentUser() {
  const { isSignedIn, userId } = useAuth();

  return useQuery<CurrentUser>({
    queryKey: ["currentUser", userId],
    queryFn: () => api.get("/users/me").then((res) => res.data.data),
    enabled: !!isSignedIn && !!userId,
  });
}
