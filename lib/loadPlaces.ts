import places from "@/data/places.json";
import { loadCustomPlaces } from "./customPlaces";
import { enrichPlaces } from "./placeEnrichment";
import { applyRoleOverride, loadRoleOverrides } from "./roleOverrides";
import type { Place } from "@/types/place";

export function loadPlaces(): Place[] {
  const overrides = loadRoleOverrides();
  return enrichPlaces([...(places as Place[]), ...loadCustomPlaces()]).map((place) => applyRoleOverride(place, overrides));
}
