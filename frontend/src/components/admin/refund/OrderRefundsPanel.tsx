import { useState } from "react";
import toast from "react-hot-toast";
import RefundFormDialog from "./RefundFormDialog";
import { Badge, Button, Card } from "../../ui";
import {
  useAdminRefunds,
  useCreateRefund,
} from "../../../hooks/useAdminRefunds";
import { REFUND_REASON_LABELS } from "../../../utils/orderLabels";
import { formatNpr } from "../../../utils/money";

const TONE = {
  requested: "amber",
  approved: "primary",
  denied: "neutral",
  paid_out: "success",
} as const;

export default function OrderRefundsPanel({
  reference,
}: {
  reference: string;
}) {
  const { data } = useAdminRefunds({ order: reference, page: 1, limit: 20 });
  const create = useCreateRefund();
  const [open, setOpen] = useState(false);

  return (
    <Card className="space-y-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-white font-semibold">Refunds</h2>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          Request refund
        </Button>
      </div>

      {data && data.refunds.length === 0 && (
        <p className="text-sm text-muted">No refunds on this order.</p>
      )}
      {data?.refunds.map((refund) => (
        <div
          key={refund.id}
          className="flex items-center justify-between gap-3 rounded-md border border-line p-3 text-sm"
        >
          <div className="min-w-0">
            <p className="font-mono font-semibold">
              {formatNpr(refund.amountPaisa)}
            </p>
            <p className="truncate text-xs text-muted">
              {REFUND_REASON_LABELS[refund.reasonCode]}
            </p>
          </div>
          <Badge tone={TONE[refund.status]}>
            {refund.status.replace("_", " ")}
          </Badge>
        </div>
      ))}

      {open && (
        <RefundFormDialog
          prefillReference={reference}
          loading={create.isPending}
          onClose={() => setOpen(false)}
          onSubmit={(payload) =>
            create.mutate(payload, {
              onSuccess: () => {
                toast.success("Refund request created");
                setOpen(false);
              },
              onError: (err) => toast.error(err.message),
            })
          }
        />
      )}
    </Card>
  );
}
