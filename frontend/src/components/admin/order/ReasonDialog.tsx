import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Field } from "../../ui";

interface ReasonDialogProps {
  title: string;
  description: string;
  label?: string;
  confirmLabel: string;
  tone?: "primary" | "danger";
  loading: boolean;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}

export default function ReasonDialog({
  title,
  description,
  label = "Reason",
  confirmLabel,
  tone = "primary",
  loading,
  onSubmit,
  onClose,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");
  const valid = reason.trim().length > 0;

  return (
    <Dialog.Root open onOpenChange={(next) => !next && !loading && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-surface p-6 shadow-2xl">
          <Dialog.Title className="font-display text-lg font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-secondary">
            {description}
          </Dialog.Description>
          <div className="mt-4">
            <Field label={label}>
              <textarea
                rows={3}
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-fg focus:border-primary"
              />
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Back
            </Button>
            <Button
              variant={tone === "danger" ? "danger" : "primary"}
              disabled={!valid}
              loading={loading}
              onClick={() => onSubmit(reason.trim())}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
