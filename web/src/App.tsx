import { useEffect, useMemo, useState } from "react";
import type { Filters, ScrapeOutput } from "./types";
import { FilterBar } from "./components/FilterBar";
import { RestaurantList } from "./components/RestaurantList";
import { RestaurantMap } from "./components/RestaurantMap";
import { DEFAULT_FILTERS, filterRestaurants } from "./utils/filters";

function App() {
  const [data, setData] = useState<ScrapeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/montreal_michelin.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load data (${response.status})`);
        }
        return response.json() as Promise<ScrapeOutput>;
      })
      .then(setData)
      .catch((fetchError: Error) => setError(fetchError.message));
  }, []);

  const restaurants = data?.restaurants ?? [];
  const filtered = useMemo(
    () => filterRestaurants(restaurants, filters),
    [restaurants, filters],
  );

  useEffect(() => {
    if (selectedId && !filtered.some((restaurant) => restaurant.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-8 text-center text-michelin-red">
        <h1 className="text-xl font-semibold">Could not load restaurants</h1>
        <p className="mt-2 text-michelin-gray">{error}</p>
        <p className="mt-4 text-sm text-michelin-muted">
          Run the scraper first, then copy{" "}
          <code className="rounded bg-michelin-surface px-1">data/montreal_michelin.json</code>{" "}
          to{" "}
          <code className="rounded bg-michelin-surface px-1">
            web/public/montreal_michelin.json
          </code>
          .
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-michelin-surface text-michelin-gray">
        <div className="text-center">
          <div className="mx-auto mb-3 h-1 w-16 bg-michelin-red" />
          <p>Loading Montréal restaurants…</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-michelin-surface">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={restaurants.length}
      />

      <main className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[minmax(320px,420px)_1fr] lg:gap-6">
        <section className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          <RestaurantList
            restaurants={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>

        <section className="sticky top-4 h-[calc(100vh-180px)]">
          <RestaurantMap
            restaurants={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
