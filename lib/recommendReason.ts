import type { Place, TodayCondition, UserPreference } from "@/types/place";
import { parseSituationTags } from "./tagParser";

export function buildPlaceReason(place: Place, preference: UserPreference, today: TodayCondition) {
  const foodMatch = firstMatch(place, preference.foods);
  const moodMatch = firstMatch(place, preference.moods);
  const situationMatch = firstMatch(place, parseSituationTags(today.situationText));
  const priceText = place.priceTier === "저예산" ? "예산 부담이 적은 편이라" : place.priceTier === "보통" ? "가격대가 무난해서" : "";

  if (foodMatch && moodMatch) {
    return `${foodMatch} 취향과 ${moodMatch} 분위기가 같이 맞아서 먼저 보여드렸어요.`;
  }
  if (foodMatch) {
    return `선호 음식으로 고른 ${foodMatch} 계열과 가까워서 추천했어요.`;
  }
  if (situationMatch) {
    return `오늘 입력한 상황에서 나온 '${situationMatch}' 키워드와 잘 맞는 후보예요.`;
  }
  if (moodMatch) {
    return `처음에 고른 ${moodMatch} 분위기와 어울리는 장소예요.`;
  }
  if (priceText) {
    return `${priceText} 오늘 코스 후보로 넣었어요.`;
  }

  const tags = [...(place.situationKeywords || []), ...(place.moodKeywords || [])].filter(Boolean);
  if (tags.length > 0) return `${tags.slice(0, 2).join(", ")} 키워드가 잡혀서 코스 후보로 추천했어요.`;
  return "거리, 역할, 분위기 정보를 함께 보고 오늘 코스 후보로 골랐어요.";
}

function firstMatch(place: Place, targets: string[]) {
  const source = [
    place.name,
    place.role,
    place.category,
    place.detailCategory,
    place.description,
    place.menu1,
    place.menu2,
    place.menu3,
    ...(place.coreKeywords || []),
    ...(place.situationKeywords || []),
    ...(place.moodKeywords || []),
    ...(place.searchKeywords || [])
  ].join(" ");

  return targets.find((target) => {
    const value = String(target || "").trim();
    return value && (source.includes(value) || value.includes(place.category) || value.includes(place.detailCategory));
  });
}
