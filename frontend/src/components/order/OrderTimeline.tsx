import type { CustomerTimelineEvent } from "../../types/order";
import { CUSTOMER_EVENT_LABELS } from "../../utils/orderLabels";
import { formatDateTime } from "../../utils/time";

export default function OrderTimeline({
  events,
}: {
  events: CustomerTimelineEvent[];
}) {
  return (
    <ol className="space-y-4">
      {[...events].reverse().map((event) => (
        <li key={event.id} className="border-l-2 border-line pl-3">
          <p className="text-sm font-medium">
            {CUSTOMER_EVENT_LABELS[event.action] ?? event.action}
          </p>
          <p className="text-xs text-muted">
            {formatDateTime(event.createdAt)}
          </p>
          {event.note && (
            <p className="mt-1 text-xs text-secondary">{event.note}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
