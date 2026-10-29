import { useUser } from "@clerk/react";
import { Navigate, Outlet, useLocation } from "react-router";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  if (!isLoaded) return <LoadingSpinner fullScreen />;
  if (!isSignedIn)
    return <Navigate to="/sign-in" state={{ from: location }} replace />;

  return <Outlet />;
}
