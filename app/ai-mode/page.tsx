"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomButton from "@/components/BottomButton";
import LoadingScreen from "@/components/LoadingScreen";
import { loadPlaces } from "@/lib/loadPlaces";
import { makeAutoCourse } from "@/lib/recommender";
import { loadPreference, loadTodayCondition, saveCourse, saveTodayCondition } from "@/lib/storage";

export default function AiModePage() {
  const router = useRouter();
  const [today, setToday] = useState(loadTodayCondition());
  const [isLoading, setIsLoading] = useState(false);

  const recommend = () => {
    saveTodayCondition(today);
    setIsLoading(true);
    window.setTimeout(() => {
      const course = makeAutoCourse(loadPlaces(), loadPreference(), today);
      saveCourse(course);
      router.push("/result");
    }, 2000);
  };

  if (isLoading) {
    return <LoadingScreen title="AI가 코스를 짜는 중이에요" description="외부 AI 대신 MVP용 태그 추천기로 오늘 상황을 해석하고 있어요." />;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8 safe-bottom">
      <p className="text-sm font-bold text-roseApp">AI 자동추천</p>
      <h1 className="mt-10 text-3xl font-black leading-tight">오늘 상황을 한 문장으로 알려주세요</h1>
      <textarea
        value={today.situationText}
        onChange={(event) => setToday({ ...today, situationText: event.target.value })}
        placeholder="예: 내일 화해하고 싶어"
        className="mt-6 h-36 w-full rounded-[1.75rem] border border-rose-100 bg-zinc-50 p-4 outline-none transition focus:border-roseApp focus:bg-white"
      />
      <div className="mt-6 rounded-[1.75rem] bg-roseSoft p-5 text-sm leading-6 text-rose-700">
        MVP에서는 외부 LLM 대신 문장 안의 상황 키워드를 뽑아 추천해요.
      </div>
      <div className="mt-10">
        <BottomButton onClick={recommend}>한 번에 추천받기</BottomButton>
      </div>
    </main>
  );
}
