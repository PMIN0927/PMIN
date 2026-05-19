"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomButton from "@/components/BottomButton";
import OptionCard from "@/components/OptionCard";
import ProgressBar from "@/components/ProgressBar";
import { completeOnboarding, savePreference, saveTodayCondition } from "@/lib/storage";
import type { TodayCondition, UserPreference } from "@/types/place";

const steps = [
  { key: "moods", title: "어떤 분위기를 좋아하세요?", options: ["조용한", "감성적인", "활기찬", "편한"] },
  { key: "foods", title: "어떤 음식을 선호하시나요?", options: ["한식", "일식", "양식", "중식", "술집", "카페"] },
  { key: "dislikes", title: "어떤 요소를 피하고 싶으신가요?", options: ["웨이팅", "시끄러운 곳", "비싼 곳", "많이 걷기"] },
  { key: "dateStyles", title: "어떤 데이트를 선호하세요?", options: ["조용한 카페에서 대화", "맛집 가고 술 한잔", "걷다가 구경하기", "사진 찍고 놀기"] }
] as const;

const quick = ["화해하고 싶어요", "시험 끝나고 쉬고 싶어요", "기분전환하고 싶어요", "돈 아끼고 싶어요", "조용히 대화하고 싶어요", "술 한잔하고 싶어요", "그냥 추천받을래요"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pref, setPref] = useState<UserPreference>({ moods: [], foods: [], dislikes: [], dateStyles: [] });
  const [today, setToday] = useState<TodayCondition>({ situationText: "", budget: "3만원", transport: "걸어서요", meetingTime: "18:00" });

  const toggle = (key: keyof UserPreference, value: string) => {
    setPref((prev) => {
      const exists = prev[key].includes(value);
      return { ...prev, [key]: exists ? prev[key].filter((item) => item !== value) : [...prev[key], value] };
    });
  };

  const finish = () => {
    savePreference(pref);
    saveTodayCondition(today);
    completeOnboarding();
    router.push("/select-mode");
  };

  if (step < steps.length) {
    const current = steps[step];
    const key = current.key as keyof UserPreference;
    return (
      <main className="min-h-screen px-6 py-8 safe-bottom">
        <ProgressBar step={step + 1} total={7} />
        <h1 className="mt-10 text-3xl font-black text-ink">{current.title}</h1>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {current.options.map((option) => (
            <OptionCard key={option} label={option} selected={pref[key].includes(option)} onClick={() => toggle(key, option)} />
          ))}
        </div>
        <div className="mt-10">
          <BottomButton onClick={() => setStep(step + 1)}>다음으로</BottomButton>
        </div>
      </main>
    );
  }

  if (step === 4) {
    return (
      <main className="min-h-screen px-6 py-8 safe-bottom">
        <ProgressBar step={5} total={7} />
        <h1 className="mt-10 text-3xl font-black">지금 어떤 기분인가요?</h1>
        <textarea
          value={today.situationText}
          onChange={(event) => setToday({ ...today, situationText: event.target.value })}
          placeholder="예: 오늘은 조용히 이야기하고 싶어"
          className="mt-6 h-28 w-full rounded-3xl border border-rose-100 p-4 outline-none focus:border-roseApp"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {quick.map((item) => (
            <button key={item} onClick={() => setToday({ ...today, situationText: item })} className="rounded-full bg-roseSoft px-4 py-2 text-sm font-bold text-rose-700">
              {item}
            </button>
          ))}
        </div>
        <div className="mt-10">
          <BottomButton onClick={() => setStep(5)}>다음으로</BottomButton>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8 safe-bottom">
      <ProgressBar step={7} total={7} />
      <h1 className="mt-10 text-3xl font-black">마지막 단계</h1>
      <section className="mt-6 space-y-6">
        <SelectBlock title="예산이 어느 정도인가요?" values={["1만원", "2만원", "3만원", "5만원", "제한없음"]} value={today.budget} onChange={(budget) => setToday({ ...today, budget })} />
        <SelectBlock title="어떤 이동수단을 이용하시나요?" values={["걸어서요", "대중교통을 이용해요", "차량을 이용해요"]} value={today.transport} onChange={(transport) => setToday({ ...today, transport: transport as TodayCondition["transport"] })} />
        <label className="block rounded-3xl bg-white p-5 shadow-card">
          <span className="text-sm font-bold">몇시에 만나시나요?</span>
          <input type="time" value={today.meetingTime} onChange={(event) => setToday({ ...today, meetingTime: event.target.value })} className="mt-3 w-full rounded-2xl bg-roseSoft p-3 font-bold" />
        </label>
      </section>
      <div className="mt-10">
        <BottomButton onClick={finish}>다 골랐어요</BottomButton>
      </div>
    </main>
  );
}

function SelectBlock({ title, values, value, onChange }: { title: string; values: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <p className="text-sm font-bold">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((item) => (
          <button key={item} onClick={() => onChange(item)} className={`rounded-full px-4 py-2 text-sm font-bold ${value === item ? "bg-roseApp text-white" : "bg-roseSoft text-rose-700"}`}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
