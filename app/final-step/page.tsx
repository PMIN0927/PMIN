"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomButton from "@/components/BottomButton";
import { loadTodayCondition, saveTodayCondition } from "@/lib/storage";
import type { TodayCondition } from "@/types/place";

export default function FinalStepPage() {
  const router = useRouter();
  const [today, setToday] = useState(loadTodayCondition());
  return (
    <main className="min-h-screen px-6 py-8 safe-bottom">
      <h1 className="mt-8 text-3xl font-black">마지막 단계</h1>
      <div className="mt-6 space-y-5">
        <ButtonGroup title="예산이 어느 정도인가요?" values={["1만원", "2만원", "3만원", "5만원", "제한없음"]} value={today.budget} onChange={(budget) => setToday({ ...today, budget })} />
        <ButtonGroup title="어떤 이동수단을 이용하시나요?" values={["걸어서요", "대중교통을 이용해요", "차량을 이용해요"]} value={today.transport} onChange={(transport) => setToday({ ...today, transport: transport as TodayCondition["transport"] })} />
        <label className="block rounded-3xl bg-white p-5 shadow-card">
          <span className="text-sm font-bold">몇시에 만나시나요?</span>
          <input type="time" value={today.meetingTime} onChange={(event) => setToday({ ...today, meetingTime: event.target.value })} className="mt-3 w-full rounded-2xl bg-roseSoft p-3 font-bold" />
        </label>
      </div>
      <div className="mt-10">
        <BottomButton
          onClick={() => {
            saveTodayCondition(today);
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
