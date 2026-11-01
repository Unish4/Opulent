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
import CheckoutPage from "./pages/CheckoutPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import HelpPage from "./pages/HelpPage";
import TermsPage from "./pages/TermsPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboardPage = lazy(
  () => import("./pages/admin/AdminDashboardPage"),
);
const AdminTeamPage = lazy(() => import("./pages/admin/AdminTeamPage"));
const AdminGamesPage = lazy(() => import("./pages/admin/AdminGamesPage"));
const AdminGameFormPage = lazy(() => import("./pages/admin/AdminGameFormPage"));
const AdminPackagesPage = lazy(() => import("./pages/admin/AdminPackagesPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminOrderDetailPage = lazy(
  () => import("./pages/admin/AdminOrderDetailPage"),
);
const AdminRefundsPage = lazy(() => import("./pages/admin/AdminRefundsPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminUserDetailPage = lazy(
  () => import("./pages/admin/AdminUserDetailPage"),
);
const AdminPaymentSettingsPage = lazy(
  () => import("./pages/admin/AdminPaymentSettingsPage"),
);
const AdminAuditLogPage = lazy(() => import("./pages/admin/AdminAuditLogPage"));

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
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="refunds" element={<AdminRefundsPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="games" element={<AdminGamesPage />} />
              <Route
                path="games/:id/packages"
                element={<AdminPackagesPage />}
              />
              <Route element={<AdminRoute ownerOnly />}>
                <Route path="games/new" element={<AdminGameFormPage />} />
                <Route path="games/:id" element={<AdminGameFormPage />} />
                <Route path="team" element={<AdminTeamPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="users/:id" element={<AdminUserDetailPage />} />
                <Route
                  path="settings/payment"
                  element={<AdminPaymentSettingsPage />}
                />
                <Route path="audit-log" element={<AdminAuditLogPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Root />}>
            <Route index element={<HomePage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="refund-policy" element={<RefundPolicyPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="games/:slug" element={<GamePage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="account" element={<AccountPage />} />
              <Route path="account/orders" element={<MyOrdersPage />} />
              <Route
                path="account/orders/:reference"
                element={<OrderDetailPage />}
              />
              <Route path="checkout/:reference" element={<CheckoutPage />} />
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
