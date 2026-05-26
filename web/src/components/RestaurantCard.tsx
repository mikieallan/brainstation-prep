import type { Restaurant } from "../types";
import { DistinctionBadge } from "./DistinctionBadge";

interface RestaurantCardProps {
  restaurant: Restaurant;
  selected: boolean;
  onSelect: (id: string) => void;
  compact?: boolean;
}

export function RestaurantCard({
  restaurant,
  selected,
  onSelect,
  compact = false,
}: RestaurantCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(restaurant.id)}
      className={`w-full rounded-lg border bg-white p-3 text-left transition hover:border-michelin-black ${
        selected
          ? "border-michelin-red ring-2 ring-michelin-red/20"
          : "border-michelin-border-light"
      } ${compact ? "p-4" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-michelin-black">{restaurant.name}</h3>
        <DistinctionBadge restaurant={restaurant} />
      </div>
      <p className="mt-1 text-sm text-michelin-gray">
        {restaurant.price ?? "—"} · {restaurant.cuisine ?? "Cuisine N/A"}
      </p>
      {restaurant.address && (
        <p className="mt-1 line-clamp-2 text-xs text-michelin-muted">
          {restaurant.address}
        </p>
      )}
      {!restaurant.in_montreal_city && (
        <span className="mt-2 inline-block rounded bg-michelin-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-michelin-muted">
          Suburb
        </span>
      )}
    </button>
  );
}
