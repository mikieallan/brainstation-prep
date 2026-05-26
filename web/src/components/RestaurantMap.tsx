import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { Restaurant } from "../types";
import { DISTINCTION_COLORS, DISTINCTION_LABELS, MICHELIN } from "../utils/labels";

const MONTREAL_CENTER: [number, number] = [45.508, -73.574];

function pinIcon(restaurant: Restaurant) {
  const color = DISTINCTION_COLORS[restaurant.distinction];
  const label =
    restaurant.star_count > 0
      ? `${restaurant.star_count}★`
      : restaurant.is_bib_gourmand
        ? "B"
        : "•";

  return L.divIcon({
    className: "custom-pin",
    html: `<div style="background:${color};color:white;border:2px solid white;border-radius:9999px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.22);font-family:Figtree,sans-serif">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapFocus({ selected }: { selected: Restaurant | null }) {
  const map = useMap();

  useEffect(() => {
    if (selected?.lat != null && selected.lng != null) {
      map.flyTo([selected.lat, selected.lng], 14, { duration: 0.6 });
    }
  }, [map, selected]);

  return null;
}

interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function RestaurantMap({
  restaurants,
  selectedId,
  onSelect,
}: RestaurantMapProps) {
  const mappable = restaurants.filter(
    (restaurant) => restaurant.lat != null && restaurant.lng != null,
  );
  const selected =
    mappable.find((restaurant) => restaurant.id === selectedId) ?? null;

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-lg border border-michelin-border-light bg-white shadow-sm">
      <MapContainer
        center={MONTREAL_CENTER}
        zoom={12}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocus selected={selected} />
        {mappable.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.lat!, restaurant.lng!]}
            icon={pinIcon(restaurant)}
            eventHandlers={{
              click: () => onSelect(restaurant.id),
            }}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <strong>{restaurant.name}</strong>
                <div>{DISTINCTION_LABELS[restaurant.distinction]}</div>
                <div>
                  {restaurant.price} · {restaurant.cuisine}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-michelin-border-light bg-white/95 p-3 text-xs text-michelin-gray shadow">
        <p className="mb-2 font-semibold uppercase tracking-wide text-michelin-black">
          Legend
        </p>
        <LegendRow color={MICHELIN.gold} label="Michelin stars" />
        <LegendRow color={MICHELIN.red} label="Bib Gourmand" />
        <LegendRow color={MICHELIN.gray} label="Selected" />
      </div>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <p className="mb-1 flex items-center gap-2">
      <span
        className="inline-block h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </p>
  );
}
