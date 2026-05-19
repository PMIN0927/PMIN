import ModeSelectCard from "@/components/ModeSelectCard";

export default function SelectModePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 safe-bottom">
      <p className="text-sm font-bold text-roseApp">오늘 뭐해?</p>
      <h1 className="mt-10 text-3xl font-black leading-tight">어떤 방식으로 코스를 추천받을까요?</h1>
      <div className="mt-8 space-y-4 soft-enter">
        <ModeSelectCard href="/card-mode" emoji="🃏" title="직접 골라서 코스 만들기" description="음식, 카페, 술집 카드를 직접 고르며 코스를 완성해요." />
        <ModeSelectCard href="/ai-mode" emoji="✨" title="AI에게 한 번에 추천받기" description="오늘 상황만 입력하면 취향을 반영해 코스를 짜드려요." />
      </div>
    </main>
  );
}
