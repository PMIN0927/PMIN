import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap"
});

export const metadata: Metadata = {
  title: "오늘 뭐해?",
  description: "서면/전포 데이트 코스 추천 MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={notoSansKr.variable}>
        <main className="phone-shell shadow-phone">{children}</main>
      </body>
    </html>
  );
}
