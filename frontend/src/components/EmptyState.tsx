import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line px-6 py-12 text-center">
      <h3 className="text-white font-semibold text-fg">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-secondary">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
