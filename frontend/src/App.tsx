import { Suspense, lazy, useEffect, useRef } from "react";
import { Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import Root from "./layouts/Root";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import AccountPage from "./pages/AccountPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import AdminRoute from "./pages/auth/AdminRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import GamesPage from "./pages/GamesPage";
import GamePage from "./pages/GamePage";

const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboardPage = lazy(
  () => import("./pages/admin/AdminDashboardPage"),
);
const AdminTeamPage = lazy(() => import("./pages/admin/AdminTeamPage"));

function AuthCacheGuard() {
  const { isLoaded, userId } = useAuth();
  const queryClient = useQueryClient();
  const previous = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;
    const current = userId ?? null;
    if (previous.current !== undefined && previous.current !== current)
      queryClient.clear();
    previous.current = current;
  }, [isLoaded, userId, queryClient]);

  return null;
}

export default function App() {
  return (
    <>
      <AuthCacheGuard />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
            background: "#182032",
            color: "#f3f5fa",
            border: "1px solid #273250",
          },
        }}
      />
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route element={<AdminRoute ownerOnly />}>
                <Route path="team" element={<AdminTeamPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Root />}>
            <Route index element={<HomePage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="games/:slug" element={<GamePage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="account" element={<AccountPage />} />
            </Route>
          </Route>

          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
