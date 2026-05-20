import type { DayKey, Place, TodayCondition } from "@/types/place";

const days: DayKey[] = ["일", "월", "화", "수", "목", "금", "토"];

export function todayKey(date = new Date()): DayKey {
  return days[date.getDay()];
}

export function isProbablyOpen(place: Place, today?: TodayCondition, date = new Date()) {
  const day = todayKey(date);
  const value = place.weeklyHours?.[day] || place.openingHours || "";
  const meetingTime = today?.meetingTime || "";

  if (!value || /확인|미정|정보없음|방문 전|검수필요/.test(value)) {
    return { ok: true, badge: "방문 전 확인 필요" };
  }

  if (/휴무|정기휴무|쉬는날/.test(value)) {
    return { ok: false, badge: "선택한 요일 휴무" };
  }

  if (/24시간|00:00~24:00|00:00-24:00/.test(value)) {
    return { ok: true, badge: "" };
  }

  if (!meetingTime) {
    return { ok: true, badge: "" };
  }

  const selected = parseTimeToMinutes(meetingTime);
  if (selected === null) return { ok: true, badge: "운영시간 확인 필요" };

  const ranges = parseOpeningRanges(value);
  if (ranges.length === 0) return { ok: true, badge: "운영시간 확인 필요" };

  const open = ranges.some(([start, end]) => isWithinRange(selected, start, end));
  return open ? { ok: true, badge: "" } : { ok: false, badge: `${meetingTime} 영업 전/종료` };
}

function parseOpeningRanges(value: string): Array<[number, number]> {
  const text = normalizeTimeText(value);
  const matches = Array.from(text.matchAll(/(\d{1,2})(?::(\d{2}))?\s*[~-]\s*(다음날\s*)?(\d{1,2})(?::(\d{2}))?/g));

  return matches
    .map((match) => {
      const start = toMinutes(Number(match[1]), Number(match[2] || 0));
      let end = toMinutes(Number(match[4]), Number(match[5] || 0));
      if (match[3] || end <= start) end += 24 * 60;
      return [start, end] as [number, number];
    })
    .filter(([start, end]) => Number.isFinite(start) && Number.isFinite(end));
}

function normalizeTimeText(value: string) {
  return String(value)
    .replace(/\s+/g, " ")
    .replace(/오전\s*(\d{1,2})/g, (_, hour) => `${hour}:00`)
    .replace(/오후\s*(\d{1,2})/g, (_, hour) => `${Number(hour) + 12}:00`)
    .replace(/(\d{1,2})시\s*(\d{1,2})?분?/g, (_, hour, minute) => `${hour}:${minute || "00"}`)
    .replace(/부터|까지/g, "")
    .replace(/[–—]/g, "~");
}

function parseTimeToMinutes(value: string) {
  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return toMinutes(Number(match[1]), Number(match[2]));
}

function toMinutes(hour: number, minute: number) {
  return hour * 60 + minute;
}

function isWithinRange(selected: number, start: number, end: number) {
  const candidates = [selected, selected + 24 * 60];
  return candidates.some((time) => time >= start && time <= end);
}
