import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import GameImage from "../components/game/GameImage";
import { Badge, Card, Skeleton } from "../components/ui";
import { useGame } from "../hooks/useGames";
import type { ApiError } from "../services/api";

export default function GamePage() {
  const { slug } = useParams();
  const { data: game, isLoading, isError, error, refetch } = useGame(slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/games"
        className="mb-6 inline-flex items-center gap-1 text-sm text-secondary hover:text-fg"
      >
        <ArrowLeft size={16} /> All games
      </Link>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-32" />
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
              className="size-28 shrink-0 rounded-lg"
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
              <h2 className="font-display text-base font-semibold">
                Where to find your ID
              </h2>
              <p className="mt-2 text-sm text-secondary">{game.instructions}</p>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold">
              What you will need
            </h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-secondary">
              {game.playerFields.map((field) => (
                <li key={field.key}>{field.label}</li>
              ))}
            </ul>
          </Card>

          <Card className="border-dashed p-5 text-center text-sm text-secondary">
            Packages for this game will appear here soon.
          </Card>
        </div>
      )}
    </div>
  );
}
