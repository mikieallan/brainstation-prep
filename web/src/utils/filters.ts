import type { Distinction, Filters, Restaurant } from "../types";

export const DEFAULT_FILTERS: Filters = {
  search: "",
  distinctions: [],
  prices: [],
  familyFriendly: false,
  groups: false,
  soloDining: false,
};

export function filterRestaurants(
  restaurants: Restaurant[],
  filters: Filters,
): Restaurant[] {
  const query = filters.search.trim().toLowerCase();

  return restaurants.filter((restaurant) => {
    if (query) {
      const haystack = [
        restaurant.name,
        restaurant.cuisine,
        restaurant.address,
        restaurant.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (
      filters.distinctions.length > 0 &&
      !filters.distinctions.includes(restaurant.distinction)
    ) {
      return false;
    }

    if (
      filters.prices.length > 0 &&
      !filters.prices.includes(restaurant.price_level)
    ) {
      return false;
    }

    if (
      filters.familyFriendly &&
      !restaurant.good_for.includes("family_friendly")
    ) {
      return false;
    }

    if (filters.groups && !restaurant.good_for.includes("groups")) {
      return false;
    }

    if (filters.soloDining && !restaurant.good_for.includes("solo_dining")) {
      return false;
    }

    return true;
  });
}

export const ALL_DISTINCTIONS: Distinction[] = [
  "three_stars",
  "two_stars",
  "one_star",
  "bib_gourmand",
  "selected",
];

export const PRICE_OPTIONS = [
  { level: 1, label: "$" },
  { level: 2, label: "$$" },
  { level: 3, label: "$$$" },
  { level: 4, label: "$$$$" },
];
