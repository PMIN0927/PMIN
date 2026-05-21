"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { loadCustomPlaces, removeCustomPlace, saveCustomPlace, type CustomPlaceInput } from "@/lib/customPlaces";
import { hidePlace, loadDeletedPlaces, restorePlace } from "@/lib/deletedPlaces";
import { loadPlaces } from "@/lib/loadPlaces";
import { getEffectiveRole } from "@/lib/placeRole";
import { loadRoleOverrides, removeRoleOverride, roleOptions, saveRoleOverride, type EditableRole } from "@/lib/roleOverrides";
import type { Place } from "@/types/place";

const DEV_PASSWORD = "0927";

const emptyForm: CustomPlaceInput = {
  name: "",
  role: "식사",
  category: "",
  description: "",
  naverMapUrl: "",
  openingHours: ""
};

export default function DevPage() {
  const [unlocked, setUnlocked] = useState(() => typeof window !== "undefined" && sessionStorage.getItem("devUnlocked") === "true");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selectedRole, setSelectedRole] = useState<EditableRole | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<CustomPlaceInput>(emptyForm);
  const [version, setVersion] = useState(0);
  const [copiedText, setCopiedText] = useState("");

  const places = useMemo(loadPlaces, [version]);
  const overrides = useMemo(loadRoleOverrides, [version]);
  const customPlaces = useMemo(loadCustomPlaces, [version]);
  const deletedPlaces = useMemo(loadDeletedPlaces, [version]);
  const filtered = selectedRole ? places.filter((place) => getEffectiveRole(place) === selectedRole) : [];

  const overrideItems = useMemo(
    () =>
      Object.entries(overrides)
        .map(([id, role]) => {
          const place = places.find((item) => item.id === id);
          return place ? { id, name: place.name, role } : { id, name: "찾을 수 없는 장소", role };
        })
        .sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [overrides, places]
  );

  const customItems = useMemo(
    () =>
      customPlaces.map((place) => ({
        id: place.id,
        name: place.name,
        role: place.role,
        category: place.category,
        description: place.description,
        naverMapUrl: place.naverMapUrl,
        openingHours: place.openingHours
      })),
    [customPlaces]
  );

  const unlock = () => {
    if (password.trim() !== DEV_PASSWORD) {
      setPasswordError("비밀번호가 달라요.");
      return;
    }
    sessionStorage.setItem("devUnlocked", "true");
    setUnlocked(true);
  };

  const changeRole = (place: Place, role: EditableRole) => {
    saveRoleOverride(place.id, role);
    setVersion((value) => value + 1);
  };

  const resetRole = (place: Place) => {
    removeRoleOverride(place.id);
    setVersion((value) => value + 1);
  };

  const deletePlace = (place: Place) => {
    const ok = window.confirm(`${place.name} 카드를 삭제할까요? 기본 DB 카드는 숨김 처리되고, 직접 추가한 카드는 이 브라우저에서 삭제돼요.`);
    if (!ok) return;

    if (place.id.startsWith("custom-")) {
      removeCustomPlace(place.id);
    } else {
      hidePlace(place);
    }
    removeRoleOverride(place.id);
    setVersion((value) => value + 1);
  };

  const restoreDeletedPlace = (placeId: string) => {
    restorePlace(placeId);
    setVersion((value) => value + 1);
  };

  const copyJson = async (items: unknown[], label: string) => {
    await navigator.clipboard.writeText(JSON.stringify(items, null, 2));
    setCopiedText(label);
    window.setTimeout(() => setCopiedText(""), 1600);
  };

  const addPlace = () => {
    if (!form.name.trim()) return;
    saveCustomPlace(form);
    setForm(emptyForm);
    setShowAddForm(false);
    setVersion((value) => value + 1);
  };

  const fillFromNaverLink = () => {
    const inferred = inferFromNaverMapUrl(form.naverMapUrl);
    if (!inferred) return;
    setForm({
      ...form,
      name: form.name || inferred.name,
      role: inferred.role,
      category: form.category || inferred.category,
      description: form.description || inferred.description
    });
  };

  if (!unlocked) {
    return (
      <main className="flex min-h-screen flex-col bg-white px-6 py-8 safe-bottom">
        <header className="flex items-center justify-between">
          <Link href="/" className="rounded-full bg-zinc-50 px-4 py-2 text-sm font-black text-zinc-500">
            닫기
          </Link>
          <p className="text-sm font-black text-ink">오늘 뭐해?</p>
          <span className="w-[58px]" />
        </header>

        <section className="m-auto w-full max-w-sm rounded-[32px] border border-zinc-100 bg-white p-6 shadow-card">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-roseApp">Developer Mode</p>
          <h1 className="mt-3 text-2xl font-black leading-tight text-ink">관리자만 들어갈 수 있어요</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">가게 장르를 바꾸거나 새 카드를 추가하는 화면이라 비밀번호를 걸어뒀어요.</p>

          <form
            className="mt-6 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              unlock();
            }}
          >
            <input
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError("");
              }}
              type="password"
              inputMode="numeric"
              placeholder="비밀번호"
              className="w-full rounded-2xl bg-zinc-50 px-4 py-4 text-base font-black outline-none focus:ring-2 focus:ring-roseApp/40"
            />
            {passwordError && <p className="text-sm font-bold text-roseApp">{passwordError}</p>}
            <button className="w-full rounded-2xl bg-roseApp px-5 py-4 text-sm font-black text-white">들어가기</button>
          </form>
        </section>
      </main>
    );
  }

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
          <p className="text-sm leading-6 text-zinc-500">
            장르를 직접 고치면 이 브라우저에서는 추천 화면에 바로 반영돼요. 다른 사람에게도 적용하려면 아래 복사 버튼으로 내용을 받아서 DB에 반영해야 해요.
          </p>

          <button onClick={() => setShowAddForm((value) => !value)} className="mt-5 w-full rounded-[22px] bg-roseApp px-5 py-4 text-sm font-black text-white">
            카드 추가하기
          </button>

          {showAddForm && (
            <div className="mt-4 rounded-[28px] border border-rose-100 bg-white p-4 shadow-card">
              <p className="text-sm font-black text-ink">새 카드 추가</p>
              <div className="mt-4 space-y-3">
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="가게 이름" className="w-full rounded-2xl bg-zinc-50 p-3 text-sm font-bold outline-none" />
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as EditableRole })} className="w-full rounded-2xl bg-zinc-50 p-3 text-sm font-bold outline-none">
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="세부 장르 예: 초밥, 이자카야, 포토부스" className="w-full rounded-2xl bg-zinc-50 p-3 text-sm font-bold outline-none" />
                <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="설명 예: 조용한 초밥집" className="w-full rounded-2xl bg-zinc-50 p-3 text-sm font-bold outline-none" />
                <input value={form.naverMapUrl} onChange={(event) => setForm({ ...form, naverMapUrl: event.target.value })} placeholder="네이버 지도 링크" className="w-full rounded-2xl bg-zinc-50 p-3 text-sm font-bold outline-none" />
                <button type="button" onClick={fillFromNaverLink} className="w-full rounded-2xl bg-roseSoft px-4 py-3 text-sm font-black text-rose-700">
                  네이버 검색 링크로 기본값 채우기
                </button>
                <input value={form.openingHours} onChange={(event) => setForm({ ...form, openingHours: event.target.value })} placeholder="운영시간 예: 11:00~22:00" className="w-full rounded-2xl bg-zinc-50 p-3 text-sm font-bold outline-none" />
              </div>
              <button onClick={addPlace} disabled={!form.name.trim()} className="mt-4 w-full rounded-2xl bg-ink px-4 py-3 text-sm font-black text-white disabled:bg-zinc-200 disabled:text-zinc-400">
                추가 완료
              </button>
            </div>
          )}

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
            현재 수동 장르 변경 {Object.keys(overrides).length}개, 직접 추가 카드 {customPlaces.length}개, 삭제/숨김 카드 {deletedPlaces.length}개
          </div>
          <button onClick={() => copyJson(overrideItems, "수정 이력")} disabled={overrideItems.length === 0} className="mt-3 w-full rounded-[22px] bg-ink px-5 py-4 text-sm font-black text-white disabled:bg-zinc-200 disabled:text-zinc-400">
            {copiedText === "수정 이력" ? "수정 이력 복사 완료" : "수정 이력 복사하기"}
          </button>
          <button onClick={() => copyJson(customItems, "추가 카드")} disabled={customItems.length === 0} className="mt-3 w-full rounded-[22px] bg-zinc-100 px-5 py-4 text-sm font-black text-zinc-700 disabled:text-zinc-400">
            {copiedText === "추가 카드" ? "추가 카드 복사 완료" : "추가 카드 복사하기"}
          </button>

          {overrideItems.length > 0 && (
            <div className="mt-3 rounded-[22px] bg-zinc-50 p-4">
              <p className="text-xs font-black text-zinc-400">최근 수정 이력</p>
              <div className="mt-2 max-h-40 space-y-1 overflow-auto text-xs leading-5 text-zinc-600">
                {overrideItems.map((item) => (
                  <p key={item.id}>
                    {item.name} → <span className="font-black text-rose-600">{item.role}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {deletedPlaces.length > 0 && (
            <div className="mt-4 rounded-[22px] bg-zinc-50 p-4">
              <p className="text-xs font-black text-zinc-400">삭제/숨김 카드</p>
              <div className="mt-3 space-y-2">
                {deletedPlaces.map((place) => (
                  <div key={place.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-ink">{place.name}</p>
                      <p className="text-xs font-bold text-zinc-400">{place.role || "역할 없음"}</p>
                    </div>
                    <button onClick={() => restoreDeletedPlace(place.id)} className="shrink-0 rounded-full bg-roseSoft px-3 py-2 text-xs font-black text-rose-700">
                      복원
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="mt-7">
          <button onClick={() => setSelectedRole(null)} className="rounded-full bg-zinc-50 px-4 py-2 text-sm font-black text-zinc-500">
            장르 다시 선택
          </button>
          <div className="mt-5">
            <p className="text-sm font-black text-roseApp">{selectedRole}</p>
            <h2 className="mt-1 text-2xl font-black text-ink">전체 카드 {filtered.length}개</h2>
          </div>

          <div className="mt-5 space-y-4">
            {filtered.map((place) => (
              <DevPlaceCard key={place.id} place={place} isManual={Boolean(overrides[place.id])} onChangeRole={(role) => changeRole(place, role)} onReset={() => resetRole(place)} onDelete={() => deletePlace(place)} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-10 pb-2 text-center text-[11px] font-bold text-zinc-300">채영아 사랑해</p>
    </main>
  );
}

function DevPlaceCard({
  place,
  isManual,
  onChangeRole,
  onReset,
  onDelete
}: {
  place: Place;
  isManual: boolean;
  onChangeRole: (role: EditableRole) => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const role = getEffectiveRole(place);
  const mapUrl = place.naverMapUrl || place.kakaoMapUrl;

  return (
    <article className="rounded-[28px] border border-zinc-100 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-roseApp">{isManual ? "수동 변경됨" : role}</p>
          <h3 className="mt-1 truncate text-lg font-black text-ink">{place.name}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">{place.detailCategory || place.category || place.description}</p>
        </div>
        <span className="shrink-0 text-3xl">{roleEmoji(role)}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {roleOptions.map((option) => (
          <button key={option} onClick={() => onChangeRole(option)} className={`rounded-2xl px-3 py-3 text-sm font-black transition ${role === option ? "bg-roseApp text-white" : "bg-zinc-50 text-zinc-600"}`}>
            {option}
          </button>
        ))}
      </div>

      {mapUrl && (
        <a href={mapUrl} target="_blank" className="mt-3 block w-full rounded-2xl bg-zinc-50 px-4 py-3 text-center text-sm font-black text-zinc-600">
          지도 열기
        </a>
      )}

      {isManual && (
        <button onClick={onReset} className="mt-3 w-full rounded-2xl bg-roseSoft px-4 py-3 text-sm font-black text-rose-700">
          원래 DB 기준으로 되돌리기
        </button>
      )}

      <button onClick={onDelete} className="mt-3 w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">
        카드 삭제하기
      </button>
    </article>
  );
}

function roleEmoji(role: string) {
  if (role === "식사") return "🍽️";
  if (role === "술") return "🍻";
  if (role === "카페") return "☕";
  if (role === "중간경유지") return "🎯";
  return "📍";
}

function inferFromNaverMapUrl(url: string): CustomPlaceInput | null {
  const query = extractSearchQuery(url);
  if (!query) return null;
  const name = query.replace(/\s*부산진구\s*/g, " ").replace(/\s+/g, " ").trim();

  if (/카페|커피|디저트|베이커리|빙수|찻집/.test(name)) {
    return {
      name,
      role: "카페",
      category: "카페",
      description: "카페 또는 디저트 장소",
      naverMapUrl: url,
      openingHours: ""
    };
  }

  if (/술집|이자카야|주점|포차|바|하이볼|맥주|와인|야키토리|오뎅|꼬치/.test(name)) {
    return {
      name,
      role: "술",
      category: "술집",
      description: "술과 안주를 즐기는 장소",
      naverMapUrl: url,
      openingHours: ""
    };
  }

  if (/포토|사진|스튜디오|방탈출|보드게임|오락실|인형뽑기|가챠|타로|사주|소품/.test(name)) {
    return {
      name,
      role: "중간경유지",
      category: "중간경유지",
      description: "데이트 중간에 들르기 좋은 장소",
      naverMapUrl: url,
      openingHours: ""
    };
  }

  const foodCategory = inferFoodCategory(name);
  return {
    name,
    role: "식사",
    category: foodCategory,
    description: `${foodCategory} 계열 식사 장소`,
    naverMapUrl: url,
    openingHours: ""
  };
}

function extractSearchQuery(url: string) {
  try {
    const decodedUrl = decodeURIComponent(url);
    const match = decodedUrl.match(/\/search\/([^/?#]+)/);
    return match?.[1]?.trim() || null;
  } catch {
    return null;
  }
}

function inferFoodCategory(name: string) {
  if (/초밥|스시|라멘|우동|돈까스|돈카츠|규카츠|일식/.test(name)) return "일식";
  if (/파스타|피자|스테이크|양식|브런치/.test(name)) return "양식";
  if (/마라|짬뽕|중식|양꼬치|훠궈/.test(name)) return "중식";
  if (/고기|곱창|막창|구이|삼겹|갈비/.test(name)) return "고기";
  if (/샤브/.test(name)) return "샤브샤브";
  if (/국밥|칼국수|밥|한식|순두부|백반/.test(name)) return "한식";
  if (/버거|치킨/.test(name)) return "버거/치킨";
  return "식사";
}
