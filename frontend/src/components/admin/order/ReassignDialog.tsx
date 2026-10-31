import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Field, Select } from "../../ui";
import { useTeam } from "../../../hooks/useAdminTeam";

interface ReassignDialogProps {
  title: string;
  description: string;
  withReason: boolean;
  defaultClaimantId?: string;
  confirmLabel: string;
  loading: boolean;
  onSubmit: (input: { claimantId: string; reason?: string }) => void;
  onClose: () => void;
}

export default function ReassignDialog({
  title,
  description,
  withReason,
  defaultClaimantId,
  confirmLabel,
  loading,
  onSubmit,
  onClose,
}: ReassignDialogProps) {
  const { data } = useTeam();
  const members = (data?.members ?? []).filter(
    (member) => member.status === "active",
  );
  const [claimantId, setClaimantId] = useState(defaultClaimantId ?? "");
  const [reason, setReason] = useState("");
  const ready = !!claimantId && (!withReason || reason.trim().length > 0);

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

          <div className="mt-4 space-y-4">
            <Field label="Admin who takes this order">
              <Select
                value={claimantId}
                onChange={(e) => setClaimantId(e.target.value)}
              >
                <option value="">Choose an admin</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </Select>
            </Field>
            {withReason && (
              <Field label="Reason">
                <textarea
                  rows={3}
                  maxLength={500}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-fg focus:border-primary"
                />
              </Field>
            )}
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
                  claimantId,
                  ...(withReason ? { reason: reason.trim() } : {}),
                })
              }
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
