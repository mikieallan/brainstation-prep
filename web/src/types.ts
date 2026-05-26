export type Distinction =
  | "three_stars"
  | "two_stars"
  | "one_star"
  | "bib_gourmand"
  | "selected";

export interface DayHours {
  day: string;
  open?: string | null;
  close?: string | null;
  closed?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  distinction: Distinction;
  star_count: number;
  is_bib_gourmand: boolean;
  is_green_star: boolean;
  price: string | null;
  price_level: number;
  cuisine: string | null;
  address: string | null;
  city: string | null;
  in_montreal_city: boolean;
  lat: number | null;
  lng: number | null;
  good_for: string[];
  hours: DayHours[];
  phone: string | null;
  website: string | null;
  michelin_url: string;
  booking_url: string | null;
  online_booking: boolean;
  description_short: string | null;
  scraped_at: string;
}

export interface ScrapeOutput {
  source_url: string;
  restaurant_count: number;
  scraped_at: string;
  restaurants: Restaurant[];
}

export interface Filters {
  search: string;
  distinctions: Distinction[];
  prices: number[];
  familyFriendly: boolean;
  groups: boolean;
  soloDining: boolean;
}
