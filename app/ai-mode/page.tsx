"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BottomButton from "@/components/BottomButton";
import LoadingScreen from "@/components/LoadingScreen";
import { loadPlaces } from "@/lib/loadPlaces";
import { makeAutoCourse } from "@/lib/recommender";
import { parseSituationTags } from "@/lib/tagParser";
import { loadPreference, loadTodayCondition, saveCourse } from "@/lib/storage";

export default function AiModePage() {
  const router = useRouter();
  const today = useMemo(loadTodayCondition, []);
  const preference = useMemo(loadPreference, []);
  const tags = parseSituationTags(today.situationText);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const course = makeAutoCourse(loadPlaces(), preference, today);
      saveCourse(course);
      router.push("/result");
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [preference, router, today]);

  if (isLoading) {
    return (
      <LoadingScreen
        title="오늘 상황을 분석하는 중이에요"
        description={`'${today.situationText || "그냥 추천"}'에서 ${tags.slice(0, 3).join(", ")} 키워드를 뽑아 코스를 만들고 있어요.`}
      />
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8 safe-bottom">
      <h1 className="mt-10 text-3xl font-black leading-tight">추천을 준비하지 못했어요</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-500">다시 시도하면 기존에 입력한 상황으로 바로 추천해드릴게요.</p>
      <div className="mt-10">
        <BottomButton onClick={() => setIsLoading(true)}>다시 추천받기</BottomButton>
      </div>
    </main>
  );
}
