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
    <main className="flex min-h-screen flex-col bg-white px-6 py-5 safe-bottom">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-300">Seomyeon · Jeonpo</p>
          <p className="mt-1 text-sm font-black text-ink">오늘 뭐해?</p>
        </div>
        <span className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-black text-zinc-500">MVP</span>
      </header>

      <section className="flex flex-1 flex-col justify-center pb-10 text-center">
        <div className="mx-auto grid h-28 w-28 place-items-center rounded-[36px] bg-roseSoft text-6xl shadow-card">💗</div>
        <h1 className="mx-auto mt-10 max-w-[320px] text-[27px] font-black leading-[1.25] text-ink">
          오늘 데이트 예정이신가요?
        </h1>
        <p className="mx-auto mt-4 max-w-[310px] text-[15px] leading-7 text-zinc-500">
          두 분의 분위기에 어울리는 식사, 카페나 술집, 중간에 들를 곳까지 한 번에 추천해드릴게요.
        </p>

        <div className="mt-9 grid grid-cols-3 gap-2">
          {[
            ["식사", "맛집부터"],
            ["무드", "상황 맞춤"],
            ["지도", "동선까지"]
          ].map(([title, desc]) => (
            <div key={title} className="rounded-3xl bg-zinc-50 px-3 py-4">
              <p className="text-sm font-black text-ink">{title}</p>
              <p className="mt-1 text-xs font-bold text-zinc-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <BottomButton href="/onboarding">추천 받으러 가기</BottomButton>
    </main>
  );
}
