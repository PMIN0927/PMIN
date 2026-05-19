export type DayKey = "월" | "화" | "수" | "목" | "금" | "토" | "일";

export type WeeklyHours = Record<DayKey, string>;

export type PlaceRole = "식사" | "카페" | "술" | "중간경유지" | "기타/검수필요" | string;

export type Place = {
  id: string;
  name: string;
  role: PlaceRole;
  category: string;
  detailCategory: string;
  description: string;
  menu1: string;
  menu2: string;
  menu3: string;
  naverMapUrl: string;
  kakaoMapUrl: string;
  openingHours: string;
  holiday: string;
  weeklyHours: WeeklyHours;
  latitude: number | null;
  longitude: number | null;
  coreKeywords: string[];
  situationKeywords: string[];
  moodKeywords: string[];
  avoidKeywords: string[];
  searchKeywords: string[];
};

export type UserPreference = {
  moods: string[];
  foods: string[];
  dislikes: string[];
  dateStyles: string[];
};

export type TodayCondition = {
  situationText: string;
  budget: string;
  transport: "걸어서요" | "대중교통을 이용해요" | "차량을 이용해요";
  meetingTime: string;
};

export type Course = {
  title: string;
  reason: string;
  mealPlace?: Place;
  cafePlace?: Place;
  barPlace?: Place;
  waypoints: Place[];
  totalDistance: number;
  estimatedTime: number;
};
