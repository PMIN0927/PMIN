import type { DayKey, Place } from "@/types/place";

const days: DayKey[] = ["일", "월", "화", "수", "목", "금", "토"];

export function todayKey(date = new Date()): DayKey {
  return days[date.getDay()];
}

export function isProbablyOpen(place: Place, date = new Date()) {
  const value = place.weeklyHours?.[todayKey(date)] || place.openingHours || "";
  if (!value || /확인|미정|정보없음|방문 전/.test(value)) {
    return { ok: true, badge: "방문 전 확인 필요" };
  }
  if (/휴무|정기휴무/.test(value)) {
    return { ok: false, badge: "오늘 휴무 가능" };
  }
  return { ok: true, badge: "" };
}
