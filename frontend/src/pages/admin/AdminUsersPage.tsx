import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Pagination from "../../components/Pagination";
import SearchInput from "../../components/SearchInput";
import { Badge, Card, Select, Skeleton } from "../../components/ui";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../utils/cn";
import { formatDateTime } from "../../utils/time";

export default function AdminUsersPage() {
  const [params, setParams] = useSearchParams();
  const role = params.get("role") ?? "";
  const status = params.get("status") ?? "";
  const q = params.get("q") ?? "";
  const page = Number(params.get("page") ?? 1) || 1;

  const [qInput, setQInput] = useState(q);
  const debouncedQ = useDebounce(qInput.trim(), 400);

  const update = useCallback(
    (patch: Record<string, string | undefined>, resetPage = true) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(patch)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        if (resetPage) next.delete("page");
        return next;
      });
    },
    [setParams],
  );

  useEffect(() => {
    if (debouncedQ !== q) update({ q: debouncedQ || undefined });
  }, [debouncedQ, q, update]);

  const { data, isLoading, isError, error, refetch, isPlaceholderData } =
    useAdminUsers({
      q: q || undefined,
      role: role || undefined,
      status: status || undefined,
      page,
      limit: 20,
    });
  const totalPages = data ? Math.ceil(data.meta.total / data.meta.limit) : 0;

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <p className="mt-1 text-sm text-secondary">
          Accounts are created when someone signs up. Suspend an account from
          its page.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <SearchInput
          className="sm:col-span-2"
          value={qInput}
          onChange={setQInput}
          placeholder="Name, email or phone"
          label="Search accounts"
        />
        <Select
          aria-label="Role"
          value={role}
          onChange={(e) => update({ role: e.target.value || undefined })}
        >
          <option value="">Any role</option>
          <option value="customer">Customers</option>
          <option value="operator">Operators</option>
          <option value="owner">Owners</option>
        </Select>
        <Select
          aria-label="Status"
          value={status}
          onChange={(e) => update({ status: e.target.value || undefined })}
        >
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </Select>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      )}
      {isError && (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      )}
      {data && data.users.length === 0 && (
        <EmptyState title="No accounts found" />
      )}

      <div
        className={cn(
          "space-y-3 transition-opacity",
          isPlaceholderData && "opacity-60",
        )}
      >
        {data?.users.map((user) => (
          <Link key={user.id} to={`/admin/users/${user.id}`} className="block">
            <Card className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:border-primary">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-sm text-secondary">
                  {user.email || user.phone || "No contact details"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {user.role !== "customer" && (
                  <Badge tone="primary">{user.role}</Badge>
                )}
                {user.status !== "active" && (
                  <Badge tone="amber">{user.status}</Badge>
                )}
                <span className="text-xs text-muted">
                  {user.ordersCount} orders
                </span>
                <span className="text-xs text-muted">
                  Joined {formatDateTime(user.createdAt)}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(next) => update({ page: String(next) }, false)}
      />
    </div>
  );
}
