import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Field, Input, Select } from "../../ui";
import type { AdminRefundPayload, RefundReason } from "../../../types/refund";
import { REFUND_REASON_LABELS } from "../../../utils/orderLabels";

interface RefundFormDialogProps {
  prefillReference?: string;
  loading: boolean;
  onSubmit: (payload: AdminRefundPayload) => void;
  onClose: () => void;
}

const REFERENCE = /^OP-[A-HJ-NP-Z2-9]{8}$/;
const TXN = /^[A-Za-z0-9-]{4,40}$/;

const validAmount = (value: string): boolean => {
  const number = Number(value);
  return (
    !!value.trim() &&
    Number.isFinite(number) &&
    number > 0 &&
    Math.abs(number * 100 - Math.round(number * 100)) < 1e-6
  );
};

export default function RefundFormDialog({
  prefillReference = "",
  loading,
  onSubmit,
  onClose,
}: RefundFormDialogProps) {
  const [reference, setReference] = useState(prefillReference);
  const [reasonCode, setReasonCode] = useState<RefundReason>("overpayment");
  const [amount, setAmount] = useState("");
  const [txn, setTxn] = useState("");
  const [note, setNote] = useState("");

  const referenceOk =
    reference.trim() === "" || REFERENCE.test(reference.trim().toUpperCase());
  const txnOk = txn.trim() === "" || TXN.test(txn.trim());
  const ready =
    referenceOk && txnOk && validAmount(amount) && note.trim().length >= 3;

  return (
    <Dialog.Root open onOpenChange={(next) => !next && !loading && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-line bg-surface p-6 shadow-2xl">
          <Dialog.Title className="font-display text-lg font-semibold">
            New refund request
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-secondary">
            An owner approves and sends refunds. Link an order when there is
            one. For a payment with no order, enter the original eSewa
            transaction ID from the statement.
          </Dialog.Description>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Order ID (optional)"
              error={!referenceOk ? "Format: OP-XXXXXXXX" : undefined}
            >
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
              />
            </Field>
            <Field label="Reason">
              <Select
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value as RefundReason)}
              >
                {Object.entries(REFUND_REASON_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Amount to refund (Rs)"
              error={
                amount && !validAmount(amount) ? "Invalid amount" : undefined
              }
            >
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
            <Field
              label="Original eSewa transaction ID"
              hint="Required when the order has no confirmed payment."
              error={!txnOk ? "4-40 letters, numbers or dashes" : undefined}
            >
              <Input value={txn} onChange={(e) => setTxn(e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Note">
                <textarea
                  rows={3}
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-fg focus:border-primary"
                />
              </Field>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Back
            </Button>
            <Button
              disabled={!ready}
              loading={loading}
              onClick={() =>
                onSubmit({
                  ...(reference.trim()
                    ? { orderReference: reference.trim().toUpperCase() }
                    : {}),
                  reasonCode,
                  amountNpr: Number(amount),
                  ...(txn.trim() ? { incomingEsewaTxnId: txn.trim() } : {}),
                  note: note.trim(),
                })
              }
            >
              Create request
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
