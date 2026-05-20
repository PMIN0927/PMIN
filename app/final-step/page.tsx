"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomButton from "@/components/BottomButton";
import { loadTodayCondition, saveTodayCondition } from "@/lib/storage";

export default function FinalStepPage() {
  const router = useRouter();
  const [today, setToday] = useState(loadTodayCondition());

  return (
    <main className="min-h-screen bg-white px-6 py-6 safe-bottom">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-300">Last Step</p>
        <h1 className="mt-3 text-[28px] font-black text-ink">마지막으로 조건을 알려주세요</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">예산과 만나는 시간을 기준으로 오늘 코스를 정리할게요.</p>
      </header>

      <div className="mt-7 space-y-5">
        <ButtonGroup title="예산은 어느 정도인가요?" values={["1만원", "2만원", "3만원", "5만원", "제한없음"]} value={today.budget} onChange={(budget) => setToday({ ...today, budget })} />
        <label className="block rounded-[28px] border border-zinc-100 bg-white p-5 shadow-card">
          <span className="text-sm font-black text-ink">몇 시에 만나나요?</span>
          <input type="time" value={today.meetingTime} onChange={(event) => setToday({ ...today, meetingTime: event.target.value })} className="mt-3 w-full rounded-2xl bg-zinc-50 p-3 font-bold text-ink outline-none" />
        </label>
      </div>

      <div className="mt-10">
        <BottomButton
          onClick={() => {
            saveTodayCondition({ ...today, transport: today.transport || "걸어서요" });
            router.push("/select-mode");
          }}
        >
          다 골랐어요
        </BottomButton>
      </div>
    </main>
  );
}

function ButtonGroup({ title, values, value, onChange }: { title: string; values: string[]; value: string; onChange: (v: string) => void }) {
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
