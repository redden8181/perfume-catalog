"use client";

import { hashHue, resolveImageSrc } from "@/core/utils";

/**
 * Фото флакона либо элегантный плейсхолдер:
 * градиент, детерминированный названием, и инициал.
 */
export function ImageOrPlaceholder({
  src,
  seed,
  label,
  className,
  imgClassName,
  eager = false,
}: {
  src: string | null;
  /** Строка-источник оттенка для плейсхолдера (обычно бренд + название). */
  seed: string;
  label: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const resolved = resolveImageSrc(src);
  if (resolved) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={label}
        loading={eager ? "eager" : "lazy"}
        className={imgClassName ?? className}
      />
    );
  }
  const hue = hashHue(seed);
  const hue2 = (hue + 26) % 360;
  const initial = label.trim().charAt(0).toUpperCase() || "·";
  return (
    <div
      aria-label={label}
      className={className}
      style={{
        background: `radial-gradient(120% 90% at 30% 15%, hsl(${hue} 32% 22% / 0.9), transparent 60%), linear-gradient(160deg, hsl(${hue} 26% 15%), hsl(${hue2} 24% 8%))`,
      }}
    >
      <span className="font-display text-6xl font-medium text-ivory/25 select-none">
        {initial}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 bottom-6 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, hsl(${hue} 45% 55% / 0.5), transparent)`,
        }}
      />
    </div>
  );
}
