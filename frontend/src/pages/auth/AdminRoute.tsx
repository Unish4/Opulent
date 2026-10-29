import { useUser } from "@clerk/react";
import { Navigate, Outlet } from "react-router";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { isAdminRole } from "../../types/user";

export default function AdminRoute({
  ownerOnly = false,
}: {
  ownerOnly?: boolean;
}) {
  const { isLoaded, isSignedIn } = useUser();
  const { data, isLoading } = useCurrentUser();

  if (!isLoaded || (isSignedIn && isLoading))
    return <LoadingSpinner fullScreen />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;

  const allowed = ownerOnly ? data?.role === "owner" : isAdminRole(data?.role);
  if (!allowed) return <Navigate to={ownerOnly ? "/admin" : "/"} replace />;

  return <Outlet />;
}
