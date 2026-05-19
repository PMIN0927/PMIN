import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘 뭐해?",
  description: "서면/전포 데이트 코스 추천 MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <main className="phone-shell shadow-phone">{children}</main>
      </body>
    </html>
  );
}
