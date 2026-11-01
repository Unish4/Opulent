import { useState } from "react";
import toast from "react-hot-toast";
import { Button, Card, Input } from "../ui";
import {
  useAdjustLookupUsage,
  useLookupUsage,
} from "../../hooks/useLookupUsage";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { cn } from "../../utils/cn";

export default function LookupUsageCard() {
  const { data: me } = useCurrentUser();
  const { data, isLoading, isError } = useLookupUsage();
  const adjust = useAdjustLookupUsage();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const isOwner = me?.role === "owner";

  const seen = new Set<string>();
  const keys = (data?.keys ?? []).filter((key) => {
    if (seen.has(key.group)) return false;
    seen.add(key.group);
    return true;
  });

  const save = (group: string) => {
    const used = Number(drafts[group]);
    if (!Number.isInteger(used) || used < 0) {
      toast.error("Enter a whole number, 0 or more");
      return;
    }
    adjust.mutate(
      { group, used },
      {
        onSuccess: () => {
          toast.success("Usage updated");
          setDrafts((current) => ({ ...current, [group]: "" }));
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Card className="space-y-4 p-5">
      <div>
        <h2 className="font-display text-white font-semibold">
          Player lookup this month
        </h2>
        <p className="mt-1 text-xs text-muted">
          Each game has its own key and counter. Calls made in the provider's
          own playground are not counted here, so sync the number if your
          provider dashboard shows more.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted">Loading...</p>}
      {isError && <p className="text-sm text-danger">Could not load usage.</p>}
      {data && keys.length === 0 && (
        <p className="text-sm text-muted">
          Lookup is not turned on for any game.
        </p>
      )}

      {data &&
        keys.map((key) => {
          const percent = Math.min(
            100,
            Math.round((key.usedThisMonth / data.monthlyLimit) * 100),
          );
          return (
            <div key={key.group} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">
                  {key.shared ? "Shared key" : key.name}
                </span>
                <span className="font-mono">
                  {key.usedThisMonth} / {data.monthlyLimit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-elevated">
                <div
                  className={cn(
                    "h-2 rounded-full",
                    percent >= 90 ? "bg-danger" : "bg-success",
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-xs text-muted">
                {key.keyConfigured
                  ? "Key is set."
                  : "No key is set, so this game cannot check players."}
              </p>
              {isOwner && (
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="numeric"
                    aria-label={`Provider says used for ${key.name}`}
                    placeholder="Provider says used"
                    className="h-9 w-40"
                    value={drafts[key.group] ?? ""}
                    onChange={(e) =>
                      setDrafts((current) => ({
                        ...current,
                        [key.group]: e.target.value,
                      }))
                    }
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={
                      adjust.isPending && adjust.variables?.group === key.group
                    }
                    disabled={!(drafts[key.group] ?? "").trim()}
                    onClick={() => save(key.group)}
                  >
                    Sync
                  </Button>
                </div>
              )}
            </div>
          );
        })}
    </Card>
  );
}
