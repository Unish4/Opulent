import type { ReactNode } from "react";
import { Link } from "react-router";
import Logo from "../Logo";

interface AuthShellProps {
  title: string;
  subtitle: string;
  altText: string;
  altTo: string;
  children: ReactNode;
}

export default function AuthShell({
  title,
  subtitle,
  altText,
  altTo,
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-base">
      <header className="h-16 border-b border-line bg-surface">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Opulent home">
            <Logo />
          </Link>
          <Link to={altTo} className="text-sm text-secondary hover:text-fg">
            {altText}
          </Link>
        </div>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-4 py-8">
        <div className="w-full rounded-lg border border-line bg-surface p-5 sm:p-6">
          <h1 className="text-center font-display text-2xl font-bold">
            {title}
          </h1>
          <p className="mb-6 mt-1 text-center text-sm text-secondary">
            {subtitle}
          </p>
          {children}
        </div>
      </main>
    </div>
  );
}
