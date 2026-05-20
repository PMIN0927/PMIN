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
  const now = Date.now();
  const place: Place = {
    id: `custom-${now}`,
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
    openingHours: input.openingHours.trim() || "방문 전 확인 필요",
    holiday: "방문 전 확인 필요",
    weeklyHours: {
      월: input.openingHours.trim() || "방문 전 확인 필요",
      화: input.openingHours.trim() || "방문 전 확인 필요",
      수: input.openingHours.trim() || "방문 전 확인 필요",
      목: input.openingHours.trim() || "방문 전 확인 필요",
      금: input.openingHours.trim() || "방문 전 확인 필요",
      토: input.openingHours.trim() || "방문 전 확인 필요",
      일: input.openingHours.trim() || "방문 전 확인 필요"
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
