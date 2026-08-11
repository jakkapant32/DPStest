import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Building,
  Layers,
} from "lucide-react";

export interface AnalyticsTool {
  href: string;
  title: string;
  tabLabel: string;
  description: string;
  icon: LucideIcon;
  sampleHint?: string;
}

export const analyticsTools: AnalyticsTool[] = [
  {
    href: "/analytics/single-club",
    title: "วิเคราะห์ข้อมูล (ทีละ 1 สโมสร)",
    tabLabel: "ทีละ 1 สโมสร",
    description:
      "Swimming Data Analytics — โหลด CSV/Sheets แล้วเลือกสโมสรทีละรายการเพื่อเปรียบเทียบนักกีฬา",
    icon: Building,
    sampleHint: "200FR M&F",
  },
  {
    href: "/analytics/multi-club",
    title: "วิเคราะห์ข้อมูล (หลายสโมสร)",
    tabLabel: "หลายสโมสร",
    description:
      "เลือกได้มากกว่า 1 สโมสร — เปรียบเทียบ Pacing/Cumulative พร้อมไฮไลท์เส้นกราฟ",
    icon: Building2,
    sampleHint: "200FR M&F",
  },
  {
    href: "/analytics/multi-event",
    title: "วิเคราะห์ข้อมูล (หลายรายการแข่งขัน)",
    tabLabel: "หลายรายการ",
    description:
      "Multi-Event — นำเข้าหลายไฟล์/หลายรายการ พร้อมตั้งชื่อ tag เปรียบเทียบข้าม event",
    icon: Layers,
    sampleHint: "200FR + 1500M",
  },
  {
    href: "/analytics/compare",
    title: "เปรียบเทียบ 2 รายการ",
    tabLabel: "เปรียบเทียบ 2 รายการ",
    description: "Dual Analytics — เปรียบเทียบ 2 ชุดข้อมูล side-by-side",
    icon: BarChart3,
  },
];
