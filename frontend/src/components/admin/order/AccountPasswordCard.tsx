import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import CopyButton from "../../CopyButton";
import { Button, Card } from "../../ui";
import { useRevealPassword } from "../../../hooks/useAdminOrders";

interface AccountPasswordCardProps {
  orderId: string;
  canReveal: boolean;
  revealCount: number;
}

function PasswordDialog({
  password,
  onClose,
}: {
  password: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 30_000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Dialog.Root open onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-surface p-6 shadow-2xl">
          <Dialog.Title className="font-display text-lg font-semibold">
            Account password
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-secondary">
            Use it only to complete this order. This window closes by itself
            after 30 seconds. Do not paste it into WhatsApp or save it anywhere.
          </Dialog.Description>
          <div className="mt-4 flex items-center justify-between gap-2 rounded-md border border-line bg-elevated p-3">
            <code className="break-all font-mono text-sm">{password}</code>
            <CopyButton value={password} label="Password" />
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function AccountPasswordCard({
  orderId,
  canReveal,
  revealCount,
}: AccountPasswordCardProps) {
  const reveal = useRevealPassword(orderId);
  const [password, setPassword] = useState<string | null>(null);

  return (
    <Card className="space-y-3 p-5">
      <h2 className="font-display text-base font-semibold">Account password</h2>
      <p className="text-sm text-secondary">
        The customer gave a password for this order. It is stored encrypted.
        Every time it is shown, it is recorded in the audit log under your name.
        It is deleted when the order is completed, cancelled or rejected.
      </p>
      {revealCount > 0 && (
        <p className="text-xs text-muted">
          Shown {revealCount} time(s) so far.
        </p>
      )}
      {canReveal ? (
        <Button
          variant="secondary"
          loading={reveal.isPending}
          onClick={() =>
            reveal.mutate(undefined, {
              onSuccess: (value) => setPassword(value),
              onError: (err) => toast.error(err.message),
            })
          }
        >
          Show password
        </Button>
      ) : (
        <p className="text-sm text-amber">
          Confirm the payment to claim this order. Then you can view the
          password. Owners can always view it while the order is open.
        </p>
      )}
      {password !== null && (
        <PasswordDialog password={password} onClose={() => setPassword(null)} />
      )}
    </Card>
  );
}
