export const siteConfig = {
  name: "BlueHub",
  tagline: "United by Water",
  description:
    "แพลตฟอร์มว่ายน้ำครบวงจร — ปฏิทินการแข่งขัน ผลการแข่งขัน วิเคราะห์ข้อมูล และร้านค้า",
  nav: [
    { href: "/calendar", label: "ปฏิทินการแข่งขัน", labelEn: "Calendar" },
    { href: "/results", label: "ผลการแข่งขัน", labelEn: "Results" },
    { href: "/analytics", label: "วิเคราะห์ข้อมูล", labelEn: "Data Analytics" },
    { href: "/shop", label: "ร้านค้า", labelEn: "Shop" },
    { href: "/about", label: "เกี่ยวกับเรา", labelEn: "About Us" },
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
