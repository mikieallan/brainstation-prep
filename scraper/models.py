from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field


class Distinction(str, Enum):
    THREE_STARS = "three_stars"
    TWO_STARS = "two_stars"
    ONE_STAR = "one_star"
    BIB_GOURMAND = "bib_gourmand"
    SELECTED = "selected"


class DayHours(BaseModel):
    day: str
    open: Optional[str] = None
    close: Optional[str] = None
    closed: bool = False


class ListEntry(BaseModel):
    id: str
    name: str
    michelin_path: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    price: Optional[str] = None
    cuisine: Optional[str] = None
    distinction_hint: Optional[str] = None
    map_pin_name: Optional[str] = None


class Restaurant(BaseModel):
    id: str
    name: str
    distinction: Distinction
    star_count: int = 0
    is_bib_gourmand: bool = False
    is_green_star: bool = False
    price: Optional[str] = None
    price_level: int = 0
    cuisine: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    in_montreal_city: bool = True
    lat: Optional[float] = None
    lng: Optional[float] = None
    good_for: list[str] = Field(default_factory=list)
    hours: list[DayHours] = Field(default_factory=list)
    phone: Optional[str] = None
    website: Optional[str] = None
    michelin_url: str
    booking_url: Optional[str] = None
    online_booking: bool = False
    description_short: Optional[str] = None
    scraped_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class ScrapeOutput(BaseModel):
    source_url: str
    restaurant_count: int
    scraped_at: str
    restaurants: list[Restaurant]
