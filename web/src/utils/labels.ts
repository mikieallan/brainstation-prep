import type { Distinction } from "../types";

/** Colors extracted from guide.michelin.com stylesheet */
export const MICHELIN = {
  red: "#BD2332",
  redDark: "#BA0B2F",
  redLight: "#FBE4E7",
  gold: "#BA8B00",
  black: "#191919",
  ink: "#222222",
  gray: "#4D4D4D",
  muted: "#888888",
  border: "#CCCCCC",
  borderLight: "#E0E0E0",
  surface: "#F6F6F6",
  green: "#00AB6C",
  white: "#FFFFFF",
} as const;

export const DISTINCTION_LABELS: Record<Distinction, string> = {
  three_stars: "3 Stars",
  two_stars: "2 Stars",
  one_star: "1 Star",
  bib_gourmand: "Bib Gourmand",
  selected: "Selected",
};

export const DISTINCTION_COLORS: Record<Distinction, string> = {
  three_stars: MICHELIN.gold,
  two_stars: MICHELIN.gold,
  one_star: MICHELIN.gold,
  bib_gourmand: MICHELIN.red,
  selected: MICHELIN.gray,
};

export const GOOD_FOR_LABELS: Record<string, string> = {
  family_friendly: "Family friendly",
  groups: "Groups",
  solo_dining: "Solo dining",
  out_with_friends: "Out with friends",
  date_night: "Date night",
  business: "Business",
  quick_bite: "Quick bite",
};

export function formatHours(
  hours: {
    day: string;
    open?: string | null;
    close?: string | null;
    closed?: boolean;
  }[],
): string {
  if (!hours.length) return "Hours not listed on Michelin";
  return hours
    .map((entry) => {
      const day = entry.day.slice(0, 3);
      if (entry.closed) return `${day}: closed`;
      if (entry.open && entry.close) return `${day}: ${entry.open}–${entry.close}`;
      return `${day}: —`;
    })
    .join(" · ");
}
