"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import BottomButton from "@/components/BottomButton";
import OptionCard from "@/components/OptionCard";
import ProgressBar from "@/components/ProgressBar";
import { completeOnboarding, savePreference, saveTodayCondition } from "@/lib/storage";
import type { TodayCondition, UserPreference } from "@/types/place";

type ChoiceStep = {
  key: keyof UserPreference;
  title: string;
  eyebrow: string;
  helper: string;
  min: number;
  optional?: boolean;
  options: Array<{ label: string; icon: string; description: string }>;
};

const choiceSteps: ChoiceStep[] = [
  {
    key: "moods",
    eyebrow: "취향 설정 1/3",
    title: "어떤 분위기를 좋아하세요?",
    helper: "최소 3개를 골라주세요. 추천 이유와 장소 점수에 바로 반영돼요.",
    min: 3,
    options: [
      { label: "조용한", icon: "🤍", description: "대화하기 편한 곳" },
      { label: "감성적인", icon: "🌷", description: "사진과 분위기 좋은 곳" },
      { label: "깔끔한", icon: "✨", description: "첫데이트에도 무난한 곳" },
      { label: "활기찬", icon: "🔥", description: "기분전환 되는 곳" },
      { label: "편한", icon: "🫶", description: "부담 없는 데이트" },
      { label: "힙한", icon: "🪩", description: "전포 느낌 있는 곳" },
      { label: "아늑한", icon: "☕", description: "오래 머물기 좋은 곳" },
      { label: "로맨틱한", icon: "🌙", description: "저녁 분위기 좋은 곳" },
      { label: "가성비", icon: "💸", description: "돈 부담 적은 곳" },
      { label: "실내 위주", icon: "🏠", description: "날씨 안 좋은 날" },
      { label: "사진 찍기 좋은", icon: "📸", description: "추억 남기기 좋은 곳" },
      { label: "늦은 시간 가능", icon: "🕙", description: "밤 데이트 후보" }
    ]
  },
  {
    key: "foods",
    eyebrow: "취향 설정 2/3",
    title: "어떤 음식을 좋아하세요?",
    helper: "카페와 술집은 뺐어요. 식사 취향을 최소 3개 골라주세요.",
    min: 3,
    options: [
      { label: "한식", icon: "🍚", description: "국밥, 찌개, 백반" },
      { label: "일식", icon: "🍣", description: "초밥, 라멘, 돈카츠" },
      { label: "양식", icon: "🍝", description: "파스타, 피자, 스테이크" },
      { label: "중식", icon: "🥟", description: "마라, 짬뽕, 양꼬치" },
      { label: "분식", icon: "🍢", description: "떡볶이, 김밥, 튀김" },
      { label: "고기", icon: "🥩", description: "삼겹살, 소금구이" },
      { label: "곱창/막창", icon: "🍳", description: "시끌시끌한 저녁" },
      { label: "샤브샤브", icon: "🥬", description: "깔끔하고 든든한 식사" },
      { label: "쌀국수/아시안", icon: "🍜", description: "가볍게 먹기 좋은 메뉴" },
      { label: "해산물", icon: "🦐", description: "낙지, 조개, 해물" },
      { label: "버거/치킨", icon: "🍔", description: "캐주얼한 한 끼" },
      { label: "디저트 식사", icon: "🥐", description: "브런치, 베이커리" }
    ]
  },
  {
    key: "dislikes",
    eyebrow: "취향 설정 3/3",
    title: "피하고 싶은 상황이 있나요?",
    helper: "여기는 선택하지 않아도 넘어갈 수 있어요.",
    min: 0,
    optional: true,
    options: [
      { label: "웨이팅", icon: "⏳", description: "기다리는 시간 줄이기" },
      { label: "시끄러운 곳", icon: "🔊", description: "대화 어려운 분위기" },
      { label: "비싼 곳", icon: "💳", description: "예산 부담 큰 곳" },
      { label: "많이 걷기", icon: "🚶", description: "동선 긴 코스 피하기" },
      { label: "너무 좁은 곳", icon: "🪑", description: "답답한 공간 피하기" },
      { label: "야외 위주", icon: "🌧️", description: "날씨 영향 받는 코스" },
      { label: "매운 음식", icon: "🌶️", description: "매운 메뉴 줄이기" },
      { label: "술 중심", icon: "🍺", description: "술집 우선순위 낮추기" },
      { label: "프랜차이즈", icon: "🏷️", description: "흔한 장소 줄이기" },
      { label: "사진 찍는 곳", icon: "📷", description: "포토부스류 제외" }
    ]
  }
];

