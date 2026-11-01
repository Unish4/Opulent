import { cn } from "../utils/cn";

interface LogoProps {
  className?: string;
  withName?: boolean;
}

export default function Logo({ className, withName = false }: LogoProps) {
  return (
    <span className="flex items-center gap-2">
      <img
        src="/logo.png"
        alt={withName ? "" : "Opulent"}
        className={cn("h-9 w-auto rounded-md", className)}
      />
      {withName && (
        <span className="font-display text-lg font-semibold">Opulent</span>
      )}
    </span>
  );
}
