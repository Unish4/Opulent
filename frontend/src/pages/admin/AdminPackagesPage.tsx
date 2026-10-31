import { useState } from "react";
import { Link, useParams } from "react-router";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import PackageFormDialog from "../../components/admin/PackageFormDialog";
import { Badge, Button, Card, Skeleton } from "../../components/ui";
import { useAdminGame } from "../../hooks/useAdminGames";
import {
  useAdminPackages,
  useCreatePackage,
  useSetPackageAvailability,
  useUpdatePackage,
} from "../../hooks/useAdminPackages";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { formatNpr } from "../../utils/money";
import type { AdminPackage } from "../../types/package";

type DialogState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; pkg: AdminPackage };

export default function AdminPackagesPage() {
  const { id } = useParams();
  const { data: me } = useCurrentUser();
  const { data: game } = useAdminGame(id);
  const {
    data: packages,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminPackages(id);
  const createPackage = useCreatePackage(id);
  const updatePackage = useUpdatePackage(id);
  const setAvailability = useSetPackageAvailability(id);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const isOwner = me?.role === "owner";

  const groups = new Map<string, AdminPackage[]>();
  for (const pkg of packages ?? []) {
    const list = groups.get(pkg.group) ?? [];
    list.push(pkg);
    groups.set(pkg.group, list);
  }

  const close = () => setDialog({ mode: "closed" });

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        to="/admin/games"
        className="inline-flex items-center gap-1 text-sm text-secondary hover:text-fg"
      >
        <ArrowLeft size={16} /> All games
      </Link>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {game ? `${game.name} packages` : "Packages"}
          </h1>
          <p className="mt-1 text-sm text-secondary">
            {isOwner
              ? "Price changes apply to new orders only."
              : "You can switch packages on or off. Only owners can change prices."}
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setDialog({ mode: "create" })}>
            <Plus size={16} /> Add package
          </Button>
        )}
      </div>

      {isLoading && <Skeleton className="h-48" />}
      {isError && (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      )}
      {packages && packages.length === 0 && (
        <EmptyState title="No packages yet" />
      )}

      {[...groups.entries()].map(([group, items]) => (
        <section key={group} className="space-y-2">
          <h2 className="text-sm font-semibold text-secondary">{group}</h2>
          {items.map((pkg) => (
            <Card
              key={pkg.id}
              className="flex flex-wrap items-center gap-3 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {pkg.name}{" "}
                  {pkg.badge && <Badge tone="amber">{pkg.badge}</Badge>}
                </p>
                {pkg.description && (
                  <p className="truncate text-xs text-muted">
                    {pkg.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-semibold text-amber">
                  {formatNpr(pkg.pricePaisa)}
                </p>
                {isOwner && pkg.costPaisa !== null && (
                  <p className="font-mono text-xs text-muted">
                    cost {formatNpr(pkg.costPaisa)}
                  </p>
                )}
              </div>
              <Badge tone={pkg.isAvailable ? "success" : "neutral"}>
                {pkg.isAvailable ? "Available" : "Off"}
              </Badge>
              <Button
                size="sm"
                variant="secondary"
                loading={
                  setAvailability.isPending &&
                  setAvailability.variables?.id === pkg.id
                }
                onClick={() =>
                  setAvailability.mutate(
                    { id: pkg.id, isAvailable: !pkg.isAvailable },
                    {
                      onSuccess: () =>
                        toast.success(
                          pkg.isAvailable
                            ? "Package switched off"
                            : "Package switched on",
                        ),
                      onError: (err) => toast.error(err.message),
                    },
                  )
                }
              >
                {pkg.isAvailable ? "Switch off" : "Switch on"}
              </Button>
              {isOwner && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDialog({ mode: "edit", pkg })}
                  aria-label={`Edit ${pkg.name}`}
                >
                  <Pencil size={15} />
                </Button>
              )}
            </Card>
          ))}
        </section>
      ))}

      {dialog.mode === "create" && (
        <PackageFormDialog
          key="new"
          initial={null}
          groups={[...groups.keys()]}
          loading={createPackage.isPending}
          onClose={close}
          onSubmit={(payload) =>
            createPackage.mutate(payload, {
              onSuccess: () => {
                toast.success("Package added");
                close();
              },
              onError: (err) => toast.error(err.message),
            })
          }
        />
      )}

      {dialog.mode === "edit" && (
        <PackageFormDialog
          key={dialog.pkg.id}
          initial={dialog.pkg}
          groups={[...groups.keys()]}
          loading={updatePackage.isPending}
          onClose={close}
          onSubmit={(payload) =>
            updatePackage.mutate(
              { id: dialog.pkg.id, payload },
              {
                onSuccess: () => {
                  toast.success("Package saved");
                  close();
                },
                onError: (err) => toast.error(err.message),
              },
            )
          }
        />
      )}
    </div>
  );
}
