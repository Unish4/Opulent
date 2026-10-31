import { Order } from "../models/Order.js";
import { Refund } from "../models/Refund.js";
import { formatNepalDateTime, type DateRange } from "../utils/dateRange.js";
import { toCsv } from "../utils/csv.js";
import { loadUserMap } from "../utils/loadUserMap.js";

const ROW_LIMIT = 5000;

export const buildReconciliationCsv = async (
  range: DateRange,
): Promise<string> => {
  const [payments, refunds] = await Promise.all([
    Order.aggregate<{
      reference: string;
      status: string;
      confirmedAt: Date;
      confirmedBy: string;
      esewaTxnId: string;
      amountPaisa: number;
    }>([
      {
        $match: {
          "paymentConfirmation.confirmedAt": {
            $gte: range.start,
            $lte: range.end,
          },
        },
      },
      { $unwind: "$paymentConfirmation.payments" },
      {
        $project: {
          reference: 1,
          status: 1,
          confirmedAt: "$paymentConfirmation.confirmedAt",
          confirmedBy: "$paymentConfirmation.confirmedBy",
          esewaTxnId: "$paymentConfirmation.payments.esewaTxnId",
          amountPaisa: "$paymentConfirmation.payments.amountPaisa",
        },
      },
      { $sort: { confirmedAt: 1 } },
      { $limit: ROW_LIMIT },
    ]),
    Refund.find({
      status: "paid_out",
      paidOutAt: { $gte: range.start, $lte: range.end },
    })
      .sort({ paidOutAt: 1 })
      .limit(ROW_LIMIT),
  ]);

  const users = await loadUserMap([
    ...payments.map((payment) => payment.confirmedBy),
    ...refunds.map((refund) => refund.paidOutBy),
  ]);

  const rows: { at: Date; cells: (string | number | null)[] }[] = [
    ...payments.map((payment) => ({
      at: payment.confirmedAt,
      cells: [
        formatNepalDateTime(payment.confirmedAt),
        "payment",
        payment.esewaTxnId,
        payment.amountPaisa / 100,
        payment.reference,
        payment.status,
        users.get(String(payment.confirmedBy))?.name ?? "",
      ],
    })),
    ...refunds.map((refund) => ({
      at: refund.paidOutAt ?? refund.updatedAt,
      cells: [
        formatNepalDateTime(refund.paidOutAt ?? refund.updatedAt),
        "refund",
        refund.paidOutTxnId ?? "",
        -(refund.amountPaisa / 100),
        refund.orderReference ?? "",
        "",
        users.get(String(refund.paidOutBy))?.name ?? "",
      ],
    })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  return toCsv(
    [
      "Date (Nepal time)",
      "Type",
      "eSewa transaction ID",
      "Amount (NPR)",
      "Order",
      "Order status",
      "Handled by",
    ],
    rows.map((row) => row.cells),
  );
};
