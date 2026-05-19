import type { Place } from "@/types/place";

type Enrichment = {
  coreKeywords: string[];
  situationKeywords: string[];
  moodKeywords: string[];
  avoidKeywords: string[];
  searchKeywords: string[];
  estimatedPricePerPerson: string;
  estimatedPriceCouple: string;
  priceTier: "저예산" | "보통" | "높음" | "확인필요";
  description?: string;
};

const keywordRules: Array<{
  test: RegExp;
  add: Partial<Enrichment>;
}> = [
  {
    test: /라멘|우동|탄탄|마제|소바|카츠|돈까스/,
    add: {
      coreKeywords: ["일식", "라멘", "캐주얼", "혼밥가능"],
      situationKeywords: ["무난한코스", "저예산", "시험후위로"],
      moodKeywords: ["캐주얼", "활기찬"],
      avoidKeywords: ["조용한화해주의"],
      estimatedPricePerPerson: "10000~17000",
      priceTier: "저예산"
    }
  },
  {
    test: /초밥|스시|규카츠|다이닝|참치|오마카세/,
    add: {
      coreKeywords: ["일식", "깔끔함", "데이트식사"],
      situationKeywords: ["소개팅", "무난한코스", "기분전환"],
      moodKeywords: ["깔끔함", "감성", "차분함"],
      avoidKeywords: ["비쌈주의"],
      estimatedPricePerPerson: "18000~35000",
      priceTier: "보통"
    }
  },
  {
    test: /파스타|피자|스테이크|양식|브런치|와인/,
    add: {
      coreKeywords: ["양식", "감성", "데이트식사"],
      situationKeywords: ["소개팅", "기분전환", "화해"],
      moodKeywords: ["감성", "깔끔함"],
      estimatedPricePerPerson: "16000~30000",
      priceTier: "보통"
    }
  },
  {
    test: /국밥|칼국수|밀면|분식|순두부|죽|백반/,
    add: {
      coreKeywords: ["한식", "가성비", "든든함"],
      situationKeywords: ["돈없는날", "시험후위로", "무난한코스"],
      moodKeywords: ["편한", "캐주얼"],
      estimatedPricePerPerson: "8000~14000",
      priceTier: "저예산"
    }
  },
  {
    test: /고기|곱창|막창|닭갈비|양꼬치|훠궈|조개|구이/,
    add: {
      coreKeywords: ["고기", "술안주", "활기찬"],
      situationKeywords: ["기분전환", "술데이트"],
      moodKeywords: ["활기찬", "캐주얼"],
      avoidKeywords: ["조용한화해주의", "소음주의", "웨이팅주의"],
      estimatedPricePerPerson: "18000~35000",
      priceTier: "보통"
    }
  },
  {
    test: /이자카야|야키토리|오뎅|꼬치|술집|포차|하이볼|맥주|바|주점|호르몬/,
    add: {
      coreKeywords: ["술", "안주", "2차"],
      situationKeywords: ["술데이트", "기분전환", "2차", "밤데이트"],
      moodKeywords: ["활기찬", "감성술집", "야간데이트"],
      avoidKeywords: ["조용한화해주의", "소음주의"],
      estimatedPricePerPerson: "20000~35000",
      priceTier: "보통"
    }
  },
  {
    test: /카페|커피|디저트|베이커리|빙수|찻집/,
    add: {
      coreKeywords: ["카페", "디저트", "대화"],
      situationKeywords: ["화해", "시험후위로", "조용한대화", "비오는날"],
      moodKeywords: ["감성", "조용함", "편한"],
      estimatedPricePerPerson: "6000~12000",
      priceTier: "저예산"
    }
  },
  {
    test: /포토|사진관|스튜디오|인생네컷|셀프사진|필름/,
    add: {
      coreKeywords: ["사진", "포토부스", "추억"],
      situationKeywords: ["중간경유지", "분위기전환", "초반커플", "화해보조"],
      moodKeywords: ["활동형", "가벼움"],
      estimatedPricePerPerson: "4000~15000",
      priceTier: "저예산"
    }
  },
  {
    test: /방탈출|보드게임|오락실|인형뽑기|가챠|소품|타로|사주/,
    add: {
      coreKeywords: ["활동형", "중간경유지", "짧은체류"],
      situationKeywords: ["중간경유지", "분위기전환", "기분전환", "어색함풀기"],
      moodKeywords: ["재미", "활동형", "캐주얼"],
      estimatedPricePerPerson: "5000~22000",
      priceTier: "보통"
    }
  }
];

export function enrichPlace(place: Place): Place {
  const text = [place.name, place.role, place.category, place.detailCategory, place.description, place.menu1, place.menu2, place.menu3]
    .filter(Boolean)
    .join(" ");
  const base: Enrichment = {
    coreKeywords: [],
    situationKeywords: [],
    moodKeywords: [],
    avoidKeywords: [],
    searchKeywords: [],
    estimatedPricePerPerson: "확인필요",
    estimatedPriceCouple: "확인필요",
    priceTier: "확인필요"
  };

  const merged = keywordRules.reduce((acc, rule) => {
    if (!rule.test.test(text)) return acc;
    return {
      coreKeywords: [...acc.coreKeywords, ...(rule.add.coreKeywords || [])],
      situationKeywords: [...acc.situationKeywords, ...(rule.add.situationKeywords || [])],
      moodKeywords: [...acc.moodKeywords, ...(rule.add.moodKeywords || [])],
      avoidKeywords: [...acc.avoidKeywords, ...(rule.add.avoidKeywords || [])],
      searchKeywords: [...acc.searchKeywords, ...(rule.add.searchKeywords || [])],
      estimatedPricePerPerson: rule.add.estimatedPricePerPerson || acc.estimatedPricePerPerson,
      estimatedPriceCouple: acc.estimatedPriceCouple,
      priceTier: rule.add.priceTier || acc.priceTier,
      description: rule.add.description || acc.description
    };
  }, base);

  const person = place.estimatedPricePerPerson || merged.estimatedPricePerPerson;
  const couple = place.estimatedPriceCouple || estimateCouplePrice(person);

  return {
    ...place,
    description: place.description || merged.description || place.detailCategory || place.category || "방문 전 상세 정보 확인 필요",
    coreKeywords: unique([...place.coreKeywords, ...merged.coreKeywords, place.category, place.detailCategory]),
    situationKeywords: unique([...place.situationKeywords, ...merged.situationKeywords]),
    moodKeywords: unique([...place.moodKeywords, ...merged.moodKeywords]),
    avoidKeywords: unique([...place.avoidKeywords, ...merged.avoidKeywords]),
    searchKeywords: unique([...place.searchKeywords, ...merged.searchKeywords, place.name]),
    estimatedPricePerPerson: person,
    estimatedPriceCouple: couple,
    priceTier: place.priceTier || merged.priceTier,
    keywordSource: place.keywordSource || "db+rule_based",
    priceSource: place.priceSource || "category_keyword_estimate"
  };
}

export function enrichPlaces(places: Place[]): Place[] {
  return places.map(enrichPlace);
}

function estimateCouplePrice(price: string) {
  const numbers = price.match(/\d+/g)?.map(Number) || [];
  if (numbers.length >= 2) return `${numbers[0] * 2}~${numbers[1] * 2}`;
  if (numbers.length === 1) return `${numbers[0] * 2}`;
  return "확인필요";
}

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
}
