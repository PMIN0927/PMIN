import type { Course, Place, TodayCondition, UserPreference } from "@/types/place";
import { nearby, totalDistanceKm } from "./distance";
import { parseSituationTags } from "./tagParser";
import { isProbablyOpen } from "./timeFilter";

export type CourseSelection = {
  meal?: Place;
  cafe?: Place;
  bar?: Place;
};

export function normalizeRole(role: string) {
  if (role.includes("중간")) return "중간경유지";
  if (role.includes("술")) return "술";
  if (role.includes("카페")) return "카페";
  if (role.includes("식")) return "식사";
  return role;
}

export function scorePlace(place: Place, role: string, preference: UserPreference, today: TodayCondition, blockedIds = new Set<string>()) {
  if (blockedIds.has(place.id)) return -999;
  if (normalizeRole(place.role) !== role) return -100;

  const situationTags = parseSituationTags(today.situationText);
  const searchable = [
    place.name,
    place.category,
    place.detailCategory,
    place.description,
    ...place.coreKeywords,
    ...place.situationKeywords,
    ...place.moodKeywords,
    ...place.searchKeywords
  ].join(" ");

  let score = 30;
  if (hasOverlap(place.situationKeywords, situationTags) || situationTags.some((tag) => searchable.includes(tag))) score += 25;
  if (hasOverlap([...place.coreKeywords, ...place.searchKeywords], [...preference.foods, ...preference.moods])) score += 20;
  if (hasOverlap(place.moodKeywords, preference.moods)) score += 15;
  if (hasOverlap(place.avoidKeywords, preference.dislikes)) score -= 40;
  if (!isProbablyOpen(place).ok) score -= 35;
  if (today.transport === "걸어서요" && (!place.latitude || !place.longitude)) score -= 8;
  if (preference.dislikes.includes("많이 걷기") && (!place.latitude || !place.longitude)) score -= 12;
  if (!preference.dateStyles.includes("사진 찍고 놀기") && /포토|사진|스튜디오|인생네컷/.test(searchable)) score -= 25;
  if (role === "카페" && /카페 싫|커피 싫/.test(today.situationText)) score -= 80;

  return score;
}

export function pickCandidates(
  places: Place[],
  role: "식사" | "카페" | "술" | "중간경유지",
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

export function recommendWaypoints(places: Place[], selection: CourseSelection) {
  const anchor = selection.cafe || selection.bar || selection.meal;
  const waypointPool = places.filter((place) => normalizeRole(place.role) === "중간경유지" && place.latitude && place.longitude);
  if (!anchor?.latitude || !anchor.longitude) return waypointPool.slice(0, 5);
  const near = nearby(anchor, waypointPool, 0, 800);
  return (near.length ? near : waypointPool).slice(0, 5);
}

export function makeCourseFromSelection(selection: CourseSelection, places: Place[], preference: UserPreference, today: TodayCondition): Course {
  const waypoints = recommendWaypoints(places, selection);
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
    estimatedTime: Math.max(60, Math.round(distance * 18 + coursePlaces.filter(Boolean).length * 35))
  };
}

export function makeAutoCourse(places: Place[], preference: UserPreference, today: TodayCondition): Course {
  const meal = pickCandidates(places, "식사", preference, today, new Set(), 1)[0];
  const blocked = new Set([meal?.id || ""]);
  const wantsDrink = /술|한잔|하이볼|맥주/.test(today.situationText) || preference.foods.includes("술집");
  const cafe = wantsDrink ? undefined : pickCandidates(places, "카페", preference, today, blocked, 1)[0];
  if (cafe) blocked.add(cafe.id);
  const bar = pickCandidates(places, "술", preference, today, blocked, 1)[0];
  return makeCourseFromSelection({ meal, cafe, bar }, places, preference, today);
}

function hasOverlap(a: string[], b: string[]) {
  return a.some((item) => b.some((target) => item.includes(target) || target.includes(item)));
}

function titleFromTags(tags: string[]) {
  if (tags.includes("화해")) return "조용히 풀어가는 화해 코스";
  if (tags.includes("활기찬")) return "활기차게 즐기는 서면/전포 데이트";
  if (tags.includes("실내데이트")) return "비 오는 날 실내 데이트 코스";
  if (tags.includes("저예산")) return "돈 아끼는 가성비 데이트 코스";
  return "오늘 기분에 맞춘 서면/전포 데이트";
}

function buildReason(selection: CourseSelection, tags: string[], preference: UserPreference) {
  const picked = [selection.meal?.name, selection.cafe?.name, selection.bar?.name].filter(Boolean).join(", ");
  const mood = [...tags, ...preference.moods].slice(0, 3).join(", ");
  return `${picked}을 중심으로 ${mood || "무난한"} 분위기에 맞춰 코스를 묶었어요. 중간경유지는 선택 장소 주변 800m 안쪽 후보를 우선 추천했어요.`;
}
