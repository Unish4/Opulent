import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Field, Input } from "../../ui";

interface CompleteOrderDialogProps {
  orderName: string;
  loading: boolean;
  onSubmit: (seenPlayerName: string) => void;
  onClose: () => void;
}

const CHECKS = [
  "I delivered the top-up to the player ID on this order",
  "I checked the in-game name myself",
  "The name below is exactly what I saw in the game",
];

export default function CompleteOrderDialog({
  orderName,
  loading,
  onSubmit,
  onClose,
}: CompleteOrderDialogProps) {
  const [name, setName] = useState(orderName);
  const [ticked, setTicked] = useState<boolean[]>(CHECKS.map(() => false));
  const ready = name.trim().length > 0 && ticked.every(Boolean);

  return (
    <Dialog.Root open onOpenChange={(next) => !next && !loading && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-surface p-6 shadow-2xl">
          <Dialog.Title className="font-display text-lg font-semibold">
            Mark as completed
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-secondary">
            Only complete the order after the top-up has really been delivered.
          </Dialog.Description>

          <div className="mt-4 space-y-2">
            {CHECKS.map((text, index) => (
              <label key={text} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-primary"
                  checked={ticked[index]}
                  onChange={(e) =>
                    setTicked((current) =>
                      current.map((value, i) =>
                        i === index ? e.target.checked : value,
                      ),
                    )
                  }
                />
                {text}
              </label>
            ))}
          </div>

          <div className="mt-4">
            <Field label="In-game name you saw">
              <Input
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Back
            </Button>
            <Button
              disabled={!ready}
              loading={loading}
              onClick={() => onSubmit(name.trim())}
            >
              Mark completed
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
