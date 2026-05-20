"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomButton from "@/components/BottomButton";
import { loadTodayCondition, resetOnboarding, saveTodayCondition } from "@/lib/storage";

const quick = ["화해하고 싶어요", "시험 끝나고 쉬고 싶어요", "기분전환하고 싶어요", "돈 아끼고 싶어요", "조용히 대화하고 싶어요", "술 한잔하고 싶어요", "그냥 추천받을래요"];

export default function TodayPage() {
  const router = useRouter();
  const [today, setToday] = useState(loadTodayCondition());
  const canContinue = today.situationText.trim().length > 0;

  return (
    <main className="min-h-screen bg-white px-6 py-8 safe-bottom">
      <p className="text-sm font-bold text-roseApp">오늘 뭐해?</p>
      <h1 className="mt-8 text-3xl font-black text-ink">지금 어떤 기분인가요?</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-500">이 문장을 키워드로 분석해서 오늘 코스를 추천해요.</p>

      <textarea
        value={today.situationText}
        onChange={(e) => setToday({ ...today, situationText: e.target.value })}
        className="mt-6 h-32 w-full resize-none rounded-3xl border border-zinc-100 bg-zinc-50 p-4 outline-none transition focus:border-roseApp focus:bg-white"
        placeholder="예: 오늘은 조용히 화해하고 싶어"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {quick.map((item) => (
          <button key={item} onClick={() => setToday({ ...today, situationText: item })} className="rounded-full bg-roseSoft px-4 py-2 text-sm font-bold text-rose-700">
            {item}
          </button>
        ))}
      </div>

      {!canContinue && <p className="mt-4 text-sm font-bold text-rose-500">상황을 한 문장으로 적거나 빠른 선택을 골라주세요.</p>}

      <div className="mt-10">
        <BottomButton
          onClick={() => {
            if (!canContinue) return;
            saveTodayCondition(today);
            router.push("/final-step");
          }}
          disabled={!canContinue}
        >
          다음으로
        </BottomButton>
      </div>

      <button
        type="button"
        onClick={() => {
          resetOnboarding();
          router.push("/onboarding");
        }}
        className="mt-4 w-full rounded-2xl border border-rose-100 bg-white px-5 py-4 text-sm font-extrabold text-zinc-500 shadow-sm transition active:scale-[0.99]"
      >
        처음부터 다시 선택할래요
      </button>
    </main>
  );
}
