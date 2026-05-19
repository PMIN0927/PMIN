export default function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-rose-100">
      <div className="h-full rounded-full bg-roseApp transition-all" style={{ width: `${(step / total) * 100}%` }} />
    </div>
  );
}
