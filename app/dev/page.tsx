"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { loadPlaces } from "@/lib/loadPlaces";
import { getEffectiveRole } from "@/lib/placeRole";
import { loadRoleOverrides, removeRoleOverride, roleOptions, saveRoleOverride, type EditableRole } from "@/lib/roleOverrides";
import type { Place } from "@/types/place";

export default function DevPage() {
  const [selectedRole, setSelectedRole] = useState<EditableRole | null>(null);
  const [version, setVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  const places = useMemo(loadPlaces, [version]);
  const overrides = useMemo(loadRoleOverrides, [version]);
  const filtered = selectedRole ? places.filter((place) => getEffectiveRole(place) === selectedRole) : [];
  const overrideItems = useMemo(
    () =>
      Object.entries(overrides)
        .map(([id, role]) => {
          const place = places.find((item) => item.id === id);
          return place ? { id, name: place.name, role } : { id, name: "알 수 없는 장소", role };
        })
        .sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [overrides, places]
  );

  const changeRole = (place: Place, role: EditableRole) => {
    saveRoleOverride(place.id, role);
    setVersion((value) => value + 1);
  };

  const resetRole = (place: Place) => {
    removeRoleOverride(place.id);
    setVersion((value) => value + 1);
  };

  const copyOverrides = async () => {
    const text = JSON.stringify(overrideItems, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="min-h-screen bg-white px-5 py-6 safe-bottom">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-300">Developer</p>
          <h1 className="mt-2 text-2xl font-black text-ink">가게 장르 관리</h1>
        </div>
        <Link href="/" className="rounded-full bg-zinc-50 px-4 py-2 text-sm font-black text-zinc-500">
          닫기
        </Link>
      </header>

      {!selectedRole ? (
        <section className="mt-8">
          <p className="text-sm leading-6 text-zinc-500">검수할 장르를 선택하세요. 여기서 바꾼 장르는 이 브라우저에 저장되고 추천에도 바로 반영돼요.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {roleOptions.map((role) => {
              const count = places.filter((place) => getEffectiveRole(place) === role).length;
              return (
                <button key={role} onClick={() => setSelectedRole(role)} className="rounded-[28px] border border-zinc-100 bg-zinc-50 p-5 text-left shadow-sm transition active:scale-[0.98]">
                  <p className="text-3xl">{roleEmoji(role)}</p>
                  <p className="mt-4 text-lg font-black text-ink">{role}</p>
                  <p className="mt-1 text-sm font-bold text-zinc-400">{count}개 카드</p>
                </button>
              );
            })}
          </div>
          <div className="mt-6 rounded-[24px] bg-roseSoft p-4 text-sm font-bold leading-6 text-rose-700">
            현재 수동 변경: {Object.keys(overrides).length}개
          </div>
          <button
            onClick={copyOverrides}
            disabled={overrideItems.length === 0}
            className="mt-3 w-full rounded-[22px] bg-ink px-5 py-4 text-sm font-black text-white disabled:bg-zinc-200 disabled:text-zinc-400"
          >
            {copied ? "수정 내역 복사 완료" : "수정 내역 복사하기"}
          </button>
          {overrideItems.length > 0 && (
            <div className="mt-3 rounded-[22px] bg-zinc-50 p-4">
              <p className="text-xs font-black text-zinc-400">최근 수정 내역</p>
              <div className="mt-2 max-h-40 space-y-1 overflow-auto text-xs leading-5 text-zinc-600">
                {overrideItems.map((item) => (
                  <p key={item.id}>
                    {item.name} → <span className="font-black text-rose-600">{item.role}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="mt-7">
          <button onClick={() => setSelectedRole(null)} className="rounded-full bg-zinc-50 px-4 py-2 text-sm font-black text-zinc-500">
            ← 장르 다시 선택
          </button>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-black text-roseApp">{selectedRole}</p>
              <h2 className="mt-1 text-2xl font-black text-ink">전체 카드 {filtered.length}개</h2>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {filtered.map((place) => (
              <DevPlaceCard key={place.id} place={place} isManual={Boolean(overrides[place.id])} onChangeRole={(role) => changeRole(place, role)} onReset={() => resetRole(place)} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function DevPlaceCard({ place, isManual, onChangeRole, onReset }: { place: Place; isManual: boolean; onChangeRole: (role: EditableRole) => void; onReset: () => void }) {
  const role = getEffectiveRole(place);

  return (
    <article className="rounded-[28px] border border-zinc-100 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-roseApp">{isManual ? "수동 변경됨" : role}</p>
          <h3 className="mt-1 truncate text-lg font-black text-ink">{place.name}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">{place.detailCategory || place.category || place.description}</p>
        </div>
        <span className="shrink-0 text-3xl">{roleEmoji(role as EditableRole)}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {roleOptions.map((option) => (
          <button
            key={option}
            onClick={() => onChangeRole(option)}
            className={`rounded-2xl px-3 py-3 text-sm font-black transition ${role === option ? "bg-roseApp text-white" : "bg-zinc-50 text-zinc-600"}`}
          >
            {option}
          </button>
        ))}
      </div>

      {isManual && (
        <button onClick={onReset} className="mt-3 w-full rounded-2xl bg-roseSoft px-4 py-3 text-sm font-black text-rose-700">
          원래 DB 기준으로 되돌리기
        </button>
      )}
    </article>
  );
}

function roleEmoji(role: string) {
  if (role === "식사") return "🍽️";
  if (role === "술") return "🍻";
  if (role === "카페") return "☕";
  if (role === "중간경유지") return "📸";
  return "💗";
}
