# Montreal Michelin Guide

Scrape all [Michelin-recommended Montreal restaurants](https://guide.michelin.com/ca/en/quebec/montreal_2433514/restaurants) and explore them in a local map + filterable list web app.

## Quick start

```bash
# 1. Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Playwright browsers (if not already present)
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers playwright install chromium

# 2. Scrape (~4 min for 63 restaurants)
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers python -m scraper.main

# 3. Copy data for the web app
cp data/montreal_michelin.json web/public/montreal_michelin.json

# 4. Run the web app
cd web && npm install && npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scraper

```bash
python -m scraper.main                  # full scrape → data/montreal_michelin.json
python -m scraper.main --limit 5        # smoke test
python -m scraper.main --refresh        # ignore cached HTML
python -m scraper.main --delay 2.0      # slower, more polite
```

The scraper:

1. Reads both list pages (48 + 15 restaurants).
2. Visits each detail page with Playwright (Michelin blocks plain HTTP on detail URLs).
3. Writes structured JSON with caching under `scraper/.cache/`.

Re-run before your trip to pick up guide updates.

## Web app

Filter by Michelin distinction, price, family-friendly, and groups. Click a card or map pin to see hours, links, and inspector notes.

```bash
cd web
npm run dev      # development
npm run build    # production build in web/dist
```

After re-scraping, copy the JSON into `web/public/` so the app picks up new data without rebuilding.

## Deploy on Vercel

The repo includes a root [`vercel.json`](vercel.json) that builds the app from `web/` (the Python scraper is not deployed).

1. Import [github.com/mikieallan/brainstation-prep](https://github.com/mikieallan/brainstation-prep).
2. Leave **Root Directory** empty (or set to `.`) — `vercel.json` handles the `web/` subfolder.
3. Framework preset: **Vite** (or let `vercel.json` override).

Alternatively, set **Root Directory** to `web` and use the default Vite build settings; you can remove root `vercel.json` if you prefer.

## Field glossary

| Field | Description |
|-------|-------------|
| `distinction` | `three_stars`, `two_stars`, `one_star`, `bib_gourmand`, or `selected` |
| `star_count` | 0–3 Michelin stars |
| `is_bib_gourmand` | Bib Gourmand (good quality, good value) |
| `is_green_star` | Green Star for sustainability |
| `price` / `price_level` | `$`–`$$$$` and numeric level 1–4 |
| `good_for` | Tags such as `family_friendly`, `groups`, `solo_dining` |
| `hours` | Per-day open/close in 24h format, or `closed: true` |
| `website` | Restaurant site when Michelin lists one |
| `michelin_url` | Official guide page |
| `booking_url` | OpenTable / Resy link when available |
| `in_montreal_city` | `false` for outer suburbs (e.g. Boisbriand) |

## Known data gaps

- **Website** — Often missing on Michelin; left as `null` (62/63 in the latest scrape had websites).
- **Hours** — Only shown when Michelin publishes them (~28/63 in the latest scrape).
- **Good for** — Only when Michelin tags the restaurant (family/groups filters apply to tagged venues only).

Data is for personal trip planning. Link back to the [Michelin Guide](https://guide.michelin.com/) as the source of truth.
