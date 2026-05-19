"use client";

type Props = {
  label: string;
  selected?: boolean;
  onClick: () => void;
};

export default function OptionCard({ label, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold shadow-card transition ${
        selected ? "border-roseApp bg-roseSoft text-rose-700" : "border-rose-100 bg-white text-ink"
      }`}
    >
      {label}
    </button>
  );
}
