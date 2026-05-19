"use client";

import type { Place } from "@/types/place";

type Props = {
  place: Place;
  onSelect?: () => void;
  selected?: boolean;
  cta?: string;
  compact?: boolean;
};

export default function PlaceCard({ place, onSelect, selected, cta = "이걸로 할래요", compact = false }: Props) {
  const menus = [place.menu1, place.menu2, place.menu3].filter(Boolean);
  const mapUrl = place.naverMapUrl || place.kakaoMapUrl;
  const tags = [...(place.situationKeywords || []), ...(place.moodKeywords || [])].slice(0, 4);

  return (
    <article className={`rounded-[1.75rem] border bg-white ${compact ? "p-4 pl-12" : "p-5"} shadow-card ${selected ? "border-roseApp" : "border-rose-100"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-roseApp">{place.role || place.category || "데이트 장소"}</p>
          <h3 className={`${compact ? "text-lg" : "text-xl"} mt-1 font-black text-ink`}>{place.name}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-roseSoft px-3 py-1 text-xs font-bold text-rose-600">
          {place.latitude && place.longitude ? "지도 가능" : "좌표 없음"}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-600">{place.description || place.detailCategory || place.category || "방문 전 상세 정보를 확인해보세요."}</p>

      {!compact && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-2xl bg-zinc-50 p-3">
            <p className="font-bold text-zinc-400">1인 예상</p>
            <p className="mt-1 font-black text-ink">{place.estimatedPricePerPerson || "확인필요"}</p>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-3">
            <p className="font-bold text-zinc-400">커플 예상</p>
            <p className="mt-1 font-black text-ink">{place.estimatedPriceCouple || "확인필요"}</p>
          </div>
        </div>
      )}

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
        <p className="mt-4 rounded-2xl bg-roseSoft p-3 text-sm font-medium leading-6 text-rose-700">
          {tags.length > 0 ? `${tags.slice(0, 2).join(", ")} 상황에 잘 맞는 후보예요.` : "오늘 코스 후보로 잘 맞는 장소예요."}
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
