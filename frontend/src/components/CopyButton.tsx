import { Copy } from "lucide-react";
import toast from "react-hot-toast";

interface CopyButtonProps {
  value: string;
  label: string;
}

export default function CopyButton({ value, label }: CopyButtonProps) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy. Please copy it manually.");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className="rounded-md p-1.5 text-secondary hover:bg-hover hover:text-fg"
    >
      <Copy size={16} />
    </button>
  );
}
