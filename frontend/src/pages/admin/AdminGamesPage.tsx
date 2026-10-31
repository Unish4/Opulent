import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { Boxes, Pencil, Plus } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import GameImage from "../../components/game/GameImage";
import { Badge, Button, Card, Skeleton } from "../../components/ui";
import {
  useAdminGames,
  useSetGameAvailability,
} from "../../hooks/useAdminGames";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import type { AdminGame } from "../../types/game";

export default function AdminGamesPage() {
  const { data: me } = useCurrentUser();
  const { data: games, isLoading, isError, error, refetch } = useAdminGames();
  const setAvailability = useSetGameAvailability();
  const [pausing, setPausing] = useState<AdminGame | null>(null);
  const isOwner = me?.role === "owner";

  const toggle = (game: AdminGame, acceptingOrders: boolean) =>
    setAvailability.mutate(
      { id: game.id, acceptingOrders },
      {
        onSuccess: () =>
          toast.success(acceptingOrders ? "Orders resumed" : "Orders paused"),
        onError: (err) => toast.error(err.message),
        onSettled: () => setPausing(null),
      },
    );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Games</h1>
          <p className="mt-1 text-sm text-secondary">
            {isOwner
              ? "Manage games, packages and prices."
              : "You can pause orders and switch packages on or off. Owners manage everything else."}
          </p>
        </div>
        {isOwner && (
          <Link
            to="/admin/games/new"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={16} /> New game
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}
      {isError && (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      )}
      {games && games.length === 0 && <EmptyState title="No games yet" />}

      {games?.map((game) => (
        <Card key={game.id} className="flex flex-wrap items-center gap-4 p-4">
          <GameImage
            src={game.imageUrl}
            name={game.name}
            width={160}
            className="size-16 shrink-0 rounded-md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-semibold">{game.name}</p>
            <p className="truncate font-mono text-xs text-muted">
              /{game.slug}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone={game.isPublished ? "success" : "neutral"}>
                {game.isPublished ? "Published" : "Draft"}
              </Badge>
              {!game.acceptingOrders && (
                <Badge tone="amber">Orders paused</Badge>
              )}
              {game.lookup.enabled && <Badge tone="primary">Lookup on</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/admin/games/${game.id}/packages`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-elevated px-3 text-sm font-semibold hover:bg-hover"
            >
              <Boxes size={15} /> Packages
            </Link>
            {isOwner && (
              <Link
                to={`/admin/games/${game.id}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-elevated px-3 text-sm font-semibold hover:bg-hover"
              >
                <Pencil size={15} /> Edit
              </Link>
            )}
            <Button
              size="sm"
              variant={game.acceptingOrders ? "danger" : "secondary"}
              loading={
                setAvailability.isPending &&
                setAvailability.variables?.id === game.id
              }
              onClick={() =>
                game.acceptingOrders ? setPausing(game) : toggle(game, true)
              }
            >
              {game.acceptingOrders ? "Pause orders" : "Resume orders"}
            </Button>
          </div>
        </Card>
      ))}

      <ConfirmDialog
        open={!!pausing}
        tone="danger"
        title="Pause orders?"
        description={`Customers will not be able to order ${pausing?.name ?? "this game"} until you resume.`}
        confirmLabel="Pause orders"
        loading={setAvailability.isPending}
        onConfirm={() => pausing && toggle(pausing, false)}
        onCancel={() => setPausing(null)}
      />
    </div>
  );
}
