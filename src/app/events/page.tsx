import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/Card";
import { eventsTools } from "@/lib/events-menu";
import { getEvents } from "@/lib/store";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";

export const metadata = {
  title: "จัดการแข่งขัน",
};

export default async function EventsHubPage() {
  const events = await getEvents();
  const upcomingCount = events.filter((e) => e.status === "upcoming").length;
  const completedCount = events.filter((e) => e.status === "completed").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="EVENT MANAGEMENT"
        title="จัดการแข่งขัน"
        className="mb-4"
      />
      <p className="mb-10 text-center text-slate-500">
        ศูนย์กลางการจัดการแข่งขัน — ติดตามปฏิทินและผลการแข่งขันได้ในที่เดียว
      </p>

      <div className="mb-10 flex justify-center gap-6 text-center text-sm">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-3 shadow-sm">
          <p className="font-bold text-dps-navy">{upcomingCount}</p>
          <p className="text-slate-500">การแข่งขันที่จะมา</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-3 shadow-sm">
          <p className="font-bold text-dps-navy">{completedCount}</p>
          <p className="text-slate-500">การแข่งขันที่จบแล้ว</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {eventsTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-dps-cyan/40 hover:shadow-md"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-dps-cyan/10 text-dps-cyan transition group-hover:bg-dps-cyan group-hover:text-white">
              <tool.icon className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">{tool.title}</h3>
            <p className="mb-6 leading-relaxed text-slate-600">{tool.description}</p>
            <span className="inline-flex items-center text-sm font-semibold text-dps-navy group-hover:text-dps-cyan">
              เปิดใช้งาน
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      {events.filter((e) => e.status === "upcoming").length > 0 && (
        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="mb-4 font-bold text-dps-navy">การแข่งขันที่ใกล้ที่สุด</h3>
          <ul className="space-y-3">
            {events
              .filter((e) => e.status === "upcoming")
              .slice(0, 3)
              .map((event) => (
                <li
                  key={event.id}
                  className="flex flex-col justify-between gap-1 rounded-lg bg-white px-4 py-3 sm:flex-row sm:items-center"
                >
                  <span className="font-medium text-slate-800">{event.name}</span>
                  <span className="text-sm text-slate-500">
                    {format(parseISO(event.dateStart), "d MMM yyyy", { locale: th })}
                    {" · "}
                    {event.city}
                  </span>
                </li>
              ))}
          </ul>
          <Link
            href="/calendar"
            className="mt-4 inline-block text-sm font-medium text-dps-cyan hover:underline"
          >
            ดูปฏิทินทั้งหมด →
          </Link>
        </div>
      )}
    </div>
  );
}
