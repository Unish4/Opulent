import { Link, NavLink, Outlet } from "react-router";
import {
  ArrowLeft,
  ClipboardList,
  Gamepad2,
  Gem,
  LayoutDashboard,
  RotateCcw,
  Users,
} from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { cn } from "../utils/cn";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary/20 text-primary-hover"
      : "text-secondary hover:bg-hover hover:text-fg",
  );

export default function AdminLayout() {
  const { data: user } = useCurrentUser();

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
            <ClipboardList size={16} /> Orders
          </NavLink>
          <NavLink to="/admin/refunds" className={linkClass}>
            <RotateCcw size={16} /> Refunds
          </NavLink>
          <NavLink to="/admin/games" className={linkClass}>
            <Gamepad2 size={16} /> Games
          </NavLink>
          {user?.role === "owner" && (
            <NavLink to="/admin/team" className={linkClass}>
              <Users size={16} /> Team
            </NavLink>
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
