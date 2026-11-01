import { Badge } from "../ui";
import { cn } from "../../utils/cn";
import { formatNpr } from "../../utils/money";
import type { PublicPackage } from "../../types/package";

interface PackageGridProps {
  packages: PublicPackage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled: boolean;
}

export default function PackageGrid({
  packages,
  selectedId,
  onSelect,
  disabled,
}: PackageGridProps) {
  const groups = new Map<string, PublicPackage[]>();
  for (const pkg of packages) {
    const list = groups.get(pkg.group) ?? [];
    list.push(pkg);
    groups.set(pkg.group, list);
  }

  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([group, items]) => (
        <section key={group} aria-label={group}>
          <h3 className="mb-3 text-sm font-semibold text-secondary">{group}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((pkg) => {
              const unavailable = !pkg.isAvailable;
              const selected = pkg.id === selectedId && !unavailable;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  disabled={disabled || unavailable}
                  aria-pressed={selected}
                  onClick={() => onSelect(pkg.id)}
                  className={cn(
                    "relative flex min-h-24 flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center transition-colors",
                    "disabled:cursor-not-allowed",
                    unavailable
                      ? "border-dashed border-line bg-elevated/50 opacity-60"
                      : disabled
                        ? "opacity-50"
                        : selected
                          ? "border-primary bg-primary/15"
                          : "border-line bg-elevated hover:border-primary-hover",
                  )}
                >
                  {pkg.badge && !unavailable && (
                    <span className="absolute -top-2 right-2">
                      <Badge tone="amber">{pkg.badge}</Badge>
                    </span>
                  )}
                  <span className="text-sm font-semibold">{pkg.name}</span>
                  {pkg.description && (
                    <span className="text-xs text-muted">
                      {pkg.description}
                    </span>
                  )}
                  {unavailable ? (
                    <Badge>Unavailable</Badge>
                  ) : (
                    <span className="font-mono text-white font-semibold text-amber">
                      {formatNpr(pkg.pricePaisa)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
