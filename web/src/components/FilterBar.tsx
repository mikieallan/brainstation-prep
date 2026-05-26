import type { Distinction, Filters } from "../types";
import {
  ALL_DISTINCTIONS,
  DEFAULT_FILTERS,
  PRICE_OPTIONS,
} from "../utils/filters";
import { DISTINCTION_LABELS } from "../utils/labels";

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount: number;
  totalCount: number;
}

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function filterBtnClass(active: boolean, variant: "default" | "red" = "default") {
  const base = "rounded-lg px-3 py-1.5 text-sm font-medium transition";
  if (!active) return `${base} michelin-filter-btn`;
  return variant === "red"
    ? `${base} michelin-filter-btn-red-active`
    : `${base} michelin-filter-btn-active`;
}

export function FilterBar({
  filters,
  onChange,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const setDistinctions = (distinction: Distinction) => {
    onChange({
      ...filters,
      distinctions: toggleValue(filters.distinctions, distinction),
    });
  };

  const setPrice = (level: number) => {
    onChange({
      ...filters,
      prices: toggleValue(filters.prices, level),
    });
  };

  return (
    <header className="border-b border-michelin-border-light bg-white">
      <div className="h-1 bg-michelin-red" />
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-michelin-red">
              MICHELIN Guide
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-michelin-black">
              Montréal
            </h1>
            <p className="text-sm text-michelin-gray">
              {resultCount} of {totalCount} restaurants
            </p>
          </div>
          <input
            type="search"
            placeholder="Search name or cuisine…"
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
            className="w-full max-w-sm rounded-lg border border-michelin-border bg-white px-3 py-2 text-sm text-michelin-black outline-none placeholder:text-michelin-muted focus:border-michelin-black focus:ring-2 focus:ring-michelin-red/20"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="self-center text-xs font-semibold uppercase tracking-wide text-michelin-muted">
            Distinction
          </span>
          {ALL_DISTINCTIONS.map((distinction) => {
            const active = filters.distinctions.includes(distinction);
            return (
              <button
                key={distinction}
                type="button"
                onClick={() => setDistinctions(distinction)}
                className={filterBtnClass(active)}
              >
                {DISTINCTION_LABELS[distinction]}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-michelin-muted">
            Price
          </span>
          {PRICE_OPTIONS.map(({ level, label }) => {
            const active = filters.prices.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => setPrice(level)}
                className={filterBtnClass(active, "red")}
              >
                {label}
              </button>
            );
          })}

          <label className="ml-2 inline-flex items-center gap-2 rounded-lg border border-michelin-border bg-white px-3 py-1.5 text-sm text-michelin-gray">
            <input
              type="checkbox"
              className="accent-michelin-red"
              checked={filters.familyFriendly}
              onChange={(event) =>
                onChange({ ...filters, familyFriendly: event.target.checked })
              }
            />
            Family friendly
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-michelin-border bg-white px-3 py-1.5 text-sm text-michelin-gray">
            <input
              type="checkbox"
              className="accent-michelin-red"
              checked={filters.groups}
              onChange={(event) =>
                onChange({ ...filters, groups: event.target.checked })
              }
            />
            Good for groups
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-michelin-border bg-white px-3 py-1.5 text-sm text-michelin-gray">
            <input
              type="checkbox"
              className="accent-michelin-red"
              checked={filters.soloDining}
              onChange={(event) =>
                onChange({ ...filters, soloDining: event.target.checked })
              }
            />
            Solo dining
          </label>

          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="ml-auto text-sm text-michelin-gray underline-offset-2 hover:text-michelin-red hover:underline"
          >
            Clear filters
          </button>
        </div>
      </div>
    </header>
  );
}
