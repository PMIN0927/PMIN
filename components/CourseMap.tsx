"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Course, Place } from "@/types/place";

declare global {
  interface Window {
    kakao?: any;
  }
}

type MapPlace = {
  place: Place;
  kind: "course" | "waypoint";
  order: number;
};

function hasCoordinate(place?: Place): place is Place {
  return typeof place?.latitude === "number" && typeof place?.longitude === "number";
}

function mapPlaces(course: Course): MapPlace[] {
  const coursePlaces = [course.mealPlace, course.cafePlace, course.barPlace]
    .filter(hasCoordinate)
    .map((place, index) => ({ place, kind: "course" as const, order: index + 1 }));
  const waypointPlaces = course.waypoints
    .filter(hasCoordinate)
    .map((place, index) => ({ place, kind: "waypoint" as const, order: coursePlaces.length + index + 1 }));
  return [...coursePlaces, ...waypointPlaces];
}

function markerHtml(item: MapPlace) {
  const isWaypoint = item.kind === "waypoint";
  const size = isWaypoint ? 24 : 36;
  const color = isWaypoint ? "#7c3aed" : "#ff5c8a";
  const label = isWaypoint ? "+" : String(item.order);
  return `
    <div style="
      width:${size}px;height:${size}px;border-radius:999px;background:${color};color:white;
      display:grid;place-items:center;font-size:${isWaypoint ? 12 : 15}px;font-weight:900;
      border:${isWaypoint ? 2 : 3}px solid white;box-shadow:0 8px 22px rgba(31,23,31,.18);
      cursor:pointer;
    ">${label}</div>
  `;
}

function labelHtml(item: MapPlace) {
  const safeName = item.place.name.replace(/[<>&]/g, "");
  return `
    <div style="
      transform:translateY(12px);background:white;border:1px solid #ffe4ec;border-radius:14px;
      padding:7px 10px;font-size:12px;font-weight:700;color:#2f2630;
      box-shadow:0 8px 24px rgba(31,23,31,.12);white-space:nowrap;
    ">
      ${item.kind === "waypoint" ? "경유지" : `${item.order}번`} · ${safeName}
    </div>
  `;
}

