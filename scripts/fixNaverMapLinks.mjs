import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const placesPath = path.join(root, "data", "places.json");
const places = JSON.parse(fs.readFileSync(placesPath, "utf-8"));

function makeNaverMapSearchUrl(place) {
  const query = `${place.name} 부산진구`;
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

let fixed = 0;
const nextPlaces = places.map((place) => {
  const url = String(place.naverMapUrl || "");
  const isBroken = !url || url.includes("...") || url.endsWith("%") || !url.includes("naver");
  if (!isBroken) return place;
  fixed += 1;
  return {
    ...place,
    naverMapUrl: makeNaverMapSearchUrl(place),
    naverLinkStatus: "검색링크재생성"
  };
});

fs.writeFileSync(placesPath, `${JSON.stringify(nextPlaces, null, 2)}\n`, "utf-8");
console.log(`fixed ${fixed} naver map links`);
