import type { Distinction } from "../types";
import { DISTINCTION_COLORS, DISTINCTION_LABELS } from "../utils/labels";

interface DistinctionBadgeProps {
  distinction: Distinction;
  starCount?: number;
  isBib?: boolean;
}

export function DistinctionBadge({
  distinction,
  starCount = 0,
  isBib = false,
}: DistinctionBadgeProps) {
  const label =
    starCount > 0
      ? `${starCount} Star${starCount > 1 ? "s" : ""}`
      : isBib
        ? "Bib Gourmand"
        : DISTINCTION_LABELS[distinction];

  const isStar = starCount > 0;
  const textColor = isStar ? "text-michelin-black" : "text-white";
  const backgroundStyle = isStar
    ? { backgroundColor: "#fff", border: "1px solid #E0E0E0", color: "#191919" }
    : { backgroundColor: DISTINCTION_COLORS[distinction] };

  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${textColor}`}
      style={backgroundStyle}
    >
      {isStar && (
        <span className="mr-1 text-michelin-gold" aria-hidden="true">
          ★
        </span>
      )}
      {label}
    </span>
  );
}
