import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2 } from "lucide-react";
import { Button, Field, Input } from "../../ui";
import { formatNpr } from "../../../utils/money";

interface Row {
  txn: string;
  amount: string;
}

interface ConfirmPaymentDialogProps {
  pricePaisa: number;
  loading: boolean;
  onSubmit: (payload: {
    payments: { esewaTxnId: string; amountNpr: number }[];
    excessAcknowledged: boolean;
  }) => void;
  onClose: () => void;
}

const TXN = /^[A-Za-z0-9-]{4,40}$/;

const toPaisa = (value: string): number | null => {
  const number = Number(value);
  if (!value.trim() || !Number.isFinite(number) || number <= 0) return null;
  const paisa = Math.round(number * 100);
  return Math.abs(number * 100 - paisa) < 1e-6 ? paisa : null;
};

export default function ConfirmPaymentDialog({
  pricePaisa,
  loading,
  onSubmit,
  onClose,
}: ConfirmPaymentDialogProps) {
  const [rows, setRows] = useState<Row[]>([
    { txn: "", amount: String(pricePaisa / 100) },
  ]);
  const [excessAck, setExcessAck] = useState(false);

  const parsed = rows.map((row) => ({
    txnOk: TXN.test(row.txn.trim()),
    paisa: toPaisa(row.amount),
  }));
  const rowsValid = parsed.every((row) => row.txnOk && row.paisa !== null);
  const total = parsed.reduce((sum, row) => sum + (row.paisa ?? 0), 0);
  const short = rowsValid && total < pricePaisa;
  const over = rowsValid && total > pricePaisa;
  const canSubmit = rowsValid && !short && (!over || excessAck);

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );

  return (
    <Dialog.Root open onOpenChange={(next) => !next && !loading && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-line bg-surface p-6 shadow-2xl">
          <Dialog.Title className="font-display text-lg font-semibold">
            Confirm payment
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-secondary">
            Open the eSewa statement and find the payment. Copy the transaction
            ID and amount from the statement, not from the screenshot. Order
            price: {formatNpr(pricePaisa)}.
          </Dialog.Description>

          <div className="mt-4 space-y-3">
            {rows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_120px_auto] items-end gap-2"
              >
                <Field
                  label={
                    index === 0 ? "eSewa transaction ID" : "Transaction ID"
                  }
                  error={
                    row.txn && !parsed[index]?.txnOk
                      ? "4-40 letters, numbers or dashes"
                      : undefined
                  }
                >
                  <Input
                    value={row.txn}
                    onChange={(e) => update(index, { txn: e.target.value })}
                  />
                </Field>
                <Field
                  label="Amount (Rs)"
                  error={
                    row.amount && parsed[index]?.paisa === null
                      ? "Invalid"
                      : undefined
                  }
                >
                  <Input
                    inputMode="decimal"
                    value={row.amount}
                    onChange={(e) => update(index, { amount: e.target.value })}
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mb-1"
                  disabled={rows.length === 1}
                  aria-label="Remove payment"
                  onClick={() =>
                    setRows((current) => current.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={rows.length >= 5}
              onClick={() =>
                setRows((current) => [...current, { txn: "", amount: "" }])
              }
            >
              <Plus size={14} /> Add another payment
            </Button>
          </div>

          <p className="mt-4 text-sm">
            Total received:{" "}
            <span className="font-mono font-semibold">{formatNpr(total)}</span>
          </p>
          {short && (
            <p role="alert" className="mt-2 text-sm text-danger">
              This is less than the order price. Close this and put the order on
              hold instead.
            </p>
          )}
          {over && (
            <label className="mt-3 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-primary"
                checked={excessAck}
                onChange={(e) => setExcessAck(e.target.checked)}
              />
              <span>
                The customer paid {formatNpr(total - pricePaisa)} too much. I
                will refund the excess.
              </span>
            </label>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Back
            </Button>
            <Button
              disabled={!canSubmit}
              loading={loading}
              onClick={() =>
                onSubmit({
                  payments: rows.map((row) => ({
                    esewaTxnId: row.txn.trim(),
                    amountNpr: Number(row.amount),
                  })),
                  excessAcknowledged: over && excessAck,
                })
              }
            >
              Confirm payment
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
