import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-elevated text-fg border border-line hover:bg-hover",
  ghost: "text-secondary hover:bg-hover hover:text-fg",
  danger: "bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25",
};

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm",
        BUTTON_VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {loading && (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, error, hint, children }: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-fg">{label}</span>
      {children}
      {hint && !error && (
        <span className="block text-xs text-muted">{hint}</span>
      )}
      {error && (
        <span role="alert" className="block text-xs text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

const CONTROL =
  "h-11 w-full rounded-md border border-line bg-elevated px-3 text-sm text-fg placeholder:text-muted " +
  "focus:border-primary disabled:opacity-60";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(CONTROL, className)} {...props} />;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-elevated", className)}
    />
  );
}

type BadgeTone = "neutral" | "primary" | "success" | "amber";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-elevated text-secondary",
  primary: "bg-primary/20 text-primary-hover",
  success: "bg-success/15 text-success",
  amber: "bg-amber/15 text-amber",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        BADGE_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-lg border border-line bg-surface", className)}
      {...props}
    />
  );
}
