import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { Gem, LogIn, Menu, ShieldCheck, User, X } from "lucide-react";
import { Show, UserButton } from "@clerk/react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { isAdminRole } from "../types/user";
import { cn } from "../utils/cn";

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary/20 text-primary-hover"
      : "text-secondary hover:bg-hover hover:text-fg",
  );

export default function Root() {
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === location.pathname;
  const isAdmin = isAdminRole(currentUser?.role);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuPath(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            className="rounded-md p-2 text-secondary hover:bg-hover md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuPath(menuOpen ? null : location.pathname)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 font-display text-lg font-semibold"
          >
            <Gem size={20} className="text-primary-hover" />
            Opulent
          </Link>

          <nav
            aria-label="Main"
            className="ml-4 hidden items-center gap-1 md:flex"
          >
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/games" className={navClass}>
              Games
            </NavLink>
            <NavLink to="/help" className={navClass}>
              Help
            </NavLink>
            <Show when="signed-in">
              <NavLink to="/account/orders" className={navClass}>
                My orders
              </NavLink>
            </Show>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Show when="signed-in">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden items-center gap-1 rounded-sm bg-elevated px-2.5 py-1.5 text-xs font-semibold text-fg hover:bg-hover sm:inline-flex"
                >
                  <ShieldCheck size={14} /> Admin
                </Link>
              )}
              <Link
                to="/account"
                aria-label="My account"
                className="rounded-md p-2 text-secondary hover:bg-hover hover:text-fg"
              >
                <User size={20} />
              </Link>
              <UserButton />
            </Show>
            <Show when="signed-out">
              <Link
                to="/sign-in"
                className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-secondary hover:bg-hover hover:text-fg sm:block"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Sign up
              </Link>
            </Show>
          </div>
        </div>

        <nav
          id="mobile-menu"
          aria-label="Mobile"
          hidden={!menuOpen}
          className="space-y-1 border-t border-line bg-surface p-3 md:hidden"
        >
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/games" className={navClass}>
            Games
          </NavLink>
          <NavLink to="/help" className={navClass}>
            Help
          </NavLink>
          <Show when="signed-in">
            <NavLink to="/account/orders" className={navClass}>
              My orders
            </NavLink>
            <NavLink to="/account" className={navClass}>
              My account
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            )}
          </Show>
          <Show when="signed-out">
            <NavLink to="/sign-in" className={navClass}>
              <span className="inline-flex items-center gap-2">
                <LogIn size={16} /> Sign in
              </span>
            </NavLink>
          </Show>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted sm:px-6">
          © {new Date().getFullYear()} Opulent. All prices in NPR.
        </div>
      </footer>
    </div>
  );
}
