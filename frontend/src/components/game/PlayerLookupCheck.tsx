import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/react";
import { CheckCircle2, Search } from "lucide-react";
import { Button } from "../ui";
import { usePlayerLookup } from "../../hooks/usePlayerLookup";
import type { ApiError } from "../../services/api";
import type { CheckedPlayer } from "../../types/lookup";
import { cn } from "../../utils/cn";

interface PlayerLookupCheckProps {
  slug: string;
  idKey: string;
  checked: CheckedPlayer | null;
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
  getIds: () => Promise<{ playerId: string; serverId: string } | null>;
  onChecked: (player: CheckedPlayer) => void;
  disabled: boolean;
}

interface Notice {
  key: string;
  tone: "warn" | "info";
  text: string;
}

const describeError = (err: ApiError): Omit<Notice, "key"> => {
  switch (err.code) {
    case "PLAYER_NOT_FOUND":
      return {
        tone: "warn",
        text: "No account found for this ID. Check the ID, or continue and type your in-game name. Our team double-checks before topping up.",
      };
    case "RATE_LIMITED":
      return {
        tone: "info",
        text: "Too many checks. Please wait a few minutes.",
      };
    case "LOOKUP_UNAVAILABLE":
      return {
        tone: "info",
        text: "Player check is unavailable right now. You can still order by typing your in-game name.",
      };
    case "UNAUTHENTICATED":
      return { tone: "info", text: "Sign in to check your player ID." };
    case "VALIDATION_ERROR":
      return { tone: "warn", text: err.message };
    default:
      return {
        tone: "info",
        text: "The player check failed. You can still continue by typing your in-game name.",
      };
  }
};

export default function PlayerLookupCheck({
  slug,
  idKey,
  checked,
  confirmed,
  onConfirmedChange,
  getIds,
  onChecked,
  disabled,
}: PlayerLookupCheckProps) {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const lookup = usePlayerLookup(slug);
  const [notice, setNotice] = useState<Notice | null>(null);

  const run = async () => {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }
    const ids = await getIds();
    if (!ids) return;

    const key = `${ids.playerId}|${ids.serverId}`;
    setNotice(null);
    lookup.mutate(
      {
        playerId: ids.playerId,
        ...(ids.serverId ? { serverId: ids.serverId } : {}),
      },
      {
        onSuccess: (result) => {
          onChecked({ ...result, ...ids });
          onConfirmedChange(false);
        },
        onError: (err) => setNotice({ key, ...describeError(err as ApiError) }),
      },
    );
  };

  return (
    <div className="mt-4 space-y-3">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        loading={lookup.isPending}
        disabled={disabled}
        onClick={run}
      >
        <Search size={15} />{" "}
        {checked
          ? "Check again"
          : isSignedIn
            ? "Check player"
            : "Sign in to check player"}
      </Button>

      {checked && (
        <div className="rounded-lg border border-success/40 bg-success/10 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircle2 size={16} /> Account found
          </p>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-secondary">Name</dt>
              <dd className="font-medium">{checked.playerName}</dd>
            </div>
            {checked.level !== null && (
              <div className="flex justify-between gap-3">
                <dt className="text-secondary">Level</dt>
                <dd className="font-mono">{checked.level}</dd>
              </div>
            )}
            {checked.region && (
              <div className="flex justify-between gap-3">
                <dt className="text-secondary">Region</dt>
                <dd className="font-mono">{checked.region}</dd>
              </div>
            )}
          </dl>
          <p className="mt-3 text-xs text-muted">
            This is the name the game shows for this ID. Make sure it is your
            account before you pay.
          </p>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={confirmed}
              onChange={(e) => onConfirmedChange(e.target.checked)}
            />
            This is my account
          </label>
        </div>
      )}

      {!checked && notice && notice.key === idKey && (
        <p
          role="status"
          className={cn(
            "rounded-md border p-3 text-sm",
            notice.tone === "warn"
              ? "border-amber/40 bg-amber/10 text-amber"
              : "border-line bg-elevated text-secondary",
          )}
        >
          {notice.text}
        </p>
      )}
    </div>
  );
}