export default function CourseMap({ course }: { course: Course }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const boundsRef = useRef<any>(null);
  const centerRef = useRef<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const items = useMemo(() => mapPlaces(course), [course]);
  const courseItems = items.filter((item) => item.kind === "course");
  const visibleItems = expanded ? items : items.slice(0, 3);

  const relayoutMap = () => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;
    window.setTimeout(() => {
      map.relayout();
      if (boundsRef.current && items.length > 1) map.setBounds(boundsRef.current);
      else if (centerRef.current) map.setCenter(centerRef.current);
    }, 80);
  };

  useEffect(() => {
    relayoutMap();
  }, [expanded]);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(() => relayoutMap());
    observer.observe(ref.current);
    window.addEventListener("resize", relayoutMap);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", relayoutMap);
    };
  }, [items.length]);

  useEffect(() => {
    setIsLoaded(false);
    setErrorMessage("");
    mapRef.current = null;
    boundsRef.current = null;
    centerRef.current = null;

    if (!ref.current || items.length === 0) return;
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!key || key.includes("your_")) {
      setErrorMessage("NEXT_PUBLIC_KAKAO_JS_KEY에 카카오 JavaScript 키를 넣어주세요.");
      return;
    }

    let cancelled = false;
    const render = () => {
      if (!window.kakao?.maps || !ref.current || cancelled) {
        setErrorMessage("Kakao Maps SDK를 불러오지 못했어요.");
        return;
      }
      window.kakao.maps.load(() => {
        if (!ref.current || cancelled) return;
        const bounds = new window.kakao.maps.LatLngBounds();
        const first = items[0].place;
        const center = new window.kakao.maps.LatLng(first.latitude, first.longitude);
        const map = new window.kakao.maps.Map(ref.current, { center, level: 5 });

        mapRef.current = map;
        boundsRef.current = bounds;
        centerRef.current = center;

        items.forEach((item) => {
          const position = new window.kakao.maps.LatLng(item.place.latitude, item.place.longitude);
          bounds.extend(position);
          const marker = new window.kakao.maps.CustomOverlay({
            map,
            position,
            content: markerHtml(item),
            yAnchor: 0.5,
            xAnchor: 0.5,
            zIndex: item.kind === "course" ? 10 : 5
          });
          const label = new window.kakao.maps.CustomOverlay({
            position,
            content: labelHtml(item),
            yAnchor: 0,
            xAnchor: 0.5,
            zIndex: 20
          });

          window.kakao.maps.event.addListener(map, "click", () => label.setMap(null));
          const markerElement = marker.getContent();
          if (markerElement instanceof HTMLElement) {
            markerElement.addEventListener("click", () => label.setMap(map));
          }
        });

        const coursePath = courseItems.map((item) => new window.kakao.maps.LatLng(item.place.latitude, item.place.longitude));
        if (coursePath.length > 1) {
          new window.kakao.maps.Polyline({
            map,
            path: coursePath,
            strokeWeight: 5,
            strokeColor: "#ff5c8a",
            strokeOpacity: 0.9,
            strokeStyle: "solid"
          });
        }

        if (items.length > 1) map.setBounds(bounds);
        window.setTimeout(() => {
          if (cancelled) return;
          relayoutMap();
          setIsLoaded(true);
        }, 150);
      });
    };

    if (window.kakao?.maps) render();
    else {
      const existing = document.querySelector<HTMLScriptElement>("script[data-kakao-map-sdk='true']");
      if (existing) existing.addEventListener("load", render, { once: true });
      else {
        const script = document.createElement("script");
        script.dataset.kakaoMapSdk = "true";
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
        script.async = true;
        script.onerror = () => setErrorMessage("Kakao Maps SDK 로딩에 실패했어요. 카카오 JavaScript 키와 사이트 도메인을 확인해주세요.");
        script.onload = render;
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [items, courseItems]);

  if (items.length === 0 || errorMessage) {
    return (
      <div className="rounded-[1.75rem] bg-zinc-50 p-5 text-center text-sm text-zinc-500">
        <p className="font-bold text-rose-700">지도 불러오기 실패</p>
        <p className="mt-2">{items.length === 0 ? "좌표가 있는 장소가 없어요." : errorMessage}</p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-rose-100 bg-white shadow-card">
      <div className="flex items-start justify-between px-4 py-4">
        <div>
          <h2 className="text-base font-black">코스 지도</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-500">분홍 번호는 선택 코스, 보라색은 주변 경유지예요.</p>
        </div>
        <div className="flex shrink-0 gap-2 text-xs font-bold">
          <span className="rounded-full bg-roseSoft px-2 py-1 text-rose-700">코스</span>
          <span className="rounded-full bg-violet-100 px-2 py-1 text-violet-700">경유지</span>
        </div>
      </div>
      <div className="relative border-y border-rose-50">
        <div ref={ref} className="h-80 w-full" />
        {!isLoaded && (
          <div className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-semibold text-zinc-500">
            지도를 불러오는 중이에요
          </div>
        )}
      </div>
      <ol className="space-y-2 p-4 text-sm">
        {visibleItems.map((item) => (
          <li key={`${item.place.id}-${item.kind}-${item.order}`} className="flex items-center gap-3">
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black text-white ${item.kind === "course" ? "bg-roseApp" : "bg-violet-600"}`}>
              {item.kind === "course" ? item.order : "+"}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{item.place.name}</p>
              <p className="text-xs text-zinc-500">{item.kind === "course" ? "선택한 코스 장소" : "주변 중간경유지"}</p>
            </div>
          </li>
        ))}
      </ol>
      {items.length > 3 && (
        <button onClick={() => setExpanded((value) => !value)} className="w-full border-t border-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
          {expanded ? "접어보기" : `전체 ${items.length}개 장소 펼쳐보기`}
        </button>
      )}
    </section>
  );
}
