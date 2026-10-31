import { Link } from "react-router";
import { Badge } from "../ui";
import GameImage from "./GameImage";
import type { GameListItem } from "../../types/game";

export default function GameCard({ game }: { game: GameListItem }) {
  return (
    <Link
      to={`/games/${game.slug}`}
      className="group block overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-primary"
    >
      <GameImage
        src={game.imageUrl}
        name={game.name}
        className="aspect-square w-full transition-transform duration-300 group-hover:scale-105"
      />
      <div className="space-y-1 p-3">
        <h3 className="truncate font-display text-sm font-semibold sm:text-white">
          {game.name}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted">
            {game.publisher ?? "Top-up"}
          </p>
          {!game.acceptingOrders && <Badge tone="amber">Paused</Badge>}
        </div>
      </div>
    </Link>
  );
}
