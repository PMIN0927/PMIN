"use client";

type Props = {
  label: string;
  icon?: string;
  description?: string;
  selected?: boolean;
  onClick: () => void;
};

export default function OptionCard({ label, icon, description, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[118px] rounded-[26px] border p-4 text-left shadow-sm transition active:scale-[0.98] ${
        selected ? "border-roseApp bg-roseSoft text-rose-700 shadow-card" : "border-zinc-100 bg-zinc-50 text-ink hover:bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-2xl">{icon}</span>
        <span className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] font-black ${selected ? "border-roseApp bg-roseApp text-white" : "border-zinc-200 bg-white text-transparent"}`}>✓</span>
      </div>
      <p className="mt-4 text-[15px] font-black">{label}</p>
      {description && <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">{description}</p>}
    </button>
  );
}
