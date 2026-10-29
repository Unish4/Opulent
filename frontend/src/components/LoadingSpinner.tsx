import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

export default function LoadingSpinner({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "flex items-center justify-center",
        fullScreen ? "min-h-screen" : "py-16",
      )}
    >
      <Loader2 className="animate-spin text-primary-hover" size={28} />
    </div>
  );
}
