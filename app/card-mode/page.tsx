"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BottomButton from "@/components/BottomButton";
import LoadingScreen from "@/components/LoadingScreen";
import PlaceCard from "@/components/PlaceCard";
import { loadPlaces } from "@/lib/loadPlaces";
import { loadPreference, loadTodayCondition, saveCourse } from "@/lib/storage";
import { makeCourseFromSelection, pickCandidates } from "@/lib/recommender";
import type { Place } from "@/types/place";

type StepKey = "meal" | "cafe" | "bar";

const steps: Array<{ key: StepKey; role: "식사" | "카페" | "술"; title: string; refresh: string; helper: string; loading: string }> = [
  {
    key: "meal",
    role: "식사",
    title: "먼저 식사 장소를 골라주세요",
    refresh: "다른 식사 후보 보기",
    helper: "오늘 기분과 선호 음식에 맞춰 식사 카드 3개를 골랐어요.",
    loading: "식사 후보를 고르는 중이에요"
  },
  {
    key: "cafe",
    role: "카페",
    title: "카페도 들러볼까요?",
    refresh: "다른 카페 후보 보기",
    helper: "대화하기 좋은 카페 후보 3개예요. 원하면 건너뛸 수 있어요.",
    loading: "카페 후보를 고르는 중이에요"
  },
  {
    key: "bar",
    role: "술",
    title: "마지막으로 한잔할 곳을 골라볼까요?",
    refresh: "다른 술집 후보 보기",
    helper: "식사 뒤 분위기를 이어가기 좋은 술집 카드 3개예요.",
    loading: "술집 후보를 고르는 중이에요"
  }
];

export default function CardModePage() {
  const router = useRouter();
  const places = useMemo(loadPlaces, []);
  const preference = loadPreference();
  const today = loadTodayCondition();
  const [stepIndex, setStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("추천 후보를 고르는 중이에요");
  const [blockedIdsByStep, setBlockedIdsByStep] = useState<Record<StepKey, string[]>>({ meal: [], cafe: [], bar: [] });
  const [selection, setSelection] = useState<{ meal?: Place; cafe?: Place; bar?: Place }>({});

  const current = steps[stepIndex];
  const selectedIds = [selection.meal?.id, selection.cafe?.id, selection.bar?.id].filter(Boolean) as string[];
  const blockedIds = new Set([...blockedIdsByStep[current.key], ...selectedIds]);
  const candidates = useMemo(
    () => pickCandidates(places, current.role, preference, today, blockedIds, 3),
    [places, current.role, preference, today, blockedIdsByStep, selection]
  );
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  const waitThen = (title: string, next: () => void) => {
    setLoadingText(title);
    setIsLoading(true);
    window.setTimeout(() => {
      next();
      setIsLoading(false);
    }, 2000);
  };

  const refresh = () => {
    waitThen(current.loading, () => {
      setBlockedIdsByStep((prev) => ({
        ...prev,
        [current.key]: [...prev[current.key], ...candidates.map((place) => place.id)]
      }));
    });
  };

  const finishOrNext = (nextSelection: { meal?: Place; cafe?: Place; bar?: Place }) => {
    if (stepIndex < steps.length - 1) {
      waitThen(steps[stepIndex + 1].loading, () => setStepIndex(stepIndex + 1));
      return;
    }
    waitThen("선택한 장소로 코스를 만드는 중이에요", () => {
      const course = makeCourseFromSelection(nextSelection, places, preference, today);
      saveCourse(course);
      router.push("/result");
    });
  };

  const selectPlace = (place?: Place) => {
    const next = { ...selection, [current.key]: place };
    setSelection(next);
    finishOrNext(next);
  };

  if (isLoading) {
    return <LoadingScreen title={loadingText} description="잠깐만요. 선택한 흐름에 맞춰 다음 후보를 정리하고 있어요." />;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8 safe-bottom">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-roseApp">카드로 직접 고르기</p>
        <span className="rounded-full bg-roseSoft px-3 py-1 text-xs font-bold text-rose-700">{stepIndex + 1}/3</span>
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-blue-100">
        <div className="h-full rounded-full bg-blue-400 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <section key={current.key} className="soft-enter">
        <h1 className="mt-10 text-3xl font-black leading-tight text-ink">{current.title}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">{current.helper}</p>
        <SelectedPreview selection={selection} />

        {current.key === "cafe" && (
          <button onClick={() => selectPlace(undefined)} className="mt-5 w-full rounded-[1.75rem] bg-roseSoft p-5 text-left text-lg font-black text-rose-700 shadow-card">
            카페는 건너뛸래요
            <span className="mt-1 block text-sm font-medium text-rose-500">술집이나 중간경유지 중심으로 코스를 이어갈게요.</span>
          </button>
        )}

        <div className="mt-6 space-y-4">
          {candidates.length === 0 ? (
            <div className="rounded-[1.75rem] bg-zinc-50 p-6 text-center text-zinc-500">더 이상 후보가 없어요</div>
          ) : (
            candidates.map((place) => <PlaceCard key={place.id} place={place} onSelect={() => selectPlace(place)} cta="이걸로 할래요" />)
          )}
        </div>
      </section>

      <div className="mt-6">
        <BottomButton onClick={refresh} disabled={candidates.length === 0}>
          {current.refresh}
        </BottomButton>
      </div>
    </main>
  );
}

function SelectedPreview({ selection }: { selection: { meal?: Place; cafe?: Place; bar?: Place } }) {
  const items = [
    ["식사", selection.meal?.name],
    ["카페", selection.cafe?.name],
    ["술집", selection.bar?.name]
  ];
  if (!items.some(([, value]) => value)) return null;

  return (
    <div className="mt-5 rounded-[1.75rem] bg-zinc-50 p-4">
      <p className="text-xs font-bold text-zinc-400">지금까지 고른 코스</p>
      <div className="mt-3 space-y-2 text-sm">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2">
            <span className="font-bold text-zinc-500">{label}</span>
            <span className="max-w-[220px] truncate font-semibold text-ink">{value || "아직 선택 전"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
