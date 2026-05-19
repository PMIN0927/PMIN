type Props = {
  title?: string;
  description?: string;
};

export default function LoadingScreen({ title = "코스를 고르는 중이에요", description = "오늘 기분과 취향에 맞는 장소를 살펴보고 있어요." }: Props) {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-8 safe-bottom">
      <div className="w-full text-center">
        <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-roseSoft shadow-card">
          <div className="h-14 w-14 animate-pulse rounded-full bg-roseApp" />
        </div>
        <h1 className="mt-10 text-2xl font-black text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">{description}</p>
        <div className="mx-auto mt-8 h-1.5 w-44 overflow-hidden rounded-full bg-rose-100">
          <div className="h-full w-2/3 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-roseApp" />
        </div>
      </div>
    </main>
  );
}
