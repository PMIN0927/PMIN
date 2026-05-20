import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "data", "places.json");

const rules = [
  [/라멘|우동|탄탄|마제|소바|카츠|돈까스/, ["일식", "라멘", "캐주얼", "저예산"], ["무난한코스", "시험후위로"], ["캐주얼", "활기찬", "편한"], ["조용한화해주의"], "10000~17000", "저예산"],
  [/초밥|스시|규카츠|다이닝|참치|오마카세/, ["일식", "깔끔함", "데이트식사"], ["소개팅", "기분전환"], ["깔끔함", "깔끔한", "감성", "감성적인", "차분함"], ["비쌈주의"], "18000~35000", "보통"],
  [/파스타|피자|스테이크|양식|브런치|와인/, ["양식", "감성", "데이트식사"], ["소개팅", "화해", "기분전환"], ["감성", "감성적인", "깔끔함", "깔끔한", "로맨틱한"], [], "16000~30000", "보통"],
  [/국밥|칼국수|밀면|분식|순두부|죽|백반/, ["한식", "가성비", "든든함"], ["돈없는날", "시험후위로"], ["편한", "가성비", "캐주얼"], [], "8000~14000", "저예산"],
  [/고기|곱창|막창|닭갈비|양꼬치|훠궈|조개|구이/, ["고기", "술안주", "활기찬"], ["기분전환", "술데이트"], ["활기찬", "캐주얼", "편한"], ["조용한화해주의", "소음주의"], "18000~35000", "보통"],
  [/이자카야|야키토리|오뎅|꼬치|술집|포차|하이볼|맥주|바|주점|호르몬/, ["술", "안주", "2차"], ["술데이트", "기분전환", "밤데이트"], ["활기찬", "감성술집", "감성적인", "힙한", "로맨틱한", "야간데이트"], ["조용한화해주의", "소음주의"], "20000~35000", "보통"],
  [/카페|커피|디저트|베이커리|빙수|찻집/, ["카페", "디저트", "대화"], ["화해", "시험후위로", "조용한대화"], ["감성", "감성적인", "조용함", "조용한", "편한", "아늑한", "실내 위주"], [], "6000~12000", "저예산"],
  [/포토|사진관|스튜디오|인생네컷|셀프사진|필름/, ["사진", "포토부스", "추억"], ["중간경유지", "분위기전환", "화해보조"], ["활동형", "가벼움", "사진 찍기 좋은", "실내 위주"], [], "4000~15000", "저예산"],
  [/방탈출|보드게임|오락실|인형뽑기|가챠|소품|타로|사주/, ["활동형", "중간경유지", "짧은체류"], ["중간경유지", "분위기전환", "기분전환"], ["재미", "활동형", "캐주얼", "실내 위주", "활기찬"], [], "5000~22000", "보통"]
];

function unique(values) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
}

function estimateCouple(price) {
  const numbers = String(price).match(/\d+/g)?.map(Number) || [];
  if (numbers.length >= 2) return `${numbers[0] * 2}~${numbers[1] * 2}`;
  if (numbers.length === 1) return `${numbers[0] * 2}`;
  return "확인필요";
}

const places = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
const enriched = places.map((place) => {
  const text = [place.name, place.role, place.category, place.detailCategory, place.description, place.menu1, place.menu2, place.menu3].join(" ");
  let core = [];
  let situation = [];
  let mood = [];
  let avoid = [];
  let price = place.estimatedPricePerPerson || "확인필요";
  let tier = place.priceTier || "확인필요";

  for (const [pattern, addCore, addSituation, addMood, addAvoid, addPrice, addTier] of rules) {
    if (!pattern.test(text)) continue;
    core = [...core, ...addCore];
    situation = [...situation, ...addSituation];
    mood = [...mood, ...addMood];
    avoid = [...avoid, ...addAvoid];
    if (price === "확인필요") price = addPrice;
    if (tier === "확인필요") tier = addTier;
  }

  return {
    ...place,
    coreKeywords: unique([...(place.coreKeywords || []), ...core, place.category, place.detailCategory]),
    situationKeywords: unique([...(place.situationKeywords || []), ...situation]),
    moodKeywords: unique([...(place.moodKeywords || []), ...mood]),
    avoidKeywords: unique([...(place.avoidKeywords || []), ...avoid]),
    searchKeywords: unique([...(place.searchKeywords || []), place.name, ...core]),
    estimatedPricePerPerson: price,
    estimatedPriceCouple: place.estimatedPriceCouple || estimateCouple(price),
    priceTier: tier,
    keywordSource: place.keywordSource || "db+rule_based",
    priceSource: place.priceSource || "category_keyword_estimate"
  };
});

fs.writeFileSync(inputPath, `${JSON.stringify(enriched, null, 2)}\n`, "utf-8");
console.log(`enriched ${enriched.length} places`);
