import { useState, useEffect } from "react";
import { optimizeImage } from "../../utils/image";
import { cn } from "../../utils/cn";

interface GameImageProps {
  src: string | null;
  name: string;
  width?: number;
  height?: number;
  className?: string;
  crop?: "fill" | "limit" | "fit" | "scale";
  gravity?: "auto" | "center" | string;
}

export default function GameImage({
  src,
  name,
  width = 400,
  height,
  className,
  crop = "fill",
  gravity = "center",
}: GameImageProps) {
  const [hasError, setHasError] = useState(false);
  const optimized = optimizeImage(src, width, {
    height,
    crop,
    gravity,
    quality: "auto:best",
    dpr: "2.0",
  });

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!optimized || hasError) {
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
      onError={() => setHasError(true)}
      className={cn("object-cover object-center", className)}
    />
  );
}
