import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import type { Place } from "../types/place";

const root = process.cwd();
const candidates = [
  path.join(root, "data", "final_db_with_coordinates.xlsx"),
  path.join(root, "data", "final_db_with_keywords.xlsx"),
  path.join(root, "data", "final_db_weekly_hours.xlsx")
];
const input = candidates.find((file) => fs.existsSync(file));
const output = path.join(root, "data", "places.json");

if (!input) {
  throw new Error("data 폴더에 final_db_with_coordinates.xlsx 또는 final_db_with_keywords.xlsx가 없습니다.");
}

const workbook = XLSX.readFile(input, { cellDates: false });
const sheetPriority = ["통합DB_검수본", "요일별_영업시간", "통합_DB", "전체", "전체_좌표추가"];
const sheetName = sheetPriority.find((name) => workbook.SheetNames.includes(name)) ?? workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], { defval: "" });

const pick = (row: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && String(value).trim()) return String(value).trim();
  }
  return "";
};

const splitKeywords = (value: string) =>
  value
    .split(/[,#/|·\s]+/g)
    .map((item) => item.trim())
    .filter(Boolean);

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const inferRole = (row: Record<string, unknown>) => {
  const role = pick(row, ["장소역할", "place_role", "역할"]);
  const text = Object.values(row).join(" ");
  if (role) {
    if (/(방탈출|보드게임|사주카페|타로|사진|스튜디오|오락|인형|가챠|소품)/.test(text)) return "중간경유지";
    return role;
  }
  if (/(방탈출|보드게임|사주카페|타로|사진|스튜디오|오락|인형|가챠|소품)/.test(text)) return "중간경유지";
  if (/(이자카야|술집|와인|하이볼|포차|맥주|야키토리|오뎅|바)/.test(text)) return "술";
  if (/(카페|커피|디저트|베이커리)/.test(text)) return "카페";
  return "식사";
};

const places: Place[] = rows.map((row, index) => {
  const name = pick(row, ["가게 이름", "장소명", "네이버_결과명", "kakao_place_name", "원본_장소명"]);
  const role = inferRole(row);
  const weeklyHours = {
    월: pick(row, ["월"]),
    화: pick(row, ["화"]),
    수: pick(row, ["수"]),
    목: pick(row, ["목"]),
    금: pick(row, ["금"]),
    토: pick(row, ["토"]),
    일: pick(row, ["일"])
  };
  return {
    id: pick(row, ["kakao_place_id", "id"]) || `${index + 1}-${name}`,
    name,
    role,
    category: pick(row, ["카테고리", "kakao_category_name", "세부카테고리"]),
    detailCategory: pick(row, ["세부카테고리", "kakao_category_name"]),
    description: pick(row, ["뭐하는 집인지", "main_product_or_service", "설명"]),
    menu1: pick(row, ["대표메뉴1", "대표서비스1"]),
    menu2: pick(row, ["대표메뉴2", "대표서비스2"]),
    menu3: pick(row, ["대표메뉴3", "대표서비스3"]),
    naverMapUrl: pick(row, ["네이버지도 링크", "naver_map_link", "네이버_link"]),
    kakaoMapUrl: pick(row, ["카카오지도 링크", "kakao_place_url"]),
    openingHours: pick(row, ["운영시간", "opening_hours"]),
    holiday: pick(row, ["휴무일", "holiday"]),
    weeklyHours,
    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
    coreKeywords: splitKeywords(pick(row, ["핵심키워드", "main_keywords", "검색용키워드"])),
    situationKeywords: splitKeywords(pick(row, ["추천상황키워드", "date_situation_tags"])),
    moodKeywords: splitKeywords(pick(row, ["분위기/이용키워드", "mood_tags"])),
    avoidKeywords: splitKeywords(pick(row, ["주의/제외키워드", "avoid_tags"])),
    searchKeywords: splitKeywords(pick(row, ["검색용키워드", "핵심키워드"]))
  };
});

fs.writeFileSync(output, JSON.stringify(places, null, 2), "utf-8");
console.log(`${places.length}개 장소를 ${output}로 변환했습니다. 입력 시트: ${sheetName}`);
