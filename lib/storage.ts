"use client";

import type { Course, TodayCondition, UserPreference } from "@/types/place";

const keys = {
  onboardingComplete: "onboardingComplete",
  preference: "userPreference",
  today: "todayCondition",
  course: "recommendedCourse"
};

export const defaultPreference: UserPreference = {
  moods: ["편한", "깔끔한", "감성적인"],
  foods: ["한식", "일식", "샤브샤브"],
  dislikes: [],
  dateStyles: []
};

export const defaultToday: TodayCondition = {
  situationText: "그냥 추천받을래요",
  budget: "3만원",
  transport: "걸어서요",
  meetingTime: "18:00"
};

export function isOnboardingComplete() {
  return typeof window !== "undefined" && localStorage.getItem(keys.onboardingComplete) === "true";
}

export function completeOnboarding() {
  localStorage.setItem(keys.onboardingComplete, "true");
}

export function resetOnboarding() {
  localStorage.removeItem(keys.onboardingComplete);
  localStorage.removeItem(keys.preference);
  localStorage.removeItem(keys.today);
  localStorage.removeItem(keys.course);
}

export function savePreference(value: UserPreference) {
  localStorage.setItem(keys.preference, JSON.stringify(value));
}

export function loadPreference(): UserPreference {
  if (typeof window === "undefined") return defaultPreference;
  return safeJson(localStorage.getItem(keys.preference), defaultPreference);
}

export function saveTodayCondition(value: TodayCondition) {
  localStorage.setItem(keys.today, JSON.stringify(value));
}

export function loadTodayCondition(): TodayCondition {
  if (typeof window === "undefined") return defaultToday;
  return safeJson(localStorage.getItem(keys.today), defaultToday);
}

export function saveCourse(value: Course) {
  localStorage.setItem(keys.course, JSON.stringify(value));
}

export function loadCourse(): Course | null {
  if (typeof window === "undefined") return null;
  return safeJson(localStorage.getItem(keys.course), null);
}

function safeJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
