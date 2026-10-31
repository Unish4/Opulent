import { Link, useParams } from "react-router";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { Badge, Card, Skeleton } from "../components/ui";
import { useOrder } from "../hooks/useOrders";
import type { ApiError } from "../services/api";
import { formatNpr } from "../utils/money";

export default function CheckoutPage() {
  const { reference } = useParams();
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrder(reference);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {isLoading && <Skeleton className="h-64" />}

      {isError &&
        ((error as ApiError).status === 404 ? (
          <EmptyState
            title="Order not found"
            description="This order does not exist or belongs to another account."
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

      {order && (
        <Card className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-secondary">Order ID</p>
              <p className="font-mono text-2xl font-bold">{order.reference}</p>
            </div>
            <Badge tone="amber">{order.status.replace("_", " ")}</Badge>
          </div>

          <dl className="space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-secondary">Game</dt>
              <dd className="font-medium">{order.game.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-secondary">Package</dt>
              <dd className="font-medium">{order.package.name}</dd>
            </div>
            {order.playerDetails.playerId && (
              <div className="flex justify-between gap-3">
                <dt className="text-secondary">Player ID</dt>
                <dd className="font-mono">{order.playerDetails.playerId}</dd>
              </div>
            )}
            {order.playerDetails.serverId && (
              <div className="flex justify-between gap-3">
                <dt className="text-secondary">Server ID</dt>
                <dd className="font-mono">{order.playerDetails.serverId}</dd>
              </div>
            )}
            {order.playerDetails.email && (
              <div className="flex justify-between gap-3">
                <dt className="text-secondary">Account email</dt>
                <dd className="font-mono">{order.playerDetails.email}</dd>
              </div>
            )}
            {order.playerDetails.playerName && (
              <div className="flex justify-between gap-3">
                <dt className="text-secondary">In-game name</dt>
                <dd>{order.playerDetails.playerName}</dd>
              </div>
            )}
          </dl>

          <div className="flex items-end justify-between border-t border-line pt-4">
            <span className="text-sm text-secondary">Amount due</span>
            <span className="font-mono text-2xl font-bold text-amber">
              {formatNpr(order.pricePaisa)}
            </span>
          </div>

          <p className="rounded-md border border-line bg-elevated p-3 text-sm text-secondary">
            Payment instructions and the WhatsApp button appear here in the next
            update. Keep your order ID.
          </p>
        </Card>
      )}
    </div>
  );
}
