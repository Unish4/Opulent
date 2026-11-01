import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BANNERS } from "../../config/banners";
import { cn } from "../../utils/cn";

const INTERVAL_MS = 3500;

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function HeroBanner() {
  const slides = BANNERS;
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion] = useState(prefersReducedMotion);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => setIndex((next + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || reducedMotion || count < 2) return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % count);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, reducedMotion, count, index]);

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured offers"
      className="relative w-full overflow-hidden bg-surface"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        const end = event.changedTouches[0]?.clientX;
        if (start === null || end === undefined) return;
        const delta = end - start;
        if (Math.abs(delta) > 50) go(index + (delta < 0 ? 1 : -1));
      }}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => {
          const image = (
            <img
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              draggable={false}
              className="aspect-[16/8] w-full object-cover sm:aspect-[16/5]"
            />
          );
          return (
            <div
              key={slide.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index}
              className="w-full shrink-0"
            >
              {slide.to ? (
                <Link to={slide.to} tabIndex={i === index ? 0 : -1}>
                  {image}
                </Link>
              ) : (
                image
              )}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 sm:flex"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 sm:flex"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === index
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-white/70 hover:bg-white",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
