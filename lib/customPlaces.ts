import type { Place } from "@/types/place";
import type { EditableRole } from "./roleOverrides";

const key = "customPlaces";

export type CustomPlaceInput = {
  name: string;
  role: EditableRole;
  category: string;
  description: string;
  naverMapUrl: string;
  openingHours: string;
};

export function loadCustomPlaces(): Place[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function saveCustomPlace(input: CustomPlaceInput) {
  if (typeof window === "undefined") return;
  const places = loadCustomPlaces();
  const hours = input.openingHours.trim() || "방문 전 확인 필요";
  const place: Place = {
    id: `custom-${Date.now()}`,
    name: input.name.trim(),
    role: input.role,
    category: input.category.trim() || input.role,
    detailCategory: input.category.trim() || input.role,
    description: input.description.trim() || "직접 추가한 장소",
    menu1: "확인필요",
    menu2: "",
    menu3: "",
    naverMapUrl: input.naverMapUrl.trim(),
    kakaoMapUrl: "",
    openingHours: hours,
    holiday: "방문 전 확인 필요",
    weeklyHours: {
      월: hours,
      화: hours,
      수: hours,
      목: hours,
      금: hours,
      토: hours,
      일: hours
    },
    latitude: null,
    longitude: null,
    coreKeywords: [input.role, input.category].filter(Boolean),
    situationKeywords: [],
    moodKeywords: [],
    avoidKeywords: [],
    searchKeywords: [input.name, input.role, input.category].filter(Boolean),
    keywordSource: "manual_dev_mode"
  };

  localStorage.setItem(key, JSON.stringify([...places, place]));
}
