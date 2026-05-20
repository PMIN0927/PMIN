import type { Course, Place, TodayCondition, UserPreference } from "@/types/place";
import { nearby, totalDistanceKm } from "./distance";
import { parseSituationTags, tokenizeUserText } from "./tagParser";
import { isProbablyOpen } from "./timeFilter";

export type CourseSelection = {
  meal?: Place;
  cafe?: Place;
  bar?: Place;
};

const roleAliases: Record<string, string[]> = {
  식사: ["식사", "음식", "한식", "일식", "양식", "중식", "밥집", "맛집"],
  카페: ["카페", "커피", "디저트"],
  술: ["술", "술집", "이자카야", "바", "주점", "포차"],
  중간경유지: ["중간경유지", "사진", "스튜디오", "포토", "오락", "방탈출", "보드게임", "타로", "소품"]
};

export function normalizeRole(role: string) {
  const value = role || "";
  if (roleAliases.중간경유지.some((word) => value.includes(word))) return "중간경유지";
  if (roleAliases.술.some((word) => value.includes(word))) return "술";
  if (roleAliases.카페.some((word) => value.includes(word))) return "카페";
  if (roleAliases.식사.some((word) => value.includes(word))) return "식사";
  return value;
}

export function scorePlace(place: Place, role: string, preference: UserPreference, today: TodayCondition, blockedIds = new Set<string>()) {
  if (blockedIds.has(place.id)) return -999;
  if (normalizeRole(place.role) !== role) return -100;
  if (!isProbablyOpen(place, today).ok) return -999;

  const userTokens = tokenizeUserText(today.situationText);
  const situationTags = parseSituationTags(today.situationText);
  const preferenceTokens = [...preference.foods, ...preference.moods, ...preference.dateStyles];
  const avoidTokens = [...preference.dislikes, ...avoidWordsFromText(today.situationText)];
  const allPlaceTokens = [
    place.name,
    place.role,
    place.category,
    place.detailCategory,
    place.description,
    place.menu1,
    place.menu2,
    place.menu3,
    place.priceTier,
    ...(place.coreKeywords || []),
    ...(place.situationKeywords || []),
    ...(place.moodKeywords || []),
    ...(place.avoidKeywords || []),
    ...(place.searchKeywords || [])
  ];
  const searchable = allPlaceTokens.join(" ").toLowerCase();

  let score = 30;
  score += overlapScore(place.situationKeywords || [], situationTags, 8, 32);
  score += overlapScore([...place.coreKeywords, ...place.searchKeywords], preferenceTokens, 5, 25);
  score += overlapScore(place.moodKeywords || [], [...preference.moods, ...userTokens], 5, 25);
  score += overlapScore(allPlaceTokens, userTokens, 3, 24);
  score -= overlapScore(place.avoidKeywords || [], avoidTokens, 12, 48);

  if (budgetMatches(today.budget, place)) score += 12;
  if (avoidTokens.includes("비싼 곳") && place.priceTier === "높음") score -= 35;
  if (avoidTokens.includes("웨이팅") && searchable.includes("웨이팅")) score -= 25;
  if (avoidTokens.includes("시끄러운 곳") && /활기찬|소음|고기|곱창|포차|술집/.test(searchable)) score -= 25;
  if (avoidTokens.includes("많이 걷기") && (!place.latitude || !place.longitude)) score -= 10;

  if (situationTags.includes("조용한대화") && /카페|다이닝|디저트|깔끔|조용/.test(searchable)) score += 15;
  if (situationTags.includes("술데이트") && role === "술") score += 20;
  if (situationTags.includes("실내데이트") && role === "중간경유지") score += 10;
  if (situationTags.includes("돈없는날") && place.priceTier === "저예산") score += 18;
  if (situationTags.includes("사진") && /포토|사진|스튜디오|인생네컷/.test(searchable)) score += 25;

  return score;
}

export function pickCandidates(
  places: Place[],
  role: "식사" | "카페" | "술" | "중간경유지" | string,
  preference: UserPreference,
  today: TodayCondition,
  blockedIds = new Set<string>(),
  count = 3
) {
  return places
    .map((place) => ({ place, score: scorePlace(place, role, preference, today, blockedIds) }))
    .filter((item) => item.score > -20)
    .sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name, "ko"))
    .slice(0, count)
    .map((item) => item.place);
}

