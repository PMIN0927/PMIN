"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomButton from "@/components/BottomButton";
import { isOnboardingComplete } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    if (isOnboardingComplete()) router.replace("/today");
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col px-6 py-8 safe-bottom">
      <div className="mt-10">
        <p className="text-sm font-bold text-roseApp">오늘 뭐해?</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-ink">오늘 데이트 예정이신가요?</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-500">두 분의 분위기에 어울리는 코스를 추천해드릴게요.</p>
      </div>
      <div className="mt-14 rounded-[2rem] bg-roseSoft p-8 text-center shadow-card">
        <div className="text-7xl">💗</div>
        <p className="mt-5 text-sm font-semibold leading-6 text-rose-700">식사부터 카페, 술집, 중간에 들를 곳까지 한 번에 묶어드려요.</p>
      </div>
      <div className="mt-auto">
        <BottomButton href="/onboarding">추천 받으러 가기</BottomButton>
      </div>
    </main>
  );
}
