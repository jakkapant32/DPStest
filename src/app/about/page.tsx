import { Card } from "@/components/ui/Card";
import { Waves, Target, Heart, Users } from "lucide-react";

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
    icon: Waves,
    title: "United by Water",
    desc: "โลกที่เชื่อมด้วยน้ำ เพื่อสุขภาพ ชีวิต และกีฬา",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          เกี่ยวกับ <span className="text-gradient">BlueHub</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          แพลตฟอร์มว่ายน้ำที่รวมปฏิทินการแข่งขัน ผลการแข่งขัน
          การวิเคราะห์ข้อมูล และร้านค้าไว้ในที่เดียว
        </p>
      </div>

      <Card className="mx-auto mt-12 max-w-4xl">
        <h2 className="text-xl font-bold text-gray-900">วิสัยทัศน์</h2>
        <p className="mt-3 text-gray-600 leading-relaxed">
          BlueHub มุ่งเป็นแพลตฟอร์มว่ายน้ำชั้นนำในภูมิภาค
          ที่ช่วยให้นักกีฬา โค้ช และสโมสรเข้าถึงข้อมูลการแข่งขัน
          และเครื่องมือวิเคราะห์ที่ทรงพลัง — ด้วย UX ที่สนุก สดใส และใช้งานง่าย
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          เราเชื่อว่าข้อมูลคือกุญแจสู่การพัฒนาผลงาน
          จึงออกแบบ Swimming Dual Analytics ให้เปรียบเทียบ pacing
          ระหว่างนักกีฬาและการแข่งขันได้อย่างชัดเจน
        </p>
      </Card>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <Card key={v.title} className="text-center">
            <div className="mx-auto mb-4 inline-flex rounded-xl bg-brand-50 p-3 text-brand-600">
              <v.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900">{v.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{v.desc}</p>
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
              <p className="font-medium text-gray-900">Phase 1 — Core Platform</p>
              <p className="text-sm text-gray-500">
                Calendar, Results, Data Analytics, Shop, About Us
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              2
            </span>
            <div>
              <p className="font-medium text-gray-900">Phase 2 — Video Analysis</p>
              <p className="text-sm text-gray-500">
                อัพโหลดคลิปว่ายน้ำ → วิเคราะห์ stroke และ pacing อัตโนมัติ
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
