import places from "@/data/places.json";
import { enrichPlaces } from "./placeEnrichment";
import { applyRoleOverride, loadRoleOverrides } from "./roleOverrides";
import type { Place } from "@/types/place";

export function loadPlaces(): Place[] {
  const overrides = loadRoleOverrides();
  return enrichPlaces(places as Place[]).map((place) => applyRoleOverride(place, overrides));
}
