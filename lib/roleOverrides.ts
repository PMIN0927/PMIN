import type { PlaceRole } from "@/types/place";

export const roleOptions = ["식사", "술", "카페", "중간경유지"] as const;
export type EditableRole = (typeof roleOptions)[number];

const key = "placeRoleOverrides";

export function loadRoleOverrides(): Record<string, EditableRole> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

export function saveRoleOverride(placeId: string, role: EditableRole) {
  if (typeof window === "undefined") return;
  const overrides = loadRoleOverrides();
  overrides[placeId] = role;
  localStorage.setItem(key, JSON.stringify(overrides));
}

export function removeRoleOverride(placeId: string) {
  if (typeof window === "undefined") return;
  const overrides = loadRoleOverrides();
  delete overrides[placeId];
  localStorage.setItem(key, JSON.stringify(overrides));
}

export function applyRoleOverride<T extends { id: string; role: PlaceRole }>(place: T, overrides: Record<string, EditableRole>) {
  return overrides[place.id] ? { ...place, role: overrides[place.id], manualRole: overrides[place.id] } : place;
}
