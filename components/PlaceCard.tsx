"use client";

import type { Place } from "@/types/place";
import { getEffectiveRole } from "@/lib/placeRole";

type Props = {
  place: Place;
  onSelect?: () => void;
  selected?: boolean;
  cta?: string;
  compact?: boolean;
  reason?: string;
};

export default function PlaceCard({ place, onSelect, selected, cta = "이걸로 할래요", compact = false, reason }: Props) {
  const menus = [place.menu1, place.menu2, place.menu3].filter(Boolean);
  const mapUrl = place.naverMapUrl || place.kakaoMapUrl;
  const tags = [...(place.situationKeywords || []), ...(place.moodKeywords || [])].slice(0, 4);
  const visual = getPlaceVisual(place);
  const displayRole = getEffectiveRole(place);

  return (
    <article className={`rounded-[1.75rem] border bg-white ${compact ? "p-4 pl-12" : "p-5"} shadow-card ${selected ? "border-roseApp" : "border-zinc-100"}`}>
      {!compact && (
        <div className={`mb-4 flex h-32 items-center justify-between overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${visual.gradient} px-5`}>
          <div>
            <p className="text-xs font-black text-white/75">{visual.label}</p>
            <p className="mt-2 max-w-[150px] text-lg font-black leading-tight text-white">{visual.copy}</p>
          </div>
          <div className="grid h-20 w-20 place-items-center rounded-[28px] bg-white/30 text-5xl shadow-card backdrop-blur">
            {visual.emoji}
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-roseApp">{displayRole || place.category || "데이트 장소"}</p>
          <h3 className={`${compact ? "text-lg" : "text-xl"} mt-1 font-black text-ink`}>{place.name}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-roseSoft px-3 py-1 text-xs font-bold text-rose-600">{place.latitude && place.longitude ? "지도 가능" : "좌표 없음"}</span>
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-600">{place.description || place.detailCategory || place.category || "방문 전 상세 정보를 확인해보세요."}</p>

      {menus.length > 0 && !compact && (
        <div className="mt-3 flex flex-wrap gap-2">
          {menus.map((menu) => (
            <span key={menu} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
              {menu}
            </span>
          ))}
        </div>
      )}

      {!compact && tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-roseSoft px-3 py-1 text-xs font-bold text-rose-700">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {!compact && (
        <div className="mt-4 space-y-1 text-xs text-zinc-500">
          <p>운영시간: {place.openingHours || "방문 전 확인 필요"}</p>
          <p>휴무일: {place.holiday || "방문 전 확인 필요"}</p>
        </div>
      )}

      {!compact && (
        <p className="mt-4 rounded-2xl bg-roseSoft p-3 text-sm font-bold leading-6 text-rose-700">
          {reason || "오늘 입력한 조건과 장소 키워드를 비교해서 추천한 후보예요."}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {mapUrl && (
          <a href={mapUrl} target="_blank" className="flex-1 rounded-2xl bg-zinc-100 px-4 py-3 text-center text-sm font-bold text-zinc-700">
            지도 보기
          </a>
        )}
        {onSelect && (
          <button onClick={onSelect} className="flex-1 rounded-2xl bg-roseApp px-4 py-3 text-sm font-bold text-white">
            {cta}
          </button>
        )}
      </div>
    </article>
  );
}

function getPlaceVisual(place: Place) {
  const role = getEffectiveRole(place);
  const text = [place.category, place.detailCategory, place.description, place.name, ...(place.coreKeywords || [])].join(" ");

  if (role === "술" || /술집|이자카야|바|포차|하이볼|맥주|와인|주점|야키토리|오뎅|꼬치/.test(text)) {
    return {
      emoji: "🍻",
      label: "DRINK",
      copy: "저녁 분위기를 이어가는 한 잔",
      gradient: "from-violet-400 to-fuchsia-400"
    };
  }

  if (role === "식사" || /샤브|국밥|한식|고기|곱창|라멘|우동|초밥|스시|파스타|피자|돈까스|돈카츠|쌀국수|중식|분식|낙지|칼국수|밀면|버거|치킨|훠궈|양꼬치|규카츠/.test(text)) {
    return {
      emoji: pickMealEmoji(text),
      label: "MEAL",
      copy: "데이트의 시작은 든든하게",
      gradient: "from-rose-300 to-orange-300"
    };
  }

  if (role === "카페" || /카페|커피|디저트|베이커리|빙수|찻집/.test(text)) {
    return {
      emoji: "☕",
      label: "CAFE",
      copy: "잠깐 쉬어가는 달달한 시간",
      gradient: "from-amber-300 to-rose-300"
    };
  }

  if (role === "중간경유지" || /사진|포토|스튜디오|방탈출|보드게임|오락실|인형뽑기|가챠|타로|소품/.test(text)) {
    return {
      emoji: "📸",
      label: "PLAY",
      copy: "중간에 들르면 좋은 가벼운 재미",
      gradient: "from-sky-300 to-violet-400"
    };
  }

  return {
    emoji: "💗",
    label: "DATE",
    copy: "오늘 코스에 어울리는 후보",
    gradient: "from-rose-300 to-pink-400"
  };
}

function pickMealEmoji(text: string) {
  if (/초밥|스시/.test(text)) return "🍣";
  if (/라멘|우동|소바|쌀국수|칼국수|밀면/.test(text)) return "🍜";
  if (/고기|곱창|막창|구이|규카츠/.test(text)) return "🥩";
  if (/파스타|피자|양식/.test(text)) return "🍝";
  if (/버거|치킨/.test(text)) return "🍔";
  if (/샤브|훠궈/.test(text)) return "🥘";
  if (/국밥|한식|순두부|백반/.test(text)) return "🍚";
  return "🍽️";
}
