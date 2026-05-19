"use client";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
};

export default function BottomButton({ children, onClick, href, disabled }: Props) {
  const className =
    "block w-full rounded-2xl bg-roseApp px-5 py-4 text-center text-base font-bold text-white shadow-card transition active:scale-[0.99] disabled:bg-rose-200";
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
