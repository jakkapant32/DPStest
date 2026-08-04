"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar as CalendarIcon, Filter, MapPin } from "lucide-react";
import { Card, Badge, Button, SectionHeader } from "@/components/ui/Card";
import type { EventStatus, SwimEvent } from "@/lib/types";

const statusLabels: Record<EventStatus, string> = {
  upcoming: "Upcoming",
  live: "Live",
  completed: "Completed",
};

export function CalendarClient({ initialEvents }: { initialEvents: SwimEvent[] }) {
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");

  const filteredEvents = useMemo(() => {
    const sorted = [...initialEvents].sort(
      (a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime()
    );
    if (statusFilter === "all") return sorted;
    return sorted.filter((e) => e.status === statusFilter);
  }, [initialEvents, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="EVENTS" title="ปฏิทินการแข่งขัน" className="mb-8" />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">สถานะ:</span>
          {(["all", "upcoming", "live", "completed"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "primary" : "outline"}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "ทั้งหมด" : statusLabels[s]}
            </Button>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card className="py-12 text-center text-slate-500">ไม่พบการแข่งขัน</Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} variant="muted" className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-dps-cyan/20 text-dps-navy">
                  <span className="text-xs font-medium">
                    {format(parseISO(event.dateStart), "MMM", { locale: th })}
                  </span>
                  <span className="text-lg font-bold leading-none">
                    {format(parseISO(event.dateStart), "d")}
                  </span>
                </div>
                <div>
                  <Badge variant={event.status}>{statusLabels[event.status]}</Badge>
                  <h3 className="mt-1 font-semibold text-slate-800">{event.name}</h3>
                  {event.description && (
                    <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {format(parseISO(event.dateStart), "d MMM", { locale: th })}
                      {event.dateEnd !== event.dateStart &&
                        ` – ${format(parseISO(event.dateEnd), "d MMM yyyy", { locale: th })}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.venue}, {event.city}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
