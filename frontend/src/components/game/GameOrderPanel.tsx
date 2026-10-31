import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import EmptyState from "../EmptyState";
import { Card } from "../ui";
import OrderSummary from "./OrderSummary";
import PackageGrid from "./PackageGrid";
import PlayerDetailsCard from "./PlayerDetailsCard";
import StepHeading from "./StepHeading";
import {
  buildPlayerSchema,
  type PlayerFormValues,
} from "../../utils/playerSchema";
import type { GameDetail } from "../../types/game";
import type { PublicPackage } from "../../types/package";

interface GameOrderPanelProps {
  game: GameDetail;
  packages: PublicPackage[];
}

export default function GameOrderPanel({
  game,
  packages,
}: GameOrderPanelProps) {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const schema = useMemo(
    () => buildPlayerSchema(game.playerFields),
    [game.playerFields],
  );
  const defaultValues = useMemo(
    () =>
      Object.fromEntries(
        game.playerFields.map((field) => [field.key, ""]),
      ) as PlayerFormValues,
    [game.playerFields],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const values = watch();
  const selected = packages.find((pkg) => pkg.id === selectedId) ?? null;

  const onContinue = handleSubmit(() => {
    if (!selected) {
      toast.error("Choose a package first");
      return;
    }
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }
    toast("Order creation opens in the next update.");
  });

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
              fields={game.playerFields}
              register={register}
              errors={errors}
              disabled={!game.acceptingOrders}
            />
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
            values={values}
            disabled={!game.acceptingOrders}
            onContinue={onContinue}
          />
        </div>
      </div>
    </div>
  );
}
