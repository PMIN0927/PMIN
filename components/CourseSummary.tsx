import type { Course, Place } from "@/types/place";
import PlaceCard from "./PlaceCard";

export default function CourseSummary({ course }: { course: Course }) {
  const mainPlaces = [course.mealPlace, course.cafePlace, course.barPlace].filter(Boolean) as Place[];
  const tags = course.extractedTags || [];

  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] bg-roseApp p-5 text-white shadow-card">
        <p className="text-sm font-bold opacity-80">선택된 코스</p>
        <h2 className="mt-2 text-2xl font-black">이 순서로 가보세요</h2>
        <p className="mt-3 text-sm leading-6 opacity-90">식사, 카페나 술집, 그리고 중간에 들르기 좋은 장소를 오늘 상황에 맞춰 묶었어요.</p>
        <div className="mt-4 rounded-2xl bg-white/20 p-3 text-sm font-bold">예상 이동거리 약 {course.totalDistance.toFixed(1)}km</div>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 5).map((tag) => (
              <span key={tag} className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {mainPlaces.map((place, index) => (
          <div key={place.id} className="relative">
            <div className="absolute left-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-roseApp text-sm font-black text-white shadow-card">
              {index + 1}
            </div>
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
