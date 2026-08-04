import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import { Card, Badge, Button, SectionHeader } from "@/components/ui/Card";
import { getEvents, getProducts, getResults } from "@/lib/store";
import { formatSwimTime } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";

const services = [
  {
    icon: Trophy,
    title: "จัดการแข่งขันกีฬาว่ายน้ำ",
    desc: "รับจัดอีเวนต์และทัวร์นาเมนต์ว่ายน้ำทุกระดับ ด้วยระบบการจัดการที่ได้มาตรฐานสากล",
    href: "/calendar",
    color: "text-dps-blue group-hover:bg-dps-blue",
  },
  {
    icon: Activity,
    title: "วิเคราะห์ข้อมูล (Data Analytics)",
    desc: "เจาะลึกสถิติและประสิทธิภาพการว่ายน้ำ (Distance Per Stroke) ด้วยเทคโนโลยี",
    href: "/analytics",
    color: "text-dps-cyan group-hover:bg-dps-cyan",
  },
  {
    icon: ShieldCheck,
    title: "ผลการแข่งขัน",
    desc: "ระบบรายงานผลการแข่งขัน พร้อม split times และการกรองข้อมูล",
    href: "/results",
    color: "text-dps-navy group-hover:bg-dps-navy",
  },
];

export default async function HomePage() {
  const [events, results, products] = await Promise.all([
    getEvents(),
    getResults(),
    getProducts(),
  ]);
  const upcomingEvents = events.filter((e) => e.status === "upcoming").slice(0, 3);
  const recentResults = results.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="hero-bg clip-slant relative flex min-h-[600px] h-[85vh] items-center">
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-block rounded-full border border-dps-cyan/30 bg-dps-cyan/20 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-dps-cyan">
              Thailand&apos;s Premier Swimming Agency
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-7xl">
              <span className="whitespace-nowrap">ยกระดับศักยภาพนักว่ายน้ำ</span>
              <br />
              <span className="text-gradient">สู่เวทีระดับโลก</span>
            </h1>
            <p className="mb-10 max-w-3xl text-lg font-light leading-relaxed text-slate-300 md:text-xl">
              DPS (Distance Per Stroke) ผู้เชี่ยวชาญด้านกีฬาว่ายน้ำแบบครบวงจร{" "}
              <span className="whitespace-nowrap">
                ตั้งแต่การจัดการแข่งขัน วิเคราะห์ข้อมูลเชิงลึก ไปจนถึงสปอร์ตแฟชั่น
              </span>
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/analytics">
                <Button size="lg" className="group w-full sm:w-auto">
                  ดูบริการของเรา
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  ปรึกษาผู้เชี่ยวชาญ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="OUR EXPERTISE" title="บริการครบวงจรเพื่อวงการว่ายน้ำ" />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link key={s.href} href={s.href}>
                <Card variant="muted" className="group h-full p-8">
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm transition-colors group-hover:text-white ${s.color}`}
                  >
                    <s.icon className="h-7 w-7" />
                  </div>
                  <h4 className="mb-3 text-xl font-bold text-slate-800">{s.title}</h4>
                  <p className="leading-relaxed text-slate-600">{s.desc}</p>
                </Card>
              </Link>
            ))}

            <Card variant="muted" className="group p-8 lg:col-span-1">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="mb-2 text-xl font-bold text-slate-800">
                    จัดหาทุนและสถานที่เรียนต่อต่างประเทศ
                  </h4>
                  <p className="max-w-2xl leading-relaxed text-slate-600">
                    บริการให้คำปรึกษาและประสานงานจัดหาทุนการศึกษากีฬา (Sports Scholarship)
                  </p>
                </div>
              </div>
            </Card>

            <Link href="/shop" className="lg:col-span-2">
              <Card className="group relative flex h-full min-h-[200px] flex-col justify-center overflow-hidden bg-gradient-to-br from-dps-navy to-dps-blue p-8 text-white">
                <ShoppingBag className="absolute -bottom-10 -right-10 h-64 w-64 opacity-10 transition-transform duration-500 group-hover:scale-110" />
                <h4 className="font-bebas relative z-10 mb-2 text-3xl tracking-wide">
                  DPS OFFICIAL STORE
                </h4>
                <p className="relative z-10 mb-6 font-light text-slate-300">
                  สินค้าที่ระลึกและสปอร์ตแฟชั่นดีไซน์ล้ำ สำหรับคนรักกีฬาว่ายน้ำ
                </p>
                <span className="relative z-10 inline-flex w-fit items-center font-semibold text-dps-cyan transition-colors group-hover:text-white">
                  ช้อปเลย <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Analytics showcase */}
      <section className="pattern-bg border-y border-slate-200 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <div className="relative w-full lg:w-1/2">
              <div className="absolute inset-0 rotate-3 scale-105 rounded-3xl bg-gradient-to-tr from-dps-cyan/20 to-dps-blue/20" />
              <Card className="relative z-10 rounded-3xl p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800">Stroke Efficiency Analysis</h5>
                    <p className="text-xs text-slate-500">Real-time Data Tracking</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    +12.5% DPS
                  </span>
                </div>
                <div className="flex h-48 items-end justify-between gap-2 px-2">
                  {[40, 55, 70, 65, 85, 100].map((h, i) => (
                    <div
                      key={i}
                      className="relative w-1/6 rounded-t-md bg-slate-100"
                      style={{ height: `${h}%` }}
                    >
                      <div
                        className={`absolute inset-0 rounded-t-md ${
                          i === 5
                            ? "bg-dps-cyan shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                            : i >= 2
                              ? "bg-dps-blue/80"
                              : "bg-dps-cyan/80"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="w-full lg:w-1/2">
              <h3 className="mb-6 text-3xl font-bold leading-tight text-dps-navy md:text-4xl">
                เปลี่ยนสถิติ ให้เป็น <span className="text-dps-cyan">ชัยชนะ</span>
              </h3>
              <p className="mb-8 text-lg leading-relaxed text-slate-600">
                หัวใจหลักของ DPS คือการนำหลักวิทยาศาสตร์การกีฬาและ Data Analytics มาประยุกต์ใช้
                เพื่อพัฒนาศักยภาพนักกีฬาอย่างตรงจุด
              </p>
              <ul className="mb-8 space-y-4">
                {[
                  "วิเคราะห์เชิงลึกเพื่อเพิ่มระยะทางต่อสโตรก",
                  "เปรียบเทียบ pacing 2 ชุดข้อมูล side-by-side",
                  "รองรับ CSV และ Google Sheets",
                ].map((text) => (
                  <li key={text} className="flex items-center text-slate-700">
                    <CheckCircle2 className="mr-3 h-6 w-6 text-dps-cyan" />
                    {text}
                  </li>
                ))}
              </ul>
              <Link href="/analytics">
                <Button variant="outline">เริ่มวิเคราะห์ข้อมูล</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Events + Results */}
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-dps-navy">การแข่งขันที่จะมา</h2>
              <Link href="/calendar" className="text-sm text-dps-cyan hover:underline">
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id} variant="muted" className="p-5">
                  <Badge variant="upcoming">Upcoming</Badge>
                  <h3 className="mt-2 font-semibold text-slate-800">{event.name}</h3>
                  <p className="text-sm text-slate-500">
                    {format(parseISO(event.dateStart), "d MMM yyyy", { locale: th })}
                    {" · "}
                    {event.venue}, {event.city}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-dps-navy">ผลการแข่งขันล่าสุด</h2>
              <Link href="/results" className="text-sm text-dps-cyan hover:underline">
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="space-y-3">
              {recentResults.map((result) => (
                <Card key={result.id} variant="muted" className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dps-cyan/20 text-sm font-bold text-dps-navy">
                      {result.rank}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800">{result.athleteName}</p>
                      <p className="text-xs text-slate-500">
                        {result.category} · {result.club}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-semibold text-dps-cyan">
                    {formatSwimTime(result.time)}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Store preview */}
      <section className="bg-dps-dark py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-end justify-between md:flex-row">
            <div>
              <h2 className="font-bebas mb-2 text-2xl tracking-widest text-dps-cyan">
                MERCHANDISE
              </h2>
              <h3 className="text-3xl font-bold md:text-5xl">
                DPS OFFICIAL <span className="font-bebas tracking-wider">STORE</span>
              </h3>
            </div>
            <Link
              href="/shop"
              className="mt-4 flex items-center font-medium text-slate-300 hover:text-dps-cyan md:mt-0"
            >
              ดูสินค้าทั้งหมด <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <Card key={p.id} variant="dark" className="overflow-hidden p-0">
                <div className="flex h-48 items-center justify-center bg-slate-700 p-8">
                  <ShoppingBag className="h-16 w-16 text-slate-500" />
                </div>
                <div className="p-6">
                  <h4 className="mb-1 text-lg font-bold transition-colors hover:text-dps-cyan">
                    {p.name}
                  </h4>
                  <p className="mb-4 text-sm text-slate-400">{p.description}</p>
                  <span className="text-xl font-bold">฿{p.price.toLocaleString()}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
