import type { Place } from "@/types/place";

export function distanceKm(a?: Place, b?: Place) {
  if (!a?.latitude || !a.longitude || !b?.latitude || !b.longitude) return 0;
  const radius = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function totalDistanceKm(places: Array<Place | undefined>) {
  const valid = places.filter(Boolean) as Place[];
  return valid.slice(1).reduce((sum, place, index) => sum + distanceKm(valid[index], place), 0);
}

export function nearby(origin: Place, places: Place[], minMeters = 0, maxMeters = 800) {
  return places.filter((place) => {
    const meters = distanceKm(origin, place) * 1000;
    return meters >= minMeters && meters <= maxMeters;
  });
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}
