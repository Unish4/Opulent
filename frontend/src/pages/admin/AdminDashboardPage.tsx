import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import ErrorState from "../../components/ErrorState";
import { Button, Card, Input, Skeleton } from "../../components/ui";
import {
  downloadReconciliation,
  useAdminDashboard,
} from "../../hooks/useAdminDashboard";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { cn } from "../../utils/cn";
import { formatNpr } from "../../utils/money";
import { formatMinutes, nepalDay, nepalDaysAgo } from "../../utils/time";

const PRESETS = [
  { label: "Today", days: 0 },
  { label: "7 days", days: 6 },
  { label: "30 days", days: 29 },
];

function Stat({
  label,
  value,
  hint,
  to,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  to?: string;
}) {
  const body = (
    <Card className={cn("p-4", to && "transition-colors hover:border-primary")}>
      <p className="text-xs text-secondary">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

export default function AdminDashboardPage() {
  const { data: me } = useCurrentUser();
  const isOwner = me?.role === "owner";
  const [from, setFrom] = useState(nepalDaysAgo(29));
  const [to, setTo] = useState(nepalDay());
  const [exporting, setExporting] = useState(false);
  const rangeValid = !!from && !!to && from <= to;

  const { data, isLoading, isError, error, refetch } = useAdminDashboard(
    rangeValid ? from : nepalDaysAgo(29),
    rangeValid ? to : nepalDay(),
  );

  const maxSales = Math.max(
    1,
    ...(data?.byGame.map((game) => game.salesPaisa) ?? [1]),
  );
  const lookupPercent = data
    ? Math.min(
        100,
        Math.round((data.lookup.usedToday / data.lookup.dailyLimit) * 100),
      )
    : 0;

  const exportCsv = async () => {
    setExporting(true);
    try {
      await downloadReconciliation(from, to);
    } catch {
      toast.error("Could not export. Check the date range and try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-sm text-secondary">
          Dates use Nepal time. Sales count orders by the day they were
          completed.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="secondary"
              size="sm"
              onClick={() => {
                setFrom(nepalDaysAgo(preset.days));
                setTo(nepalDay());
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Input
          type="date"
          aria-label="From date"
          className="w-40"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input
          type="date"
          aria-label="To date"
          className="w-40"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        {isOwner && (
          <Button
            variant="secondary"
            size="sm"
            loading={exporting}
            disabled={!rangeValid}
            onClick={exportCsv}
          >
            <Download size={15} /> Export for eSewa reconciliation
          </Button>
        )}
      </div>
      {!rangeValid && (
        <p className="text-sm text-danger">
          The start date must not be after the end date.
        </p>
      )}

      {isLoading && <Skeleton className="h-64" />}
      {isError && (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      )}

      {data && (
        <>
          <section aria-labelledby="queues" className="space-y-3">
            <h2 id="queues" className="font-display text-white font-semibold">
              Needs attention
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                label="Needs review"
                value={data.queues.awaitingReview}
                to="/admin/orders?status=awaiting_review"
              />
              <Stat
                label="Unpaid"
                value={data.queues.pendingPayment}
                to="/admin/orders?status=pending_payment"
              />
              <Stat
                label="Processing"
                value={data.queues.processing}
                to="/admin/orders?status=processing"
              />
              <Stat
                label="On hold"
                value={data.queues.onHold}
                to="/admin/orders?status=on_hold"
              />
              <Stat
                label="Failed"
                value={data.queues.failed}
                to="/admin/orders?status=failed"
              />
              <Stat
                label="Refund requests"
                value={data.queues.refundsRequested}
                to="/admin/refunds?status=requested"
              />
              <Stat
                label="Refunds to pay"
                value={data.queues.refundsToPay}
                to="/admin/refunds?status=approved"
              />
            </div>
          </section>

          <section aria-labelledby="period" className="space-y-3">
            <h2 id="period" className="font-display text-white font-semibold">
              {data.range.from} to {data.range.to}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Completed orders" value={data.period.completed} />
              <Stat
                label="Completed sales"
                value={formatNpr(data.period.completedSalesPaisa)}
              />
              <Stat
                label="Refunds paid"
                value={formatNpr(data.period.refundsPaidPaisa)}
                hint={`${data.period.refundsPaidCount} refunds`}
              />
              <Stat label="Orders created" value={data.period.created} />
              <Stat label="Rejected" value={data.period.rejected} />
              <Stat label="Cancelled" value={data.period.cancelled} />
              <Stat
                label="Avg. time to confirm"
                value={formatMinutes(data.period.avgVerifyMinutes)}
                hint="Proof signal to payment confirmed"
              />
              <Stat
                label="Avg. time to complete"
                value={formatMinutes(data.period.avgFulfilMinutes)}
                hint="Payment confirmed to completed"
              />
              {data.period.estimatedGrossProfitPaisa !== null && (
                <Stat
                  label="Estimated gross profit"
                  value={formatNpr(data.period.estimatedGrossProfitPaisa)}
                  hint={
                    data.period.ordersMissingCost
                      ? `${data.period.ordersMissingCost} completed orders have no cost and are not counted`
                      : "Before refunds and running costs"
                  }
                />
              )}
            </div>
          </section>

          <section aria-labelledby="games" className="space-y-3">
            <h2 id="games" className="font-display text-white font-semibold">
              Sales by game
            </h2>
            <Card className="space-y-4 p-5">
              {data.byGame.length === 0 && (
                <p className="text-sm text-muted">
                  No completed orders in this period.
                </p>
              )}
              {data.byGame.map((game) => (
                <div key={game.slug} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium">{game.name}</span>
                    <span className="font-mono">
                      {formatNpr(game.salesPaisa)}{" "}
                      <span className="text-muted">
                        · {game.completed} orders
                      </span>
                      {game.estimatedProfitPaisa !== null && (
                        <span className="text-success">
                          {" "}
                          · profit {formatNpr(game.estimatedProfitPaisa)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-elevated">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.max(2, Math.round((game.salesPaisa / maxSales) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </Card>
          </section>

          <section
            aria-labelledby="system"
            className="grid gap-3 sm:grid-cols-2"
          >
            <Card className="space-y-2 p-5">
              <h2 id="system" className="font-display text-white font-semibold">
                Player lookup today
              </h2>
              <p className="font-mono text-lg">
                {data.lookup.usedToday} / {data.lookup.dailyLimit}
              </p>
              <div className="h-2 rounded-full bg-elevated">
                <div
                  className={cn(
                    "h-2 rounded-full",
                    lookupPercent >= 90 ? "bg-danger" : "bg-success",
                  )}
                  style={{ width: `${lookupPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted">
                {data.lookup.keyConfigured
                  ? "Provider key is set."
                  : "No provider key is set, so lookups are off."}{" "}
                Quota resets at midnight Nepal time.
              </p>
            </Card>
            <Card className="space-y-2 p-5">
              <h2 className="font-display text-white font-semibold">
                Catalogue
              </h2>
              <p className="text-sm text-secondary">
                {data.catalogue.gamesPublished} published games,{" "}
                {data.catalogue.packagesAvailable} available packages.
              </p>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
