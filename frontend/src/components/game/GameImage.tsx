import { optimizeImage } from "../../utils/image";
import { cn } from "../../utils/cn";

interface GameImageProps {
  src: string | null;
  name: string;
  width?: number;
  className?: string;
}

export default function GameImage({
  src,
  name,
  width = 400,
  className,
}: GameImageProps) {
  const optimized = optimizeImage(src, width);

  if (!optimized) {
    return (
      <div
        role="img"
        aria-label={name}
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary/40 to-elevated font-display text-4xl font-bold text-fg",
          className,
        )}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={optimized}
      alt={name}
      loading="lazy"
      className={cn("object-cover", className)}
    />
  );
}
