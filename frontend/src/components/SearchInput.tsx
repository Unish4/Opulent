import { Search } from "lucide-react";
import { cn } from "../utils/cn";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search games...",
  className,
  label = "Search games",
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-line bg-elevated pl-10 pr-3 text-sm text-fg placeholder:text-muted focus:border-primary"
      />
    </div>
  );
}
