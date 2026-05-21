import places from "@/data/places.json";
import { loadCustomPlaces } from "./customPlaces";
import { loadDeletedPlaceIds } from "./deletedPlaces";
import { enrichPlaces } from "./placeEnrichment";
import { applyRoleOverride, loadRoleOverrides } from "./roleOverrides";
import type { Place } from "@/types/place";

export function loadPlaces(): Place[] {
  const overrides = loadRoleOverrides();
  const deletedIds = loadDeletedPlaceIds();
  return enrichPlaces([...(places as Place[]), ...loadCustomPlaces()])
    .filter((place) => !deletedIds.has(place.id))
    .map((place) => applyRoleOverride(place, overrides));
}
