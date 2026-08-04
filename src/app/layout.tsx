import { Sarabun } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
});

export const metadata = {
  title: {
    default: "BlueHub — United by Water",
    template: "%s | BlueHub",
  },
  description:
    "แพลตฟอร์มว่ายน้ำครบวงจร — ปฏิทินการแข่งขัน ผลการแข่งขัน วิเคราะห์ข้อมูล และร้านค้า",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} font-sans antialiased`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
