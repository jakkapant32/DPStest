import Link from "next/link";
import { Calendar, Trophy, ShoppingBag, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getEvents, getProducts, getResults } from "@/lib/store";

export default async function AdminDashboardPage() {
  const [events, results, products] = await Promise.all([
    getEvents(),
    getResults(),
    getProducts(),
  ]);

  const stats = [
    {
      label: "การแข่งขัน",
      count: events.length,
      href: "/admin/events",
      icon: Calendar,
      color: "text-dps-blue bg-dps-cyan/10",
    },
    {
      label: "ผลการแข่งขัน",
      count: results.length,
      href: "/admin/results",
      icon: Trophy,
      color: "text-dps-cyan bg-dps-cyan/10",
    },
    {
      label: "สินค้า",
      count: products.length,
      href: "/admin/products",
      icon: ShoppingBag,
      color: "text-cyan-600 bg-cyan-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-slate-500">จัดการข้อมูล DPS</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{s.count}</p>
                </div>
                <div className={`rounded-xl p-3 ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 flex items-center text-sm text-dps-cyan opacity-0 transition-opacity group-hover:opacity-100">
                จัดการ <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8" title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/events"
            className="rounded-lg bg-dps-cyan/10 px-4 py-2 text-sm font-medium text-dps-navy hover:bg-dps-cyan/20"
          >
            + เพิ่มการแข่งขัน
          </Link>
          <Link
            href="/admin/results"
            className="rounded-lg bg-dps-cyan/10 px-4 py-2 text-sm font-medium text-dps-navy hover:bg-dps-cyan/20"
          >
            + เพิ่มผลการแข่งขัน
          </Link>
          <Link
            href="/admin/products"
            className="rounded-lg bg-dps-cyan/10 px-4 py-2 text-sm font-medium text-dps-navy hover:bg-dps-cyan/20"
          >
            + เพิ่มสินค้า
          </Link>
        </div>
      </Card>
    </div>
  );
}
