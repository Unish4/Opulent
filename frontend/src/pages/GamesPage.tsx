import { useState } from "react";
import { useSearchParams } from "react-router";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import GameCard from "../components/game/GameCard";
import GameCardSkeleton from "../components/game/GameCardSkeleton";
import { useDebounce } from "../hooks/useDebounce";
import { useGames } from "../hooks/useGames";
import { cn } from "../utils/cn";

const PAGE_SIZE = 12;

export default function GamesPage() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState(searchParams.get("search") ?? "");
  const [page, setPage] = useState(1);
  const search = useDebounce(input.trim(), 300);

  const { data, isLoading, isError, error, refetch, isPlaceholderData } =
    useGames({
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    });

  const totalPages = data ? Math.ceil(data.meta.total / data.meta.limit) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Games</h1>
          <p className="mt-1 text-sm text-secondary">
            Choose a game to top up.
          </p>
        </div>
        <SearchInput
          className="w-full sm:w-80"
          value={input}
          onChange={(value) => {
            setInput(value);
            setPage(1);
          }}
        />
      </div>

      {isError && (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      )}

      {!isError && (
        <>
          <div
            className={cn(
              "grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 lg:grid-cols-4",
              isPlaceholderData && "opacity-60",
            )}
          >
            {isLoading
              ? Array.from({ length: 8 }, (_, i) => (
                  <GameCardSkeleton key={i} />
                ))
              : data?.games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
          </div>

          {data && data.games.length === 0 && (
            <EmptyState
              title="No games found"
              description={
                search
                  ? `Nothing matches "${search}". Try a different name.`
                  : "No games are available yet."
              }
            />
          )}

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
