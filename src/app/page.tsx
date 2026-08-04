import Link from "next/link";
import {
  Calendar,
  BarChart3,
  Trophy,
  ShoppingBag,
  ArrowRight,
  Droplets,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/Card";
import { getEvents, getResults } from "@/lib/store";
import { formatSwimTime } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";

const features = [
  {
    icon: Calendar,
    title: "ปฏิทินการแข่งขัน",
    desc: "ติดตามการแข่งขันทั้งหมด กรองตามรุ่นอายุและสถานที่",
    href: "/calendar",
    color: "from-brand-500 to-brand-600",
  },
  {
    icon: Trophy,
    title: "ผลการแข่งขัน",
    desc: "ดูผลการแข่งขันแบบเรียลไทม์ พร้อม split times",
    href: "/results",
    color: "from-accent-500 to-accent-600",
  },
  {
    icon: BarChart3,
    title: "วิเคราะห์ข้อมูล",
    desc: "เปรียบเทียบ pacing 2 ชุดข้อมูล side-by-side",
    href: "/analytics",
    color: "from-cyan-500 to-brand-500",
  },
  {
    icon: ShoppingBag,
    title: "ร้านค้า",
    desc: "อุปกรณ์ว่ายน้ำและ merchandise จาก BlueHub",
    href: "/shop",
    color: "from-violet-500 to-accent-500",
  },
];

export default async function HomePage() {
  const [mockEvents, mockResults] = await Promise.all([getEvents(), getResults()]);
  const upcomingEvents = mockEvents.filter((e) => e.status === "upcoming");
  const recentResults = mockResults.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
              <Droplets className="h-4 w-4" />
              United by Water
            </div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              แพลตฟอร์มว่ายน้ำ
              <span className="block text-brand-200">ที่เข้าใจนักกีฬา</span>
            </h1>
            <p className="mt-6 text-lg text-brand-100">
              ปฏิทินการแข่งขัน ผลการแข่งขัน วิเคราะห์ pacing และร้านค้า
              — ทุกอย่างในที่เดียว
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/analytics">
                <Button className="bg-white text-brand-700 hover:bg-brand-50">
                  เริ่มวิเคราะห์ข้อมูล
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  ดูปฏิทินแข่งขัน
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          ฟีเจอร์หลัก
        </h2>
        <p className="mt-2 text-center text-gray-500">
          ทุกสิ่งที่นักกีฬา โค้ช และแฟนว่ายน้ำต้องการ
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Link key={f.href} href={f.href}>
              <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-lg">
                <div
                  className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${f.color} p-3 text-white`}
                >
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-600">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Events + Recent Results */}
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">การแข่งขันที่จะมา</h2>
              <Link href="/calendar" className="text-sm text-brand-600 hover:underline">
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="upcoming">Upcoming</Badge>
                    <h3 className="mt-2 font-semibold text-gray-900">{event.name}</h3>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(event.dateStart), "d MMM yyyy", { locale: th })}
                      {" · "}
                      {event.venue}, {event.city}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">ผลการแข่งขันล่าสุด</h2>
              <Link href="/results" className="text-sm text-brand-600 hover:underline">
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="space-y-3">
              {recentResults.map((result) => (
                <Card key={result.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {result.rank}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{result.athleteName}</p>
                      <p className="text-xs text-gray-500">
                        {result.category} · {result.club}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-semibold text-brand-700">
                    {formatSwimTime(result.time)}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Analytics */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="overflow-hidden bg-gradient-to-r from-brand-600 to-accent-500 p-0 text-white">
          <div className="flex flex-col items-center gap-6 p-10 text-center md:flex-row md:text-left">
            <BarChart3 className="h-16 w-16 shrink-0 opacity-80" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Swimming Dual Analytics</h2>
              <p className="mt-2 text-brand-100">
                เปรียบเทียบสถิติ 2 รายการแข่งขัน side-by-side
                รองรับ CSV และ Google Sheets
              </p>
            </div>
            <Link href="/analytics">
              <Button className="bg-white text-brand-700 hover:bg-brand-50">
                ลองใช้เลย
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </>
  );
}
