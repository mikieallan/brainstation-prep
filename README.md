# Montreal Michelin Guide — Map Explorer

One-time scrape of all [Michelin-recommended Montreal restaurants](https://guide.michelin.com/ca/en/quebec/montreal_2433514/restaurants), displayed on an interactive map with collapsible filters.

## Quick start

```bash
# 1. Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers playwright install chromium

# 2. Scrape (~5–8 min for 63 restaurants + filter metadata)
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers python -m scraper.main

# 3. Web app (JSON is copied to web/public/ automatically)
cd web && npm install && npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scraper

```bash
python -m scraper.main                  # full scrape → data/montreal_michelin.json
python -m scraper.main --limit 5        # smoke test
python -m scraper.main --refresh        # ignore cached HTML
python -m scraper.main --skip-filters   # detail pages only
```

The scraper:

1. Reads filter metadata from Michelin list-page filters (cuisine tags, good-for, dietary, services, open days, lunch/dinner).
2. Reads both list pages (48 + 15 restaurants).
3. Visits each detail page with Playwright for hours, coordinates, and distinction.
4. Writes structured JSON to `data/montreal_michelin.json` and `web/public/montreal_michelin.json`.

## Web app

- **Map tab** — colored pins by Michelin distinction, scrollable restaurant cards, detail drawer.
- **List tab** — scannable card grid.
- **Filters** — collapsible groups: distinction, price, cuisine, good for, dietary, availability, services.

```bash
cd web
npm run dev      # development
npm run build    # production build in web/dist
```

## Deploy on Vercel

Import the repo and use the root `vercel.json` (builds from `web/`). Commit `web/public/montreal_michelin.json` so deploys do not require running the scraper.

## Data fields

| Field | Description |
|-------|-------------|
| `distinction` | `three_stars`, `two_stars`, `one_star`, `bib_gourmand`, or `selected` |
| `good_for` | Tags such as `solo_dining`, `groups`, `farm_to_table` |
| `special_diets` | `vegan_options`, `vegetarian_options`, `halal_options`, `kosher_options` |
| `services` | `wheelchair_access`, `terrace`, `brunch` |
| `open_days` | Days the restaurant is open per Michelin filters |
| `hours` | Per-day slots with lunch/dinner ranges when listed |
| `in_montreal_city` | `false` for outer suburbs (e.g. Boisbriand) |

Data is for personal trip planning. [MICHELIN Guide](https://guide.michelin.com/) is the source of truth.
