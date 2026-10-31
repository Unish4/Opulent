import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import GameImage from "../components/game/GameImage";
import GameOrderPanel from "../components/game/GameOrderPanel";
import { Badge, Card, Skeleton } from "../components/ui";
import { useGame } from "../hooks/useGames";
import { usePackages } from "../hooks/usePackages";
import type { ApiError } from "../services/api";

export default function GamePage() {
  const { slug } = useParams();
  const { data: game, isLoading, isError, error, refetch } = useGame(slug);
  const packagesQuery = usePackages(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/games"
        className="mb-6 inline-flex items-center gap-1 text-sm text-secondary hover:text-fg"
      >
        <ArrowLeft size={16} /> All games
      </Link>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </div>
      )}

      {isError &&
        ((error as ApiError).status === 404 ? (
          <EmptyState
            title="Game not found"
            description="This game does not exist or is not available right now."
            action={
              <Link
                to="/games"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Browse games
              </Link>
            }
          />
        ) : (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ))}

      {game && (
        <div className="space-y-6">
          <Card className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            <GameImage
              src={game.imageUrl}
              name={game.name}
              width={300}
              className="size-24 shrink-0 rounded-lg"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{game.name}</h1>
                {!game.acceptingOrders && (
                  <Badge tone="amber">Orders paused</Badge>
                )}
              </div>
              {game.publisher && (
                <p className="mt-1 text-sm text-muted">{game.publisher}</p>
              )}
              {game.description && (
                <p className="mt-2 text-sm text-secondary">
                  {game.description}
                </p>
              )}
            </div>
          </Card>

          {game.instructions && (
            <Card className="p-5">
              <h2 className="font-display text-white font-semibold">
                Where to find your details
              </h2>
              <p className="mt-2 text-sm text-secondary">{game.instructions}</p>
            </Card>
          )}

          {packagesQuery.isLoading && <Skeleton className="h-64" />}
          {packagesQuery.isError && (
            <ErrorState
              message={packagesQuery.error.message}
              onRetry={() => packagesQuery.refetch()}
            />
          )}
          {packagesQuery.data && (
            <GameOrderPanel game={game} packages={packagesQuery.data} />
          )}
        </div>
      )}
    </div>
  );
}
