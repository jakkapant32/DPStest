import type { LucideIcon } from "lucide-react";
import { Calendar, Trophy } from "lucide-react";

export interface EventsTool {
  href: string;
  title: string;
  tabLabel: string;
  description: string;
  icon: LucideIcon;
}

export const eventsMenuHref = "/events";

export const eventsTools: EventsTool[] = [
  {
    href: "/calendar",
    title: "ปฏิทินการแข่งขัน",
    tabLabel: "ปฏิทินการแข่งขัน",
    description:
      "ดูตารางการแข่งขันที่จะมา กรองตามสถานะ และติดตามรายละเอียดสถานที่จัดงาน",
    icon: Calendar,
  },
  {
    href: "/results",
    title: "ผลการแข่งขัน",
    tabLabel: "ผลการแข่งขัน",
    description:
      "ระบบรายงานผลอย่างเป็นทางการ พร้อม Split Times ตัวกรอง และไฮไลท์แถวเมื่อชี้เมาส์",
    icon: Trophy,
  },
];
