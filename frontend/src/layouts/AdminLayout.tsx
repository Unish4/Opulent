import { useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router";
import {
  ArrowLeft,
  ClipboardList,
  CreditCard,
  Gamepad2,
  Gem,
  History,
  LayoutDashboard,
  RotateCcw,
  UserCog,
  Users,
} from "lucide-react";
import { useAdminOrderSummary } from "../hooks/useAdminOrders";
import { useAdminRefundSummary } from "../hooks/useAdminRefunds";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { cn } from "../utils/cn";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary/20 text-primary-hover"
      : "text-secondary hover:bg-hover hover:text-fg",
  );

function CountBadge({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="ml-auto rounded-full bg-amber px-2 py-0.5 text-xs font-bold text-white">
      {value}
    </span>
  );
}

export default function AdminLayout() {
  const { data: user } = useCurrentUser();
  const { data: orders } = useAdminOrderSummary();
  const { data: refunds } = useAdminRefundSummary();
  const isOwner = user?.role === "owner";

  const reviewCount = orders?.awaiting_review ?? 0;
  const refundCount =
    (refunds?.requested ?? 0) + (isOwner ? (refunds?.approved ?? 0) : 0);

  useEffect(() => {
    const total = reviewCount + refundCount;
    document.title = total > 0 ? `(${total}) Opulent Admin` : "Opulent Admin";
    return () => {
      document.title = "Opulent — Game Top-Up Store in Nepal";
    };
  }, [reviewCount, refundCount]);

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-line bg-surface md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="flex h-14 items-center gap-2 px-4 font-display font-semibold">
          <Gem size={18} className="text-primary-hover" />
          Opulent Admin
        </div>
        <nav
          aria-label="Admin"
          className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible"
        >
          <NavLink to="/admin" end className={linkClass}>
            <LayoutDashboard size={16} /> Overview
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            <ClipboardList size={16} /> Orders{" "}
            <CountBadge value={reviewCount} />
          </NavLink>
          <NavLink to="/admin/refunds" className={linkClass}>
            <RotateCcw size={16} /> Refunds <CountBadge value={refundCount} />
          </NavLink>
          <NavLink to="/admin/games" className={linkClass}>
            <Gamepad2 size={16} /> Games
          </NavLink>
          {isOwner && (
            <>
              <NavLink to="/admin/users" className={linkClass}>
                <Users size={16} /> Customers
              </NavLink>
              <NavLink to="/admin/team" className={linkClass}>
                <UserCog size={16} /> Team
              </NavLink>
              <NavLink to="/admin/settings/payment" className={linkClass}>
                <CreditCard size={16} /> Payment
              </NavLink>
              <NavLink to="/admin/audit-log" className={linkClass}>
                <History size={16} /> Audit log
              </NavLink>
            </>
          )}
          <Link
            to="/"
            className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted hover:text-fg md:mt-4"
          >
            <ArrowLeft size={16} /> Back to store
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
