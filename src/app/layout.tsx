import type { Metadata, Viewport } from "next";
import { Noto_Serif_SC } from "next/font/google";
import "./globals.css";

// 标题字体：思源宋体，增加文艺感
const serifFont = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "恋人笔记本 💕",
  description: "记录属于你们的故事",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#5a7d8a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={serifFont.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
