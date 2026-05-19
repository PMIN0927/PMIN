type Rule = {
  tags: string[];
  patterns: RegExp[];
};

const rules: Rule[] = [
  {
    tags: ["화해", "조용한대화", "저자극", "감성", "대화좋음"],
    patterns: [/화해|싸움|싸웠|다툼|풀고|미안|어색|서운/]
  },
  {
    tags: ["시험후위로", "휴식", "저에너지", "조용함", "디저트"],
    patterns: [/시험|과제|망함|지침|피곤|힘들|위로|쉬고|휴식/]
  },
  {
    tags: ["활기찬", "기분전환", "활동형", "재미"],
    patterns: [/활기|신나|재밌|놀고|기분전환|스트레스|텐션|웃긴/]
  },
  {
    tags: ["돈없는날", "저예산", "가성비"],
    patterns: [/돈|가성비|저렴|싸게|아끼|부담|학생|만원|2만원|이만원/]
  },
  {
    tags: ["실내데이트", "비오는날", "덜걷기"],
    patterns: [/비|비옴|눈|춥|추움|더움|덥|실내|날씨|우산/]
  },
  {
    tags: ["술데이트", "2차", "하이볼", "맥주", "밤데이트"],
    patterns: [/술|한잔|하이볼|맥주|소주|와인|칵테일|이자카야|2차|밤/]
  },
  {
    tags: ["조용한대화", "대화좋음", "조용함"],
    patterns: [/조용|대화|얘기|차분|편하게|진지/]
  },
  {
    tags: ["사진", "중간경유지", "분위기전환", "초반커플"],
    patterns: [/사진|포토|인생네컷|셀프사진|찍고|추억/]
  },
  {
    tags: ["무난한코스", "첫데이트", "깔끔함"],
    patterns: [/그냥|모르겠|아무거나|추천|무난|처음|첫데이트/]
  }
];

export function parseSituationTags(text: string): string[] {
  const value = (text || "").toLowerCase();
  const tags = new Set<string>();

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => pattern.test(value))) {
      rule.tags.forEach((tag) => tags.add(tag));
    }
  }

  if (tags.size === 0) tags.add("무난한코스");
  return Array.from(tags);
}

export function tokenizeUserText(text: string): string[] {
  const tags = parseSituationTags(text);
  const words = (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);

  return Array.from(new Set([...tags, ...words]));
}
