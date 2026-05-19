import places from "@/data/places.json";
import type { Place } from "@/types/place";

export function loadPlaces(): Place[] {
  return places as Place[];
}
