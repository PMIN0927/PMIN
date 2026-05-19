"use client";

import type { Course, TodayCondition, UserPreference } from "@/types/place";

const keys = {
  onboardingComplete: "onboardingComplete",
  preference: "userPreference",
  today: "todayCondition",
  course: "recommendedCourse"
};

export const defaultPreference: UserPreference = {
  moods: ["편한"],
  foods: ["한식", "일식", "카페", "술집"],
  dislikes: [],
  dateStyles: ["맛집 가고 술 한잔"]
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
  return JSON.parse(localStorage.getItem(keys.preference) || JSON.stringify(defaultPreference));
}

export function saveTodayCondition(value: TodayCondition) {
  localStorage.setItem(keys.today, JSON.stringify(value));
}

export function loadTodayCondition(): TodayCondition {
  if (typeof window === "undefined") return defaultToday;
  return JSON.parse(localStorage.getItem(keys.today) || JSON.stringify(defaultToday));
}

export function saveCourse(value: Course) {
  localStorage.setItem(keys.course, JSON.stringify(value));
}

export function loadCourse(): Course | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(keys.course);
  return raw ? JSON.parse(raw) : null;
}
