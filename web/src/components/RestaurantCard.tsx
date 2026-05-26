import type { Restaurant } from "../types";
import { DistinctionBadge } from "./DistinctionBadge";
import { formatHours, GOOD_FOR_LABELS } from "../utils/labels";

interface RestaurantCardProps {
  restaurant: Restaurant;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function RestaurantCard({
  restaurant,
  selected,
  onSelect,
}: RestaurantCardProps) {
  return (
    <article
      id={`restaurant-${restaurant.id}`}
      onClick={() => onSelect(restaurant.id)}
      className={`cursor-pointer rounded-lg border p-4 transition ${
        selected
          ? "border-michelin-red bg-michelin-red-light shadow-md"
          : "border-michelin-border-light bg-white hover:border-michelin-border hover:shadow-sm"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <DistinctionBadge
          distinction={restaurant.distinction}
          starCount={restaurant.star_count}
          isBib={restaurant.is_bib_gourmand}
        />
        {restaurant.price && (
          <span
            className={`text-sm font-semibold ${
              selected ? "text-michelin-red-dark" : "text-michelin-gray"
            }`}
          >
            {restaurant.price}
          </span>
        )}
        {restaurant.is_green_star && (
          <span className="rounded-sm bg-michelin-green px-2 py-0.5 text-xs font-semibold uppercase text-white">
            Green Star
          </span>
        )}
      </div>

      <h2 className="text-lg font-semibold text-michelin-black">
        {restaurant.name}
      </h2>
      <p className={`text-sm ${selected ? "text-michelin-gray" : "text-michelin-muted"}`}>
        {restaurant.cuisine}
        {restaurant.city ? ` · ${restaurant.city}` : ""}
      </p>

      {restaurant.good_for.length > 0 && (
        <p className="mt-2 text-xs text-michelin-gray">
          {restaurant.good_for.map((tag) => GOOD_FOR_LABELS[tag] ?? tag).join(" · ")}
        </p>
      )}

      {selected && (
        <div className="mt-3 space-y-2 border-t border-michelin-border-light pt-3 text-sm text-michelin-gray">
          {restaurant.address && <p>{restaurant.address}</p>}
          <p>{formatHours(restaurant.hours)}</p>
          {restaurant.description_short && (
            <p className="text-michelin-black">{restaurant.description_short}</p>
          )}
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href={restaurant.michelin_url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-michelin-red hover:text-michelin-red-dark"
              onClick={(event) => event.stopPropagation()}
            >
              Michelin page
            </a>
            {restaurant.website && (
              <a
                href={restaurant.website}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-michelin-red hover:text-michelin-red-dark"
                onClick={(event) => event.stopPropagation()}
              >
                Website
              </a>
            )}
            {restaurant.booking_url && (
              <a
                href={restaurant.booking_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-michelin-red hover:text-michelin-red-dark"
                onClick={(event) => event.stopPropagation()}
              >
                Book
              </a>
            )}
            {restaurant.phone && <span>{restaurant.phone}</span>}
          </div>
        </div>
      )}
    </article>
  );
}
