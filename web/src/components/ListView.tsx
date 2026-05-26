import type { Restaurant } from "../types";
import { RestaurantCard } from "./RestaurantCard";

interface ListViewProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ListView({ restaurants, selectedId, onSelect }: ListViewProps) {
  if (!restaurants.length) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-michelin-muted">
        No restaurants match your filters.
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          selected={restaurant.id === selectedId}
          onSelect={onSelect}
          compact
        />
      ))}
    </div>
  );
}
