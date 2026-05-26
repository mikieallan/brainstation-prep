import type { Restaurant } from "../types";
import { RestaurantCard } from "./RestaurantCard";

interface RestaurantListProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function RestaurantList({
  restaurants,
  selectedId,
  onSelect,
}: RestaurantListProps) {
  if (restaurants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-michelin-border bg-white p-8 text-center text-michelin-gray">
        No restaurants match your filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          selected={restaurant.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
