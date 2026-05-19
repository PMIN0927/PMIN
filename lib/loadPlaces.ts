import places from "@/data/places.json";
import { enrichPlaces } from "./placeEnrichment";
import type { Place } from "@/types/place";

export function loadPlaces(): Place[] {
  return enrichPlaces(places as Place[]);
}
