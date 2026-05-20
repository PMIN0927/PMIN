import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const placesPath = path.join(root, "data", "places.json");
const places = JSON.parse(fs.readFileSync(placesPath, "utf-8"));

let fixed = 0;
const nextPlaces = places.map((place) => {
  const strongText = [place.category, place.detailCategory, place.description].join(" ");
  if (place.role === "식사" && (place.category === "술" || /술집|이자카야|주점|포차|와인바|오뎅바|야키토리/.test(strongText))) {
    fixed += 1;
    return {
      ...place,
      role: "술",
      roleFixStatus: "술집키워드로역할수정"
    };
  }
  return place;
});

fs.writeFileSync(placesPath, `${JSON.stringify(nextPlaces, null, 2)}\n`, "utf-8");
console.log(`fixed ${fixed} role mismatches`);
