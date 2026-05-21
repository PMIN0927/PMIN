"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BottomButton from "@/components/BottomButton";
import LoadingScreen from "@/components/LoadingScreen";
import PlaceCard from "@/components/PlaceCard";
import { loadPlaces } from "@/lib/loadPlaces";
import { buildPlaceReason } from "@/lib/recommendReason";
import { makeCourseFromSelection, pickCandidates } from "@/lib/recommender";
import { loadPreference, loadTodayCondition, saveCourse } from "@/lib/storage";
import type { Place } from "@/types/place";

type StepKey = "meal" | "cafe" | "bar";

const steps: Array<{
  key: StepKey;
  role: "식사" | "카페" | "술";
  title: string;
  refresh: string;
  helper: string;
  loading: string;
}> = [
  {
    key: "meal",
    role: "식사",
    title: "먼저 식사 장소를 골라주세요",
    refresh: "다른 식사 후보 보기",
    helper: "음식 취향, 분위기, 오늘 문장을 같이 보고 후보를 골랐어요.",
    loading: "식사 후보를 다시 고르는 중이에요"
  },
  {
    key: "cafe",
    role: "카페",
    title: "카페도 들러볼까요?",
    refresh: "다른 카페 후보 보기",
    helper: "대화하기 좋은 곳과 쉬어가기 좋은 곳을 우선으로 봤어요.",
    loading: "카페 후보를 다시 고르는 중이에요"
  },
  {
    key: "bar",
    role: "술",
    title: "마지막으로 한잔할 곳을 골라볼까요?",
    refresh: "다른 술집 후보 보기",
    helper: "오늘 분위기를 이어가기 좋은 술집 후보예요. 술이 싫다고 적었다면 자동으로 낮게 잡혀요.",
    loading: "술집 후보를 다시 고르는 중이에요"
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
  const candidates = useMemo(() => pickCandidates(places, current.role, preference, today, blockedIds, 3), [places, current.role, preference, today, blockedIdsByStep, selection]);
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

  const skipStep = () => selectPlace(undefined);

  if (isLoading) {
    return <LoadingScreen title={loadingText} description="잠깐만요. 취향과 오늘 상황에 맞는 다음 후보를 정리하고 있어요." />;
  }

  return (
    <main className="min-h-screen bg-white py-6 safe-bottom">
      <div className="px-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-300">Course Builder</p>
            <p className="mt-1 text-sm font-black text-ink">카드로 직접 고르기</p>
          </div>
          <span className="rounded-full bg-roseSoft px-3 py-1 text-xs font-bold text-rose-700">{stepIndex + 1}/3</span>
        </header>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-roseApp transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section key={current.key} className="soft-enter">
        <div className="px-6">
          <h1 className="mt-9 text-[28px] font-black leading-tight text-ink">{current.title}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">{current.helper}</p>
          <SelectedPreview selection={selection} />

          {current.key === "cafe" && (
            <button onClick={() => selectPlace(undefined)} className="mt-5 w-full rounded-[1.75rem] bg-roseSoft p-5 text-left text-lg font-black text-rose-700 shadow-card">
              카페는 건너뛸래요
              <span className="mt-1 block text-sm font-medium text-rose-500">술집이나 중간경유지 중심으로 코스를 이어갈게요.</span>
            </button>
          )}
        </div>

        {candidates.length === 0 ? (
          <div className="mx-6 mt-6 rounded-[1.75rem] border border-rose-100 bg-roseSoft p-6 text-center">
            <p className="text-4xl">🔎</p>
            <h2 className="mt-4 text-xl font-black text-ink">조건을 조금 완화해볼까요?</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">지금 입력한 분위기, 시간, 피하고 싶은 조건을 모두 반영하니 {current.role} 후보가 부족해졌어요.</p>
            <div className="mt-5 grid gap-2">
              <button onClick={refresh} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-rose-700 shadow-sm">
                다른 후보 다시 찾기
              </button>
              {current.key !== "meal" ? (
                <button onClick={skipStep} className="rounded-2xl bg-ink px-4 py-3 text-sm font-black text-white">
                  이 단계는 건너뛰기
                </button>
              ) : (
                <Link href="/today" className="rounded-2xl bg-ink px-4 py-3 text-sm font-black text-white">
                  오늘 상황 다시 입력하기
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {candidates.map((place, index) => (
                <div key={place.id} className="w-[82vw] max-w-[340px] shrink-0 snap-center">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <span className="text-xs font-black text-zinc-300">후보 {index + 1}</span>
                    <span className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-500">옆으로 넘겨보기</span>
                  </div>
                  <PlaceCard place={place} reason={buildPlaceReason(place, preference, today)} onSelect={() => selectPlace(place)} cta="이걸로 할래요" />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1">
              {candidates.map((place) => (
                <span key={place.id} className="h-1.5 w-1.5 rounded-full bg-rose-200" />
              ))}
            </div>
          </>
        )}
      </section>

      <div className="mt-6 px-6">
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
