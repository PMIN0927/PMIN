export function parseSituationTags(text: string): string[] {
  const tags = new Set<string>();
  const value = text || "";

  if (/화해|싸움|다툼/.test(value)) ["화해", "조용한대화", "저자극"].forEach((tag) => tags.add(tag));
  if (/시험|망함|지침|피곤|힘들/.test(value)) ["시험후위로", "휴식", "저에너지"].forEach((tag) => tags.add(tag));
  if (/활기찬|신나는|재밌는|놀고/.test(value)) ["활기찬", "기분전환", "활동형"].forEach((tag) => tags.add(tag));
  if (/돈|가성비|저렴|아끼/.test(value)) ["돈없는날", "저예산"].forEach((tag) => tags.add(tag));
  if (/비|비옴|추움|더움|실내/.test(value)) tags.add("실내데이트");
  if (/술|한잔|하이볼|맥주/.test(value)) tags.add("술데이트");
  if (/조용히|대화|얘기/.test(value)) tags.add("조용한대화");
  if (/그냥|모르겠어|추천/.test(value) || tags.size === 0) tags.add("무난한코스");

  return Array.from(tags);
}
