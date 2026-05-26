from __future__ import annotations

import json
import re
from typing import Any

from bs4 import BeautifulSoup

from scraper.fetch import absolute_michelin_url
from scraper.models import DayHours, Distinction, ListEntry, Restaurant

STAR_ICON = "michelin-star_8519"
BIB_ICON = "symboleBibendum"
GREEN_ICON = "gastronomie-durable"

GOOD_FOR_MAP = {
    "family friendly": "family_friendly",
    "groups": "groups",
    "solo dining": "solo_dining",
    "out with friends": "out_with_friends",
    "out with the family": "out_with_the_family",
    "out with friends or family": "out_with_friends_or_family",
    "date night": "date_night",
    "business": "business",
    "quick bite": "quick_bite",
}


def parse_detail_page(html: str, entry: ListEntry) -> Restaurant:
    soup = BeautifulSoup(html, "lxml")
    ld = _extract_json_ld(soup)
    details = soup.select_one(".restaurant-details")

    name = ld.get("name") if ld else entry.name
    address = _format_address(ld) if ld else None
    city = _city_from_ld(ld) if ld else None
    phone = ld.get("telephone") if ld else None
    cuisine = ld.get("servesCuisine") if ld else entry.cuisine
    lat = _to_float(ld.get("latitude")) if ld else entry.lat
    lng = _to_float(ld.get("longitude")) if ld else entry.lng

    price, price_level = _parse_price(entry, ld, details, soup)
    distinction, star_count, is_bib, is_green = _parse_distinction(
        entry, ld, details, soup
    )
    good_for = _parse_good_for(details)
    hours = _parse_hours(soup)
    website = _parse_website(details, soup)
    booking_url, online_booking = _parse_booking(details, ld)
    description = _parse_description(ld, details, soup)

    michelin_url = absolute_michelin_url(entry.michelin_path)
    in_montreal = _is_montreal_city(city, address)

    return Restaurant(
        id=entry.id,
        name=name or entry.name,
        distinction=distinction,
        star_count=star_count,
        is_bib_gourmand=is_bib,
        is_green_star=is_green,
        price=price,
        price_level=price_level,
        cuisine=cuisine,
        address=address,
        city=city,
        in_montreal_city=in_montreal,
        lat=lat,
        lng=lng,
        good_for=good_for,
        hours=hours,
        phone=phone,
        website=website,
        michelin_url=michelin_url,
        booking_url=booking_url,
        online_booking=online_booking,
        description_short=description,
    )


def _extract_json_ld(soup: BeautifulSoup) -> dict[str, Any]:
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict) and data.get("@type") == "Restaurant":
            return data
    return {}


def _format_address(ld: dict[str, Any]) -> str | None:
    address = ld.get("address")
    if isinstance(address, str):
        return address
    if not isinstance(address, dict):
        return None
    parts = [
        address.get("streetAddress"),
        address.get("addressLocality"),
        address.get("postalCode"),
        address.get("addressCountry"),
    ]
    return ", ".join(p for p in parts if p)


def _city_from_ld(ld: dict[str, Any]) -> str | None:
    address = ld.get("address")
    if isinstance(address, dict):
        return address.get("addressLocality")
    return None


def _to_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _parse_price(
    entry: ListEntry,
    ld: dict[str, Any],
    details: Any,
    soup: BeautifulSoup,
) -> tuple[str | None, int]:
    text = ""
    if details:
        for li in details.select(".restaurant-details__heading--list li"):
            text = li.get_text(" ", strip=True)
            if "$" in text:
                break
    if not text:
        text = soup.get_text(" ", strip=True)

    match = re.search(r"(\$+)", text)
    if match:
        price = match.group(1)
        return price, len(price)

    if entry.price:
        return entry.price, len(entry.price)

    return None, 0


def _parse_distinction(
    entry: ListEntry,
    ld: dict[str, Any],
    details: Any,
    soup: BeautifulSoup,
) -> tuple[Distinction, int, bool, bool]:
    is_green = _has_green_star(details, soup)
    star_count = 0
    is_bib = False

    award = ld.get("award")
    if isinstance(award, dict):
        award_for = (award.get("awardFor") or "").lower()
        if "bib gourmand" in award_for:
            is_bib = True
        star_count = _star_count_from_text(award_for)

    if star_count == 0 and not is_bib:
        star_count = _count_star_icons(details)
        is_bib = _has_bib_icon(details)

    if star_count == 0 and not is_bib:
        star_count, is_bib = _distinction_from_hints(entry)

    if star_count >= 3:
        return Distinction.THREE_STARS, 3, is_bib, is_green
    if star_count == 2:
        return Distinction.TWO_STARS, 2, is_bib, is_green
    if star_count == 1:
        return Distinction.ONE_STAR, 1, is_bib, is_green
    if is_bib:
        return Distinction.BIB_GOURMAND, 0, True, is_green
    return Distinction.SELECTED, 0, False, is_green


def _star_count_from_text(text: str) -> int:
    match = re.search(r"(\d)\s*michelin\s*star", text)
    if match:
        return int(match.group(1))
    if "three stars" in text or "3 stars" in text:
        return 3
    if "two stars" in text or "2 stars" in text:
        return 2
    if "one star" in text or "1 star" in text:
        return 1
    return 0


def _count_star_icons(details: Any) -> int:
    if not details:
        return 0
    count = 0
    for img in details.select(".distinction-icon img, .card__menu-content--distinction img"):
        src = (img.get("src") or "").lower()
        if STAR_ICON in src:
            count += 1
    return count


