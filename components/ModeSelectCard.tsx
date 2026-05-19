import Link from "next/link";

type Props = {
  href: string;
  title: string;
  description: string;
  emoji: string;
};

export default function ModeSelectCard({ href, title, description, emoji }: Props) {
  return (
    <Link href={href} className="block rounded-3xl border border-rose-100 bg-white p-5 shadow-card">
      <div className="text-4xl">{emoji}</div>
      <h2 className="mt-4 text-xl font-extrabold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
    </Link>
  );
}
