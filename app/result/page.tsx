"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomButton from "@/components/BottomButton";
import CourseMap from "@/components/CourseMap";
import CourseSummary from "@/components/CourseSummary";
import { loadCourse } from "@/lib/storage";
import type { Course, Place } from "@/types/place";

export default function ResultPage() {
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    setCourse(loadCourse());
  }, []);

  if (!course) {
    return (
      <main className="flex min-h-screen flex-col bg-white px-6 py-8 safe-bottom">
        <header className="flex items-center justify-between">
          <Link href="/select-mode" className="rounded-full bg-zinc-50 px-4 py-2 text-sm font-black text-zinc-500">
            뒤로
          </Link>
          <p className="text-sm font-black text-ink">오늘 뭐해?</p>
          <span className="w-[58px]" />
        </header>

        <section className="m-auto w-full max-w-sm text-center">
          <p className="text-5xl">🗺️</p>
          <h1 className="mt-5 text-2xl font-black text-ink">아직 완성된 코스가 없어요</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">카드로 장소를 고르거나 자동 추천을 받으면 여기에서 코스를 볼 수 있어요.</p>
          <div className="mt-8">
            <BottomButton href="/select-mode">추천 다시 받기</BottomButton>
          </div>
        </section>
      </main>
    );
  }

  const places = [course.mealPlace, course.cafePlace, course.barPlace, ...course.waypoints].filter(Boolean) as Place[];

  return (
    <main className="min-h-screen space-y-5 bg-white px-5 py-6 safe-bottom">
      <header className="flex items-center justify-between">
        <Link href="/select-mode" className="grid h-10 w-10 place-items-center rounded-full bg-zinc-50 text-lg font-black text-zinc-700">
          ‹
        </Link>
        <p className="text-sm font-black text-ink">오늘 뭐해?</p>
        <Link href="/today" className="rounded-full bg-zinc-50 px-4 py-2 text-xs font-black text-zinc-500">
          다시 입력
        </Link>
      </header>

      <section className="pt-1">
        <p className="text-xs font-black text-roseApp">추천 코스 완성</p>
        <h1 className="mt-2 text-[1.65rem] font-black leading-tight text-ink">{course.title}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">{course.reason}</p>
      </section>

      <CourseMap course={course} />
      <CourseSummary course={course} />

      <section className="rounded-[1.75rem] bg-zinc-50 p-4">
        <h2 className="text-base font-black text-ink">지도 앱에서 확인하기</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-500">앱 안 지도는 발표용 MVP라 직선 연결로 보여줘요. 실제 이동은 지도 앱에서 확인해주세요.</p>
        <div className="mt-3 grid gap-2">
          {places.slice(0, 4).map((place, index) => {
            const mapUrl = place.kakaoMapUrl || place.naverMapUrl;
            return (
              <a
                key={`${place.id}-${index}`}
                href={mapUrl || "#"}
                target="_blank"
                className={`rounded-2xl bg-white px-4 py-3 text-sm font-bold shadow-sm ${mapUrl ? "text-rose-700" : "pointer-events-none text-zinc-300"}`}
              >
                {index + 1}. {place.name} 지도 보기
              </a>
            );
          })}
        </div>
      </section>

      <Link href="/card-mode" className="block rounded-2xl bg-zinc-100 px-5 py-4 text-center font-bold text-zinc-700">
        카드로 다시 고르기
      </Link>
    </main>
  );
}
