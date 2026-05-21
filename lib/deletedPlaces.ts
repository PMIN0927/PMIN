import type { Place } from "@/types/place";

const key = "deletedPlaces";

export type DeletedPlace = {
  id: string;
  name: string;
  role: string;
};

export function loadDeletedPlaces(): DeletedPlace[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function loadDeletedPlaceIds() {
  return new Set(loadDeletedPlaces().map((place) => place.id));
}

export function hidePlace(place: Place) {
  if (typeof window === "undefined") return;
  const deleted = loadDeletedPlaces();
  if (deleted.some((item) => item.id === place.id)) return;
  localStorage.setItem(
    key,
    JSON.stringify([
      ...deleted,
      {
        id: place.id,
        name: place.name,
        role: String(place.role || "")
      }
    ])
  );
}

export function restorePlace(placeId: string) {
  if (typeof window === "undefined") return;
  const deleted = loadDeletedPlaces().filter((place) => place.id !== placeId);
  localStorage.setItem(key, JSON.stringify(deleted));
}
