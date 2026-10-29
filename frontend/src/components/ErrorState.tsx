import { AlertTriangle } from "lucide-react";
import { Button } from "./ui";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-danger/30 bg-danger/5 px-6 py-10 text-center"
    >
      <AlertTriangle className="text-danger" size={24} />
      <p className="text-sm text-secondary">
        {message ?? "Something went wrong. Please try again."}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
