import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Restaurant } from "../types";
import { pinColorForRestaurant } from "../utils/labels";
import { MapLegend } from "./MapLegend";

interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function FitBounds({ restaurants }: { restaurants: Restaurant[] }) {
  const map = useMap();

  const points = useMemo(
    () =>
      restaurants
        .filter((r) => r.lat != null && r.lng != null)
        .map((r) => [r.lat!, r.lng!] as [number, number]),
    [restaurants],
  );

  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [map, points]);

  return null;
}

function PanToSelected({
  restaurants,
  selectedId,
}: {
  restaurants: Restaurant[];
  selectedId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const restaurant = restaurants.find((r) => r.id === selectedId);
    if (restaurant?.lat != null && restaurant?.lng != null) {
      map.panTo([restaurant.lat, restaurant.lng], { animate: true });
    }
  }, [map, restaurants, selectedId]);

  return null;
}

function makePinIcon(color: string, selected: boolean) {
  const size = selected ? 28 : 22;
  const border = selected ? 3 : 2;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:${border}px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
  });
}

export function RestaurantMap({
  restaurants,
  selectedId,
  onSelect,
}: RestaurantMapProps) {
  const mappable = restaurants.filter(
    (r) => r.lat != null && r.lng != null,
  );

  const defaultCenter: [number, number] = [45.5017, -73.5673];

  return (
    <div className="relative h-full min-h-[480px] w-full overflow-hidden rounded-lg border border-michelin-border-light">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds restaurants={mappable} />
        <PanToSelected restaurants={mappable} selectedId={selectedId} />

        {mappable.map((restaurant) => {
          const selected = restaurant.id === selectedId;
          const color = pinColorForRestaurant(restaurant);
          return (
            <Marker
              key={restaurant.id}
              position={[restaurant.lat!, restaurant.lng!]}
              icon={makePinIcon(color, selected)}
              eventHandlers={{
                click: () => onSelect(restaurant.id),
              }}
            >
              <Popup>
                <strong>{restaurant.name}</strong>
                <br />
                {restaurant.price} · {restaurant.cuisine}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <MapLegend />

      {mappable.length < restaurants.length && (
        <p className="absolute bottom-3 left-3 z-[500] rounded bg-white/95 px-2 py-1 text-xs text-michelin-muted shadow-md backdrop-blur-sm">
          {restaurants.length - mappable.length} without map coordinates
        </p>
      )}
    </div>
  );
}
