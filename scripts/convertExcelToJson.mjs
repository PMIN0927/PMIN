import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const root = process.cwd();
const inputCandidates = [
  path.join(root, "data", "final_db_with_coordinates.xlsx"),
  path.join(root, "data", "final_db_with_keywords.xlsx"),
  path.join(root, "data", "final_db_weekly_hours.xlsx")
];
const outputPath = path.join(root, "data", "places.json");

const inputPath = inputCandidates.find((file) => fs.existsSync(file));
if (!inputPath) {
  throw new Error("data 폴더에 final_db_with_coordinates.xlsx 파일을 넣어주세요.");
}

const preferredSheets = ["전체_좌표추가", "통합DB_검수본", "통합DB_키워드추가", "요일별_영업시간", "통합_DB", "전체"];

const fieldAliases = {
  name: ["가게 이름", "가게이름", "장소명", "네이버_결과명", "네이버 결과명", "원본_장소명", "원본 장소명", "kakao_place_name", "place_name", "name", "상호명"],
  role: ["장소역할", "장소 역할", "place_role", "역할", "원본분류", "분류"],
  category: ["카테고리", "네이버카테고리", "네이버 카테고리", "kakao_category_name", "category", "category_name"],
  detailCategory: ["세부카테고리", "세부 카테고리", "상세카테고리", "상세 카테고리", "kakao_category_name"],
  description: ["뭐하는 집인지", "뭐하는집인지", "서비스내용", "서비스 내용", "main_product_or_service", "설명", "소개"],
  menu1: ["대표메뉴1", "대표 메뉴1", "대표메뉴/서비스1", "대표메뉴 서비스1", "대표서비스1", "메뉴1"],
  menu2: ["대표메뉴2", "대표 메뉴2", "대표메뉴/서비스2", "대표메뉴 서비스2", "대표서비스2", "메뉴2"],
  menu3: ["대표메뉴3", "대표 메뉴3", "대표메뉴/서비스3", "대표메뉴 서비스3", "대표서비스3", "메뉴3"],
  naverMapUrl: ["네이버지도 링크", "네이버 지도 링크", "네이버지도링크", "네이버_link", "naver_link", "naver_map_link", "네이버지도"],
  kakaoMapUrl: ["카카오지도 링크", "카카오 지도 링크", "카카오지도링크", "kakao_place_url", "kakaoMapUrl"],
  openingHours: ["운영시간", "영업시간", "opening_hours", "hours"],
  holiday: ["휴무일", "휴무", "holiday", "정기휴무"],
  latitude: ["latitude", "lat", "위도", "kakao_y", "y"],
  longitude: ["longitude", "lng", "lon", "경도", "kakao_x", "x"],
  coreKeywords: ["핵심키워드", "핵심 키워드", "main_keywords", "검색용키워드"],
  situationKeywords: ["추천상황키워드", "추천 상황 키워드", "date_situation_tags", "상황키워드"],
  moodKeywords: ["분위기/이용키워드", "분위기 키워드", "이용키워드", "mood_tags", "moodKeywords"],
  avoidKeywords: ["주의/제외키워드", "주의 키워드", "제외 키워드", "avoid_tags", "avoidKeywords"],
  searchKeywords: ["검색용키워드", "검색 키워드", "searchKeywords", "search_keywords", "핵심키워드"]
};

const dayAliases = {
  월: ["월", "월요일", "mon", "monday"],
  화: ["화", "화요일", "tue", "tuesday"],
  수: ["수", "수요일", "wed", "wednesday"],
  목: ["목", "목요일", "thu", "thursday"],
  금: ["금", "금요일", "fri", "friday"],
  토: ["토", "토요일", "sat", "saturday"],
  일: ["일", "일요일", "sun", "sunday"]
};

function normalizeHeader(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()[\]{}_\-./|:]/g, "")
    .trim();
}

function createHeaderLookup(row) {
  const entries = Object.keys(row).map((key) => ({ raw: key, normalized: normalizeHeader(key) }));
  return {
    fuzzy(aliases) {
      for (const alias of aliases) {
        if (Object.prototype.hasOwnProperty.call(row, alias) && String(row[alias]).trim() !== "") {
          return row[alias];
        }
      }

      const normalizedAliases = aliases.map(normalizeHeader);
      for (const alias of normalizedAliases) {
        const exact = entries.find((entry) => entry.normalized === alias);
        if (exact && String(row[exact.raw]).trim() !== "") return row[exact.raw];
      }

      for (const alias of normalizedAliases) {
        const partial = entries.find((entry) => entry.normalized.includes(alias) || alias.includes(entry.normalized));
        if (partial && String(row[partial.raw]).trim() !== "") return row[partial.raw];
      }

      return "";
    }
  };
}

