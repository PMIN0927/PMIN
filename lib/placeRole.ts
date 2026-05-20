import type { Place } from "@/types/place";

export function getEffectiveRole(place: Place) {
  const role = String(place.role || "");
  const strongText = [place.category, place.detailCategory, place.description].join(" ");
  const allText = [role, strongText, place.name, ...(place.coreKeywords || [])].join(" ");

  if (/방탈출|보드게임|포토|사진관|스튜디오|인생네컷|오락실|인형뽑기|가챠|타로|사주|소품/.test(strongText)) {
    return "중간경유지";
  }

  if (/술집|이자카야|주점|포차|바|와인바|오뎅바|야키토리|호르몬/.test(strongText) || place.category === "술") {
    return "술";
  }

  if (/카페|커피|디저트|베이커리|빙수|찻집/.test(strongText) || role.includes("카페")) {
    return "카페";
  }

  if (role.includes("식사") || /식사|음식|한식|일식|양식|중식|밥집|맛집|초밥|스시|라멘|샤브|국밥|고기|곱창|파스타|피자/.test(allText)) {
    return "식사";
  }

  if (role.includes("술")) return "술";
  if (role.includes("중간경유지")) return "중간경유지";
  return role || "기타/검수필요";
}
