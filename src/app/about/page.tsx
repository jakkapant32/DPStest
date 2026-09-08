import { Activity, Heart, Target, Users } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui/Card";

export const metadata = {
  title: "เกี่ยวกับเรา",
};

const values = [
  {
    icon: Heart,
    title: "สนุก สดใส",
    desc: "กีฬาว่ายน้ำควรเข้าถึงได้และสนุกสำหรับทุกคน",
  },
  {
    icon: Target,
    title: "ข้อมูลนำทาง",
    desc: "ใช้ข้อมูลและ analytics ช่วยนักกีฬาพัฒนาผลงาน",
  },
  {
    icon: Users,
    title: "ชุมชน",
    desc: "เชื่อมโยงสโมสร โค้ช นักกีฬา และแฟนกีฬา",
  },
  {
    icon: Activity,
    title: "Distance Per Stroke",
    desc: "โลกที่เชื่อมด้วยน้ำ เพื่อสุขภาพ ชีวิต และกีฬา",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="ABOUT US"
        title="เกี่ยวกับ DPS"
        className="mb-12"
      />

      <Card className="mx-auto max-w-4xl">
        <h2 className="text-xl font-bold text-dps-navy">วิสัยทัศน์</h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          DPS (Distance Per Stroke) มุ่งเป็นแพลตฟอร์มว่ายน้ำชั้นนำในภูมิภาค
          ที่ช่วยให้นักกีฬา โค้ช และสโมสรเข้าถึงข้อมูลการแข่งขัน
          และเครื่องมือวิเคราะห์ที่ทรงพลัง
        </p>
        <p className="mt-4 leading-relaxed text-slate-600">
          เราเชื่อว่าข้อมูลคือกุญแจสู่การพัฒนาผลงาน
          จึงออกแบบ Analytics ให้เปรียบเทียบ pacing
          ระหว่างนักกีฬาและการแข่งขันได้อย่างชัดเจน
        </p>
      </Card>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <Card key={v.title} variant="muted" className="text-center">
            <div className="mx-auto mb-4 inline-flex rounded-xl bg-white p-3 text-dps-cyan shadow-sm">
              <v.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-800">{v.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{v.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="mx-auto mt-12 max-w-4xl" title="Roadmap">
        <div className="space-y-4">
          <div className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
              1
            </span>
            <div>
              <p className="font-medium text-slate-800">Phase 1 — Core Platform</p>
              <p className="text-sm text-slate-500">
                Calendar, Results, Data Analytics, Store, About Us
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
              2
            </span>
            <div>
              <p className="font-medium text-slate-800">Phase 2 — Video Analysis</p>
              <p className="text-sm text-slate-500">
                อัปโหลดคลิป → แท็กระยะ×เวลา (Mako-style) + AI Suggest — ดูที่ /analytics/video
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dps-cyan/20 text-sm font-bold text-dps-navy">
              2.5
            </span>
            <div>
              <p className="font-medium text-slate-800">Phase 2.5 — Stroke metrics</p>
              <p className="text-sm text-slate-500">
                Stroke count / stroke rate และติดตามหลายลู่พร้อมกัน
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