const quick = ["화해하고 싶어요", "시험 끝나고 쉬고 싶어요", "기분전환하고 싶어요", "돈 아끼고 싶어요", "조용히 대화하고 싶어요", "술 한잔하고 싶어요", "그냥 추천받을래요"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pref, setPref] = useState<UserPreference>({ moods: [], foods: [], dislikes: [], dateStyles: [] });
  const [today, setToday] = useState<TodayCondition>({ situationText: "", budget: "3만원", transport: "걸어서요", meetingTime: "18:00" });
  const totalSteps = 5;

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

  if (step < choiceSteps.length) {
    const current = choiceSteps[step];
    const selected = pref[current.key];
    const canContinue = selected.length >= current.min;
    const statusText = current.optional ? `${selected.length}개 선택` : `${selected.length}/${current.min}개 이상`;

    return (
      <OnboardingShell step={step + 1} total={totalSteps} eyebrow={current.eyebrow}>
        <div className="mt-8">
          <p className="text-sm font-bold text-roseApp">{statusText}</p>
          <h1 className="mt-3 text-[28px] font-black leading-tight text-ink">{current.title}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">{current.helper}</p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          {current.options.map((option) => (
            <OptionCard
              key={option.label}
              label={option.label}
              icon={option.icon}
              description={option.description}
              selected={selected.includes(option.label)}
              onClick={() => toggle(current.key, option.label)}
            />
          ))}
        </div>

        <div className="mt-8">
          <BottomButton onClick={() => setStep(step + 1)} disabled={!canContinue}>
            {canContinue ? "다음으로" : `${current.min}개 이상 골라주세요`}
          </BottomButton>
        </div>
      </OnboardingShell>
    );
  }

  if (step === 3) {
    const detected = quick.find((item) => item === today.situationText);
    return (
      <OnboardingShell step={4} total={totalSteps} eyebrow="오늘 상태">
        <div className="mt-14 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-roseSoft text-4xl shadow-card">💭</div>
          <h1 className="mt-8 text-[28px] font-black text-ink">지금 어떤 기분인가요?</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">오늘만의 상황을 적으면 추천 키워드로 분석해요.</p>
        </div>
        <textarea
          value={today.situationText}
          onChange={(event) => setToday({ ...today, situationText: event.target.value })}
          placeholder="예: 오늘은 조용히 화해하고 싶어"
          className="mt-7 h-28 w-full resize-none rounded-[26px] border border-zinc-100 bg-zinc-50 p-4 text-[15px] outline-none transition focus:border-roseApp focus:bg-white"
        />
        <div className="mt-5 rounded-[28px] bg-white p-3 shadow-card">
          {quick.map((item) => (
            <button
              key={item}
              onClick={() => setToday({ ...today, situationText: item })}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                detected === item ? "bg-roseSoft text-rose-700" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <span>{item}</span>
              <span className="text-roseApp">{detected === item ? "선택됨" : ""}</span>
            </button>
          ))}
        </div>
        <div className="mt-8">
          <BottomButton onClick={() => setStep(4)}>다음으로</BottomButton>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell step={5} total={totalSteps} eyebrow="마지막 설정">
      <div className="mt-10">
        <h1 className="text-[28px] font-black text-ink">마지막으로 조건을 알려주세요</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">예산과 이동수단은 코스 거리와 가격 점수에 반영돼요.</p>
      </div>
      <section className="mt-7 space-y-5">
        <SelectBlock title="예산은 어느 정도인가요?" values={["1만원", "2만원", "3만원", "5만원", "제한없음"]} value={today.budget} onChange={(budget) => setToday({ ...today, budget })} />
        <label className="block rounded-[28px] border border-zinc-100 bg-white p-5 shadow-card">
          <span className="text-sm font-black text-ink">몇 시에 만나나요?</span>
          <input type="time" value={today.meetingTime} onChange={(event) => setToday({ ...today, meetingTime: event.target.value })} className="mt-3 w-full rounded-2xl bg-zinc-50 p-3 font-bold text-ink outline-none" />
        </label>
      </section>
      <div className="mt-8">
        <BottomButton onClick={finish}>다 골랐어요</BottomButton>
      </div>
    </OnboardingShell>
  );
}

function OnboardingShell({ children, step, total, eyebrow }: { children: ReactNode; step: number; total: number; eyebrow: string }) {
  return (
    <main className="min-h-screen bg-white px-6 py-5 safe-bottom">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-300">오늘 뭐해?</p>
          <p className="mt-1 text-sm font-black text-ink">{eyebrow}</p>
        </div>
        <span className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-black text-zinc-500">
          {step}/{total}
        </span>
      </header>
      <div className="mt-5">
        <ProgressBar step={step} total={total} />
      </div>
      <section className="soft-enter">{children}</section>
    </main>
  );
}

function SelectBlock({ title, values, value, onChange }: { title: string; values: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-[28px] border border-zinc-100 bg-white p-5 shadow-card">
      <p className="text-sm font-black text-ink">{title}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {values.map((item) => (
          <button key={item} onClick={() => onChange(item)} className={`rounded-2xl px-4 py-3 text-sm font-black transition ${value === item ? "bg-roseApp text-white shadow-card" : "bg-zinc-50 text-zinc-600"}`}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
