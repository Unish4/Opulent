import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import toast from "react-hot-toast";
import ConfirmDialog from "../ConfirmDialog";
import EmptyState from "../EmptyState";
import { Card } from "../ui";
import OrderSummary from "./OrderSummary";
import PackageGrid from "./PackageGrid";
import PlayerDetailsCard from "./PlayerDetailsCard";
import PlayerLookupCheck from "./PlayerLookupCheck";
import StepHeading from "./StepHeading";
import { useCreateOrder } from "../../hooks/useOrders";
import type { ApiError } from "../../services/api";
import type { GameDetail } from "../../types/game";
import type { CheckedPlayer } from "../../types/lookup";
import type { PublicPackage } from "../../types/package";
import { formatNpr } from "../../utils/money";
import { clearDraft, loadDraft, saveDraft } from "../../utils/orderDraft";
import {
  buildPlayerSchema,
  type PlayerFormValues,
} from "../../utils/playerSchema";

interface GameOrderPanelProps {
  game: GameDetail;
  packages: PublicPackage[];
}

const withoutPassword = (values: PlayerFormValues): PlayerFormValues =>
  Object.fromEntries(
    Object.entries(values).filter(([key]) => key !== "password"),
  );

export default function GameOrderPanel({
  game,
  packages,
}: GameOrderPanelProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();
  const createOrder = useCreateOrder();

  const draft = useMemo(() => loadDraft(game.slug), [game.slug]);
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    draft?.packageId &&
    packages.some((pkg) => pkg.id === draft.packageId && pkg.isAvailable)
      ? draft.packageId
      : null,
  );
  const [checked, setChecked] = useState<CheckedPlayer | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [credentialConsent, setCredentialConsent] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [priceChange, setPriceChange] = useState<{
    from: number;
    to: number;
  } | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const lookupValidRef = useRef(false);

  const hasServerField = game.playerFields.some(
    (field) => field.key === "serverId",
  );
  const hasPasswordField = game.playerFields.some(
    (field) => field.key === "password",
  );
  const fieldsWithoutName = useMemo(
    () => game.playerFields.filter((field) => field.key !== "playerName"),
    [game.playerFields],
  );

  const resolver = useMemo(() => {
    const full = zodResolver(
      buildPlayerSchema(game.playerFields),
    ) as unknown as Resolver<PlayerFormValues>;
    const withoutName = zodResolver(
      buildPlayerSchema(fieldsWithoutName),
    ) as unknown as Resolver<PlayerFormValues>;
    const pick: Resolver<PlayerFormValues> = (values, context, options) =>
      (lookupValidRef.current ? withoutName : full)(values, context, options);
    return pick;
  }, [game.playerFields, fieldsWithoutName]);

  const defaultValues = useMemo(() => {
    const base = Object.fromEntries(
      game.playerFields.map((field) => [field.key, ""]),
    ) as PlayerFormValues;
    if (!draft) return base;
    for (const field of game.playerFields) {
      if (field.key !== "password")
        base[field.key] = draft.values[field.key] ?? "";
    }
    return base;
  }, [game.playerFields, draft]);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<PlayerFormValues>({ resolver, defaultValues, mode: "onTouched" });

  const values = watch();
  const playerId = (values.playerId ?? "").trim();
  const serverId = (values.serverId ?? "").trim();
  const lookupValid =
    !!checked && checked.playerId === playerId && checked.serverId === serverId;

  useEffect(() => {
    lookupValidRef.current = lookupValid;
  }, [lookupValid]);

  const selected =
    packages.find((pkg) => pkg.id === selectedId && pkg.isAvailable) ?? null;
  const visibleFields = lookupValid ? fieldsWithoutName : game.playerFields;
  const summaryValues: PlayerFormValues =
    lookupValid && checked
      ? { ...values, playerName: checked.playerName }
      : values;

  const getIds = async () => {
    const ok = await trigger(
      hasServerField ? ["playerId", "serverId"] : ["playerId"],
    );
    if (!ok) return null;
    const current = getValues();
    return {
      playerId: (current.playerId ?? "").trim(),
      serverId: (current.serverId ?? "").trim(),
    };
  };

  const goToSignIn = () => {
    saveDraft({
      slug: game.slug,
      packageId: selectedId,
      values: withoutPassword(getValues()),
    });
    navigate(
      `/sign-in?redirect_url=${encodeURIComponent(`/games/${game.slug}`)}`,
    );
  };

  const onContinue = handleSubmit(() => {
    if (!selected) {
      toast.error("Choose a package first");
      return;
    }
    if (lookupValid && !confirmed) {
      toast.error("Please confirm this is your account");
      return;
    }
    if (hasPasswordField && !credentialConsent) {
      toast.error("Please confirm that our team may sign in to your account");
      return;
    }
    if (!isSignedIn) {
      goToSignIn();
      return;
    }
    setReviewOpen(true);
  });

  const submitOrder = (expectedPricePaisa: number) => {
    if (!selected) return;
    const current = getValues();
    const playerDetails: Record<string, string> = {};
    for (const field of visibleFields) {
      const raw = current[field.key] ?? "";
      const value = field.key === "password" ? raw : raw.trim();
      if (value) playerDetails[field.key] = value;
    }

    createOrder.mutate(
      {
        idempotencyKey,
        payload: {
          gameSlug: game.slug,
          packageId: selected.id,
          expectedPricePaisa,
          playerDetails,
          ...(lookupValid && checked
            ? { lookupToken: checked.lookupToken }
            : {}),
          ...(hasPasswordField ? { credentialConsent: true } : {}),
        },
      },
      {
        onSuccess: (order) => {
          clearDraft();
          toast.success("Order created");
          navigate(`/checkout/${order.reference}`);
        },
        onError: (err) => {
          const apiError = err as ApiError;
          setReviewOpen(false);

          if (apiError.code === "PRICE_CHANGED") {
            const next = Number(apiError.details?.[0]?.message);
            if (Number.isFinite(next)) {
              setPriceChange({ from: expectedPricePaisa, to: next });
              queryClient.invalidateQueries({
                queryKey: ["packages", game.slug],
              });
              return;
            }
          }
          if (apiError.status === 400 && lookupValid) setChecked(null);
          toast.error(apiError.message);
        },
      },
    );
  };

  const reviewText = selected
    ? `${game.name}: ${selected.name} for ${formatNpr(selected.pricePaisa)}. ${game.playerFields
        .map((field) =>
          field.key === "password"
            ? `${field.label}: (hidden)`
            : `${field.label}: ${summaryValues[field.key]?.trim() || "-"}`,
        )
        .join(
          ", ",
        )}. Check these carefully. An ID cannot be changed after the top-up is delivered.`
    : "";

  return (
    <div className="space-y-6">
      {!game.acceptingOrders && (
        <div
          role="status"
          className="rounded-lg border border-amber/40 bg-amber/10 p-4 text-sm text-amber"
        >
          Orders for {game.name} are paused right now. Please check back soon or
          message us on WhatsApp.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-5">
            <StepHeading step={1} title="Player details" />
            <PlayerDetailsCard
              fields={visibleFields}
              register={register}
              errors={errors}
              disabled={!game.acceptingOrders}
            />
            {game.lookup.enabled && (
              <PlayerLookupCheck
                slug={game.slug}
                idKey={`${playerId}|${serverId}`}
                checked={lookupValid ? checked : null}
                confirmed={confirmed}
                onConfirmedChange={setConfirmed}
                getIds={getIds}
                onChecked={setChecked}
                onRequireSignIn={goToSignIn}
                disabled={!game.acceptingOrders}
              />
            )}
            {hasPasswordField && (
              <div className="mt-4 space-y-3 rounded-lg border border-amber/40 bg-amber/10 p-4 text-sm">
                <p className="text-amber">
                  This game can only be topped up by signing in to your account.
                  Your password is stored encrypted, only the admin handling
                  your order can see it, and it is deleted when your order is
                  finished. Never send your password in a WhatsApp message, and
                  change it after the top-up. Some game publishers do not allow
                  others to sign in to your account.
                </p>
                <label className="flex items-start gap-2 text-fg">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-primary"
                    checked={credentialConsent}
                    onChange={(e) => setCredentialConsent(e.target.checked)}
                  />
                  <span>
                    I agree that Opulent's team may sign in to my account to
                    complete this top-up.
                  </span>
                </label>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <StepHeading step={2} title="Choose a package" />
            {packages.length === 0 ? (
              <EmptyState
                title="No packages available"
                description="Packages for this game will appear here soon."
              />
            ) : (
              <PackageGrid
                packages={packages}
                selectedId={selectedId}
                onSelect={setSelectedId}
                disabled={!game.acceptingOrders}
              />
            )}
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            game={game}
            selected={selected}
            values={summaryValues}
            disabled={!game.acceptingOrders}
            onContinue={onContinue}
          />
        </div>
      </div>

      <ConfirmDialog
        open={reviewOpen}
        title="Confirm your details"
        description={reviewText}
        confirmLabel="Create order"
        loading={createOrder.isPending}
        onConfirm={() => selected && submitOrder(selected.pricePaisa)}
        onCancel={() => setReviewOpen(false)}
      />

      <ConfirmDialog
        open={!!priceChange}
        title="The price changed"
        description={
          priceChange
            ? `The price of ${selected?.name ?? "this package"} changed from ${formatNpr(priceChange.from)} to ${formatNpr(priceChange.to)}. Do you want to continue at the new price?`
            : ""
        }
        confirmLabel="Continue at new price"
        loading={createOrder.isPending}
        onConfirm={() => {
          if (!priceChange) return;
          const next = priceChange.to;
          setPriceChange(null);
          submitOrder(next);
        }}
        onCancel={() => setPriceChange(null)}
      />
    </div>
  );
}
