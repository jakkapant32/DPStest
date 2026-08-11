export const siteConfig = {
  name: "DPS",
  fullName: "Distance Per Stroke",
  tagline: "Distance Per Stroke",
  description:
    "DPS ผู้เชี่ยวชาญด้านกีฬาว่ายน้ำแบบครบวงจร — จัดการแข่งขัน วิเคราะห์ข้อมูล และสปอร์ตแฟชั่น",
  nav: [
    { href: "/events", label: "จัดการแข่งขัน", labelEn: "Events" },
    { href: "/analytics", label: "วิเคราะห์ข้อมูล", labelEn: "Analytics" },
    { href: "/results", label: "รายงานผลการแข่งขัน", labelEn: "Results" },
    { href: "/agency", label: "เอเจนซี่นักกีฬา", labelEn: "Agency" },
    { href: "/education", label: "การศึกษา & ทุน", labelEn: "Education" },
    { href: "/media", label: "สื่อ & Portfolio", labelEn: "Media" },
    { href: "/shop", label: "สปอร์ตแฟชั่น", labelEn: "Store" },
  ],
};

export type Stroke = "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "medley";
export type Gender = "male" | "female";
export type EventStatus = "upcoming" | "live" | "completed";

export interface SwimEvent {
  id: string;
  name: string;
  dateStart: string;
  dateEnd: string;
  venue: string;
  city: string;
  status: EventStatus;
  description?: string;
}

export interface Athlete {
  id: string;
  name: string;
  gender: Gender;
  ageGroup: string;
  club: string;
}

export interface RaceResult {
  id: string;
  eventId: string;
  category: string;
  stroke: Stroke;
  distance: number;
  gender: Gender;
  ageGroup: string;
  athleteId: string;
  athleteName: string;
  club: string;
  rank: number;
  time: number;
  splits: Record<string, number>;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

export interface SwimRecord {
  athlete: string;
  gender: Gender;
  ageGroup: string;
  club: string;
  stroke: string;
  distance: number;
  splits: Record<string, number>;
  totalTime: number;
}

export interface AnalyticsDataset {
  name: string;
  records: SwimRecord[];
}
