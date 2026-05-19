"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomButton from "@/components/BottomButton";
import LoadingScreen from "@/components/LoadingScreen";
import { loadPlaces } from "@/lib/loadPlaces";
import { makeAutoCourse } from "@/lib/recommender";
import { parseSituationTags } from "@/lib/tagParser";
import { loadPreference, loadTodayCondition, saveCourse, saveTodayCondition } from "@/lib/storage";

export default function AiModePage() {
  const router = useRouter();
  const [today, setToday] = useState(loadTodayCondition());
  const [isLoading, setIsLoading] = useState(false);
  const tags = parseSituationTags(today.situationText);

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
    return <LoadingScreen title="오늘 상황을 분석하는 중이에요" description="문장에서 뽑은 키워드와 DB의 분위기, 예산, 회피 조건을 맞춰보고 있어요." />;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8 safe-bottom">
      <p className="text-sm font-bold text-roseApp">AI 자동추천</p>
      <h1 className="mt-10 text-3xl font-black leading-tight">오늘 상황을 한 문장으로 알려주세요</h1>
      <textarea
        value={today.situationText}
        onChange={(event) => setToday({ ...today, situationText: event.target.value })}
        placeholder="예: 오늘은 조용히 화해하고 싶어"
        className="mt-6 h-36 w-full rounded-[1.75rem] border border-rose-100 bg-zinc-50 p-4 outline-none transition focus:border-roseApp focus:bg-white"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-roseSoft px-3 py-1 text-xs font-bold text-rose-700">
            #{tag}
          </span>
        ))}
      </div>
      <div className="mt-6 rounded-[1.75rem] bg-roseSoft p-5 text-sm leading-6 text-rose-700">
        지금 MVP는 실제 외부 AI가 아니라 문장 키워드를 분석해서 추천해요. 화해, 가성비, 실내, 술데이트 같은 단어가 결과에 크게 반영돼요.
      </div>
      <div className="mt-10">
        <BottomButton onClick={recommend}>한 번에 추천받기</BottomButton>
      </div>
    </main>
  );
}
