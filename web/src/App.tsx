import { useEffect, useMemo, useState } from "react";
import type { Filters, ScrapeOutput, TabId } from "./types";
import { FilterSidebar } from "./components/FilterSidebar";
import { RestaurantMap } from "./components/RestaurantMap";
import { RestaurantCard } from "./components/RestaurantCard";
import { DetailDrawer } from "./components/DetailDrawer";
import { ListView } from "./components/ListView";
import {
  DEFAULT_FILTERS,
  collectFilterOptions,
  filterRestaurants,
} from "./utils/filters";

function App() {
  const [data, setData] = useState<ScrapeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("map");
  const [detailOpen, setDetailOpen] = useState(false);

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

  const restaurants = useMemo(() => data?.restaurants ?? [], [data]);
  const filtered = useMemo(
    () => filterRestaurants(restaurants, filters),
    [restaurants, filters],
  );
  const filterOptions = useMemo(
    () => collectFilterOptions(restaurants),
    [restaurants],
  );

  const visibleSelectedId =
    selectedId && filtered.some((r) => r.id === selectedId) ? selectedId : null;

  const selectedRestaurant =
    filtered.find((r) => r.id === visibleSelectedId) ??
    restaurants.find((r) => r.id === visibleSelectedId) ??
    null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setDetailOpen(true);
  };

  const showDetail = detailOpen && selectedRestaurant !== null;

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-8 text-center text-michelin-red">
        <h1 className="text-xl font-semibold">Could not load restaurants</h1>
        <p className="mt-2 text-michelin-gray">{error}</p>
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
    <div className="flex h-screen flex-col bg-michelin-surface">
      <header className="shrink-0 border-b border-michelin-border-light bg-white">
        <div className="h-1 bg-michelin-red" />
        <div className="flex items-end justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-michelin-red">
              MICHELIN Guide
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-michelin-black">
              Mikie&apos;s Montreal Trip
            </h1>
            <p className="text-sm text-michelin-gray">
              {filtered.length} of {restaurants.length} restaurants
            </p>
          </div>

          <nav className="flex gap-1 rounded-lg border border-michelin-border bg-michelin-surface p-1">
            {(["map", "list"] as TabId[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition ${
                  activeTab === tab
                    ? "bg-white text-michelin-black shadow-sm"
                    : "text-michelin-gray hover:text-michelin-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          options={filterOptions}
        />

        <main className="relative flex min-w-0 flex-1 flex-col">
          {activeTab === "map" ? (
            <div className="grid min-h-0 flex-1 grid-cols-[1fr_320px] gap-0">
              <div className="relative min-h-0 p-4">
                <RestaurantMap
                  restaurants={filtered}
                  selectedId={visibleSelectedId}
                  onSelect={handleSelect}
                />
              </div>
              <aside className="flex min-h-0 flex-col border-l border-michelin-border-light bg-white">
                <div className="border-b border-michelin-border-light px-4 py-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-michelin-muted">
                    Restaurants
                  </h2>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto p-3">
                  {filtered.length === 0 ? (
                    <p className="p-4 text-sm text-michelin-muted">
                      No restaurants match your filters.
                    </p>
                  ) : (
                    filtered.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        selected={restaurant.id === visibleSelectedId}
                        onSelect={handleSelect}
                      />
                    ))
                  )}
                </div>
              </aside>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ListView
                restaurants={filtered}
                selectedId={visibleSelectedId}
                onSelect={handleSelect}
              />
            </div>
          )}

          {showDetail && selectedRestaurant && (
            <DetailDrawer
              restaurant={selectedRestaurant}
              onClose={() => setDetailOpen(false)}
            />
          )}
        </main>
      </div>

      <footer className="shrink-0 border-t border-michelin-border-light bg-white px-4 py-2 text-center text-xs text-michelin-muted">
        Data from{" "}
        <a
          href="https://guide.michelin.com/ca/en/quebec/montreal_2433514/restaurants"
          target="_blank"
          rel="noopener noreferrer"
          className="text-michelin-red hover:underline"
        >
          MICHELIN Guide
        </a>
      </footer>
    </div>
  );
}

export default App;
