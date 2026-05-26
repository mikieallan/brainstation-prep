import type { Restaurant } from "../types";
import { DistinctionBadge } from "./DistinctionBadge";
import { formatHours } from "../utils/labels";

interface DetailDrawerProps {
  restaurant: Restaurant | null;
  onClose: () => void;
}

export function DetailDrawer({ restaurant, onClose }: DetailDrawerProps) {
  if (!restaurant) return null;

  return (
    <div className="absolute inset-0 z-[1000] flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-michelin-border-light bg-white shadow-xl">
        <div className="h-1 rounded-t-xl bg-michelin-red" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-michelin-black">
                {restaurant.name}
              </h2>
              <div className="mt-2">
                <DistinctionBadge restaurant={restaurant} size="md" />
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-michelin-muted hover:bg-michelin-surface hover:text-michelin-black"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-michelin-muted">
                Price & cuisine
              </dt>
              <dd className="mt-0.5 text-michelin-gray">
                {restaurant.price ?? "—"} · {restaurant.cuisine ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-michelin-muted">
                Address
              </dt>
              <dd className="mt-0.5 text-michelin-gray">
                {restaurant.address ?? "Address not listed"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-michelin-muted">
                Hours
              </dt>
              <dd className="mt-0.5 text-michelin-gray">
                {formatHours(restaurant.hours)}
              </dd>
            </div>
          </dl>

          <a
            href={restaurant.michelin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-michelin-red hover:underline"
          >
            View on Michelin Guide →
          </a>
        </div>
      </div>
    </div>
  );
}
