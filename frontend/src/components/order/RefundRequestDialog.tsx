import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Field, Select } from "../ui";
import type { RefundReason } from "../../types/refund";
import {
  CUSTOMER_REFUND_REASONS,
  REFUND_REASON_LABELS,
} from "../../utils/orderLabels";

interface RefundRequestDialogProps {
  loading: boolean;
  onSubmit: (input: { reasonCode: RefundReason; note: string }) => void;
  onClose: () => void;
}

export default function RefundRequestDialog({
  loading,
  onSubmit,
  onClose,
}: RefundRequestDialogProps) {
  const [reasonCode, setReasonCode] = useState<RefundReason>("failed_topup");
  const [note, setNote] = useState("");
  const valid = note.trim().length >= 5;

  return (
    <Dialog.Root open onOpenChange={(next) => !next && !loading && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-surface p-6 shadow-2xl">
          <Dialog.Title className="font-display text-lg font-semibold">
            Request a refund
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-secondary">
            Refunds are reviewed case by case and are not automatic. If
            approved, the money is sent back to the eSewa account that paid.
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            <Field label="Reason">
              <Select
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value as RefundReason)}
              >
                {CUSTOMER_REFUND_REASONS.map((code) => (
                  <option key={code} value={code}>
                    {REFUND_REASON_LABELS[code]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="What happened?"
              hint="At least a few words, so our team can check."
            >
              <textarea
                rows={4}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-fg focus:border-primary"
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Back
            </Button>
            <Button
              disabled={!valid}
              loading={loading}
              onClick={() => onSubmit({ reasonCode, note: note.trim() })}
            >
              Send request
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
