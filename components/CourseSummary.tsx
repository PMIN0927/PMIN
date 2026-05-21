import type { Course, Place } from "@/types/place";
import PlaceCard from "./PlaceCard";

export default function CourseSummary({ course }: { course: Course }) {
  const mainPlaces = [course.mealPlace, course.cafePlace, course.barPlace].filter(Boolean) as Place[];
  const tags = course.extractedTags || [];
  const proofItems = [
    tags.length > 0 ? `상황 키워드 ${tags.slice(0, 3).join(", ")}` : "상황 키워드 분석",
    "선택 시간 영업 중",
    "예산 조건 우선 반영",
    "장소 역할별 코스 구성"
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] bg-roseApp p-5 text-white shadow-card">
        <p className="text-sm font-bold opacity-80">선택된 코스</p>
        <h2 className="mt-2 text-2xl font-black">이 순서로 가보세요</h2>
        <p className="mt-3 text-sm leading-6 opacity-90">오늘 입력한 상황, 예산, 운영시간을 함께 보고 코스를 묶었어요.</p>
        <div className="mt-4 rounded-2xl bg-white/20 p-3 text-sm font-bold">예상 이동거리 약 {course.totalDistance.toFixed(1)}km</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {proofItems.map((item) => (
            <span key={item} className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-[1.75rem] bg-zinc-50 p-5">
        <h2 className="text-lg font-black text-ink">추천 근거</h2>
        <div className="mt-3 grid gap-2 text-sm">
          {proofItems.map((item) => (
            <div key={item} className="rounded-2xl bg-white px-4 py-3 font-bold text-zinc-600 shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {mainPlaces.map((place, index) => (
          <div key={place.id} className="relative">
            <div className="absolute left-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-roseApp text-sm font-black text-white shadow-card">{index + 1}</div>
            <div className="pl-1">
              <PlaceCard place={place} compact />
            </div>
          </div>
        ))}
      </div>

      {course.waypoints.length > 0 && (
        <div className="rounded-[1.75rem] bg-zinc-50 p-5">
          <h2 className="text-lg font-black">중간에 들러보기 좋은 곳</h2>
          <div className="mt-3 space-y-2">
            {course.waypoints.slice(0, 5).map((place) => (
              <div key={place.id} className="rounded-2xl bg-white p-3 shadow-sm">
                <p className="font-bold">{place.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{place.description || place.detailCategory || "짧게 들르기 좋은 후보"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