export function recommendWaypoints(places: Place[], selection: CourseSelection, preference?: UserPreference, today?: TodayCondition) {
  const anchor = selection.cafe || selection.bar || selection.meal;
  const waypointPool = places
    .filter((place) => normalizeRole(place.role) === "중간경유지" && place.latitude && place.longitude && (!today || isProbablyOpen(place, today).ok))
    .map((place) => ({
      place,
      score: preference && today ? scorePlace(place, "중간경유지", preference, today) : 0
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.place);

  if (!anchor?.latitude || !anchor.longitude) return waypointPool.slice(0, 5);
  const near = nearby(anchor, waypointPool, 0, 800);
  return (near.length ? near : waypointPool).slice(0, 5);
}

export function makeCourseFromSelection(selection: CourseSelection, places: Place[], preference: UserPreference, today: TodayCondition): Course {
  const waypoints = recommendWaypoints(places, selection, preference, today);
  const coursePlaces = [selection.meal, selection.cafe, selection.bar, ...waypoints];
  const distance = totalDistanceKm(coursePlaces);
  const tags = parseSituationTags(today.situationText);

  return {
    title: titleFromTags(tags),
    reason: buildReason(selection, tags, preference),
    mealPlace: selection.meal,
    cafePlace: selection.cafe,
    barPlace: selection.bar,
    waypoints,
    totalDistance: distance,
    estimatedTime: Math.max(60, Math.round(distance * 18 + coursePlaces.filter(Boolean).length * 35)),
    extractedTags: tags
  };
}

export function makeAutoCourse(places: Place[], preference: UserPreference, today: TodayCondition): Course {
  const meal = pickCandidates(places, "식사", preference, today, new Set(), 1)[0];
  const blocked = new Set([meal?.id || ""]);
  const tags = parseSituationTags(today.situationText);
  const wantsDrink = tags.includes("술데이트") || /술|한잔|맥주|하이볼|와인/.test(today.situationText);
  const cafe = wantsDrink ? undefined : pickCandidates(places, "카페", preference, today, blocked, 1)[0];
  if (cafe) blocked.add(cafe.id);
  const bar = pickCandidates(places, "술", preference, today, blocked, 1)[0];
  return makeCourseFromSelection({ meal, cafe, bar }, places, preference, today);
}

function overlapScore(a: Array<string | undefined>, b: Array<string | undefined>, perMatch: number, max: number) {
  const matches = a.filter((item) => b.some((target) => fuzzyIncludes(item, target))).length;
  return Math.min(matches * perMatch, max);
}

function fuzzyIncludes(a?: string, b?: string) {
  const left = String(a || "").toLowerCase().trim();
  const right = String(b || "").toLowerCase().trim();
  if (!left || !right) return false;
  return left.includes(right) || right.includes(left);
}

function avoidWordsFromText(text: string) {
  const value = text || "";
  const words: string[] = [];
  if (/웨이팅|기다리/.test(value)) words.push("웨이팅");
  if (/시끄|소음|북적/.test(value)) words.push("시끄러운 곳");
  if (/비싸|부담|돈/.test(value)) words.push("비싼 곳");
  if (/걷기 싫|많이 걷|멀/.test(value)) words.push("많이 걷기");
  return words;
}

function budgetMatches(budget: string, place: Place) {
  if (!budget || budget.includes("제한")) return true;
  if (budget.includes("1만원")) return place.priceTier === "저예산";
  if (budget.includes("2만원")) return place.priceTier === "저예산" || place.priceTier === "보통";
  if (budget.includes("3만원")) return place.priceTier !== "높음";
  return true;
}

function titleFromTags(tags: string[]) {
  if (tags.includes("화해")) return "조용히 풀어가는 화해 코스";
  if (tags.includes("활기찬")) return "활기차게 즐기는 서면/전포 데이트";
  if (tags.includes("실내데이트")) return "비 오는 날에도 편한 실내 데이트";
  if (tags.includes("돈없는날")) return "부담 줄인 가성비 데이트 코스";
  if (tags.includes("술데이트")) return "맛있게 시작해서 한잔하는 코스";
  return "오늘 기분에 맞춘 서면/전포 데이트";
}

function buildReason(selection: CourseSelection, tags: string[], preference: UserPreference) {
  const picked = [selection.meal?.name, selection.cafe?.name, selection.bar?.name].filter(Boolean).join(", ");
  const mood = [...tags, ...preference.moods].slice(0, 4).join(", ");
  return `${picked || "선택한 장소"}를 중심으로 ${mood || "무난한"} 분위기에 맞춰 묶었어요. 선택한 시간에 운영 중인 장소만 우선 추천했어요.`;
}