def _has_bib_icon(details: Any) -> bool:
    if not details:
        return False
    for img in details.select(".distinction-icon img, .card__menu-content--distinction img"):
        src = (img.get("src") or "").lower()
        if BIB_ICON in src:
            return True
    return False


def _has_green_star(details: Any, soup: BeautifulSoup) -> bool:
    scope = details or soup
    for img in scope.select("img"):
        src = (img.get("src") or "").lower()
        if GREEN_ICON in src:
            return True
    return False


def _distinction_from_hints(entry: ListEntry) -> tuple[int, bool]:
    pin = (entry.map_pin_name or "").upper()
    if pin == "BIB_GOURMAND":
        return 0, True
    if pin.startswith("ONE_STAR") or pin == "1_STAR":
        return 1, False
    if pin.startswith("TWO_STAR") or pin == "2_STAR":
        return 2, False
    if pin.startswith("THREE_STAR") or pin == "3_STAR":
        return 3, False

    hint = (entry.distinction_hint or "").lower()
    if hint == "bib":
        return 0, True
    if "3 star" in hint:
        return 3, False
    if "2 star" in hint:
        return 2, False
    if "1 star" in hint:
        return 1, False
    return 0, False


def _parse_good_for(details: Any) -> list[str]:
    if not details:
        return []
    tags: list[str] = []
    for pill in details.select(".tag--pills"):
        label = pill.get_text(strip=True).lower()
        mapped = GOOD_FOR_MAP.get(label)
        if mapped and mapped not in tags:
            tags.append(mapped)
    return tags


def _parse_hours(soup: BeautifulSoup) -> list[DayHours]:
    hours: list[DayHours] = []
    location_header = soup.find(
        lambda tag: tag.name in ("h2", "h3")
        and tag.get_text(strip=True).lower() == "location"
    )
    if not location_header:
        return hours

    container = location_header
    for _ in range(12):
        if container is None:
            break
        blocks = container.select(".card-borderline")
        if blocks:
            break
        container = container.parent

    if not container:
        return hours

    for block in container.select(".card-borderline"):
        day_el = block.select_one(".card--title")
        time_el = block.select_one(".card--content")
        if not day_el:
            continue
        day = day_el.get_text(strip=True).lower()
        raw = time_el.get_text(strip=True) if time_el else ""
        if not raw or raw.lower() == "closed":
            hours.append(DayHours(day=day, closed=True))
            continue
        open_time, close_time = _split_hours(raw)
        hours.append(DayHours(day=day, open=open_time, close=close_time))
    return hours


def _split_hours(raw: str) -> tuple[str | None, str | None]:
    parts = re.split(r"\s*[-–]\s*", raw.strip())
    if len(parts) != 2:
        return raw, None
    return _to_24h(parts[0]), _to_24h(parts[1])


def _to_24h(value: str) -> str:
    value = value.strip()
    match = re.match(
        r"(\d{1,2})(?::(\d{2}))?\s*(AM|PM)",
        value,
        re.IGNORECASE,
    )
    if not match:
        return value
    hour = int(match.group(1))
    minute = int(match.group(2) or 0)
    meridiem = match.group(3).upper()
    if meridiem == "PM" and hour != 12:
        hour += 12
    if meridiem == "AM" and hour == 12:
        hour = 0
    return f"{hour:02d}:{minute:02d}"


def _parse_website(details: Any, soup: BeautifulSoup) -> str | None:
    scope = details or soup
    for link in scope.find_all("a", href=True):
        href = link["href"]
        text = link.get_text(strip=True).lower()
        if not href.startswith("http"):
            continue
        if "michelin.com" in href or "opentable" in href:
            continue
        if "facebook" in href or "instagram" in href or "twitter" in href:
            continue
        if "visit website" in text or "website" in text:
            return href
    return None


def _parse_booking(details: Any, ld: dict[str, Any]) -> tuple[str | None, bool]:
    online = str(ld.get("acceptsReservations", "")).lower() in {"yes", "true"}
    booking_url = None
    if details:
        for link in details.find_all("a", href=True):
            href = link["href"]
            text = link.get_text(strip=True).lower()
            if "opentable" in href or "resy.com" in href or "sevenrooms" in href:
                booking_url = href
                online = True
                break
            if text in {"book", "reserve a table"} and href.startswith("http"):
                booking_url = href
                online = True
                break
    return booking_url, online


def _parse_description(ld: dict[str, Any], details: Any, soup: BeautifulSoup) -> str | None:
    review = ld.get("review")
    if isinstance(review, dict):
        desc = review.get("description")
        if desc:
            return _truncate(str(desc))

    if details:
        for selector in (
            ".restaurant-details__description--text",
            ".restaurant-details__description",
            ".data-sheet__block--text",
        ):
            el = details.select_one(selector)
            if el:
                return _truncate(el.get_text(" ", strip=True))

    for node in soup.find_all(string=re.compile(r"Michelin Inspector", re.I)):
        parent = node.find_parent(["p", "div"])
        if parent:
            text = parent.get_text(" ", strip=True)
            if len(text) > 80:
                return _truncate(text)
    return None


def _truncate(text: str, limit: int = 220) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def _is_montreal_city(city: str | None, address: str | None) -> bool:
    blob = f"{city or ''} {address or ''}".lower()
    suburbs = ("boisbriand", "laval", "brossard", "longueuil")
    if any(suburb in blob for suburb in suburbs):
        return False
    return "montréal" in blob or "montreal" in blob or bool(blob.strip())
