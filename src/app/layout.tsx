import { Bebas_Neue, Kanit, Montserrat } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-montserrat",
});

export const metadata = {
  title: {
    default: "DPS — Distance Per Stroke",
    template: "%s | DPS",
  },
  description:
    "DPS (Distance Per Stroke) ผู้เชี่ยวชาญด้านกีฬาว่ายน้ำแบบครบวงจร — ปฏิทินการแข่งขัน วิเคราะห์ข้อมูล และร้านค้า",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="scroll-smooth">
      <body
        className={`${kanit.variable} ${bebas.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
