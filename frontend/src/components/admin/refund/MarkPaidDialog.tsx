import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Field, Input } from "../../ui";
import { formatNpr } from "../../../utils/money";

interface MarkPaidDialogProps {
  amountPaisa: number;
  loading: boolean;
  onSubmit: (txnId: string) => void;
  onClose: () => void;
}

const TXN = /^[A-Za-z0-9-]{4,40}$/;

export default function MarkPaidDialog({
  amountPaisa,
  loading,
  onSubmit,
  onClose,
}: MarkPaidDialogProps) {
  const [txn, setTxn] = useState("");
  const [sentToPayer, setSentToPayer] = useState(false);
  const ready = TXN.test(txn.trim()) && sentToPayer;

  return (
    <Dialog.Root open onOpenChange={(next) => !next && !loading && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-surface p-6 shadow-2xl">
          <Dialog.Title className="font-display text-lg font-semibold">
            Mark refund as paid
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-secondary">
            Send {formatNpr(amountPaisa)} back from eSewa first. Then copy the
            transaction ID of that refund payment from your eSewa statement.
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            <Field
              label="eSewa refund transaction ID"
              error={
                txn && !TXN.test(txn.trim())
                  ? "4-40 letters, numbers or dashes"
                  : undefined
              }
            >
              <Input value={txn} onChange={(e) => setTxn(e.target.value)} />
            </Field>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-primary"
                checked={sentToPayer}
                onChange={(e) => setSentToPayer(e.target.checked)}
              />
              <span>
                I sent this only to the eSewa account that made the original
                payment.
              </span>
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Back
            </Button>
            <Button
              disabled={!ready}
              loading={loading}
              onClick={() => onSubmit(txn.trim())}
            >
              Mark as paid
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
