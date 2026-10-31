import { Badge, Button, Card } from "../ui";
import GameImage from "./GameImage";
import { formatNpr } from "../../utils/money";
import type { GameDetail } from "../../types/game";
import type { PublicPackage } from "../../types/package";
import type { PlayerFormValues } from "../../utils/playerSchema";

interface OrderSummaryProps {
  game: GameDetail;
  selected: PublicPackage | null;
  values: PlayerFormValues;
  disabled: boolean;
  onContinue: () => void;
}

export default function OrderSummary({
  game,
  selected,
  values,
  disabled,
  onContinue,
}: OrderSummaryProps) {
  return (
    <Card className="p-5">
      <h2 className="font-display text-lg font-semibold">Order summary</h2>

      <div className="mt-4 flex items-center gap-3 border-b border-line pb-4">
        <GameImage
          src={game.imageUrl}
          name={game.name}
          width={120}
          className="size-12 rounded-md"
        />
        <p className="font-medium">{game.name}</p>
      </div>

      <dl className="space-y-3 py-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-secondary">Package</dt>
          <dd className="text-right font-medium">
            {selected ? selected.name : <Badge tone="amber">Choose one</Badge>}
          </dd>
        </div>
        {game.playerFields.map((field) => (
          <div
            key={field.key}
            className="flex items-center justify-between gap-3"
          >
            <dt className="text-secondary">{field.label}</dt>
            <dd className="max-w-[60%] truncate text-right font-mono text-fg">
              {values[field.key]?.trim() || (
                <Badge tone="amber">Required</Badge>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex items-end justify-between border-t border-line pt-4">
        <span className="text-sm text-secondary">Total payable</span>
        <span className="font-mono text-2xl font-bold text-amber">
          {selected ? formatNpr(selected.pricePaisa) : "—"}
        </span>
      </div>

      <Button className="mt-5 w-full" onClick={onContinue} disabled={disabled}>
        Continue to payment
      </Button>
      <p className="mt-3 text-center text-xs text-muted">
        Pay with eSewa, then send your proof on WhatsApp. Our team checks every
        payment.
      </p>
    </Card>
  );
}
