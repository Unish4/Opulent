import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="font-display text-3xl font-bold">Page not found</h1>
      <p className="text-secondary">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        Back to home
      </Link>
    </div>
  );
}