function pick(row, aliases) {
  const value = createHeaderLookup(row).fuzzy(aliases);
  return value === undefined || value === null ? "" : String(value).trim();
}

function splitKeywords(value) {
  return String(value || "")
    .split(/[,#/|·\n\r\t]+/g)
    .flatMap((item) => item.split(/\s{2,}/g))
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value) {
  const cleaned = String(value ?? "").replace(/,/g, "").trim();
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function inferRole(row) {
  const existing = pick(row, fieldAliases.role);
  const text = Object.values(row).join(" ");

  if (includesAny(text, ["방탈출", "방탈출카페", "보드게임", "보드게임카페", "사주카페", "타로", "포토", "사진관", "스튜디오", "오락실", "인형뽑기", "가챠", "소품샵"])) {
    return "중간경유지";
  }

  if (existing) {
    if (existing.includes("술")) return "술";
    if (existing.includes("카페")) return "카페";
    if (existing.includes("중간")) return "중간경유지";
    if (existing.includes("식")) return "식사";
    return existing;
  }

  if (includesAny(text, ["이자카야", "술집", "와인", "하이볼", "포차", "맥주", "야키토리", "오뎅", "바", "주점"])) return "술";
  if (includesAny(text, ["카페", "커피", "디저트", "베이커리"])) return "카페";
  return "식사";
}

function chooseSheet(workbook) {
  const preferred = preferredSheets.find((name) => workbook.SheetNames.includes(name));
  if (preferred) return preferred;

  const aliases = Object.values(fieldAliases).flat().map(normalizeHeader);
  let bestName = workbook.SheetNames[0];
  let bestScore = -1;

  for (const name of workbook.SheetNames) {
    const preview = XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: "", header: 1 });
    const headers = (preview[0] ?? []).map(normalizeHeader);
    const score = headers.filter((header) => aliases.some((alias) => header === alias || header.includes(alias) || alias.includes(header))).length;
    if (score > bestScore) {
      bestScore = score;
      bestName = name;
    }
  }

  return bestName;
}

const workbook = XLSX.readFile(inputPath, { cellDates: false });
const sheetName = chooseSheet(workbook);
const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

const places = rawRows
  .map((row, index) => {
    const name = pick(row, fieldAliases.name);
    const weeklyHours = Object.fromEntries(Object.entries(dayAliases).map(([day, aliases]) => [day, pick(row, aliases)]));

    return {
      id: pick(row, ["id", "place_id", "kakao_place_id"]) || `${index + 1}-${name || "unknown"}`,
      name,
      role: inferRole(row),
      category: pick(row, fieldAliases.category),
      detailCategory: pick(row, fieldAliases.detailCategory),
      description: pick(row, fieldAliases.description),
      menu1: pick(row, fieldAliases.menu1),
      menu2: pick(row, fieldAliases.menu2),
      menu3: pick(row, fieldAliases.menu3),
      naverMapUrl: pick(row, fieldAliases.naverMapUrl),
      kakaoMapUrl: pick(row, fieldAliases.kakaoMapUrl),
      openingHours: pick(row, fieldAliases.openingHours),
      holiday: pick(row, fieldAliases.holiday),
      weeklyHours,
      latitude: toNumber(pick(row, fieldAliases.latitude)),
      longitude: toNumber(pick(row, fieldAliases.longitude)),
      coreKeywords: splitKeywords(pick(row, fieldAliases.coreKeywords)),
      situationKeywords: splitKeywords(pick(row, fieldAliases.situationKeywords)),
      moodKeywords: splitKeywords(pick(row, fieldAliases.moodKeywords)),
      avoidKeywords: splitKeywords(pick(row, fieldAliases.avoidKeywords)),
      searchKeywords: splitKeywords(pick(row, fieldAliases.searchKeywords))
    };
  })
  .filter((place) => place.name);

fs.writeFileSync(outputPath, JSON.stringify(places, null, 2), "utf-8");

const missingCoordinates = places.filter((place) => place.latitude === null || place.longitude === null).length;
const roleCounts = places.reduce((acc, place) => {
  acc[place.role] = (acc[place.role] ?? 0) + 1;
  return acc;
}, {});

console.log(`입력 파일: ${path.relative(root, inputPath)}`);
console.log(`입력 시트: ${sheetName}`);
console.log(`변환 장소 수: ${places.length}`);
console.log(`좌표 없는 장소 수: ${missingCoordinates}`);
console.log(`역할별 개수: ${JSON.stringify(roleCounts)}`);
console.log(`저장 완료: ${path.relative(root, outputPath)}`);
