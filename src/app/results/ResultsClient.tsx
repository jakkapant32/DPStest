"use client";

import { useMemo, useState } from "react";
import { Card, Button } from "@/components/ui/Card";
import { formatSwimTime } from "@/lib/utils";
import type { Gender, RaceResult, SwimEvent } from "@/lib/types";

export function ResultsClient({
  initialEvents,
  initialResults,
}: {
  initialEvents: SwimEvent[];
  initialResults: RaceResult[];
}) {
  const [selectedEvent, setSelectedEvent] = useState(
    initialEvents.find((e) => e.status === "completed")?.id ?? initialEvents[0]?.id ?? ""
  );
  const [genderFilter, setGenderFilter] = useState<Gender | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const eventResults = useMemo(
    () => initialResults.filter((r) => r.eventId === selectedEvent),
    [initialResults, selectedEvent]
  );

  const categories = useMemo(
    () => Array.from(new Set(eventResults.map((r) => r.category))),
    [eventResults]
  );

  const filtered = useMemo(() => {
    return eventResults.filter((r) => {
      if (genderFilter !== "all" && r.gender !== genderFilter) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      return true;
    });
  }, [eventResults, genderFilter, categoryFilter]);

  const completedEvents = initialEvents.filter((e) => e.status === "completed");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ผล<span className="text-gradient">การแข่งขัน</span>
        </h1>
        <p className="mt-2 text-gray-500">ดูผลการแข่งขัน พร้อม split times</p>
      </div>

      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">การแข่งขัน</label>
            <select
              value={selectedEvent}
              onChange={(e) => {
                setSelectedEvent(e.target.value);
                setCategoryFilter("all");
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {completedEvents.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">เพศ</label>
            <div className="flex gap-2">
              {(["all", "female", "male"] as const).map((g) => (
                <Button key={g} size="sm" variant={genderFilter === g ? "primary" : "outline"} onClick={() => setGenderFilter(g)}>
                  {g === "all" ? "ทั้งหมด" : g === "female" ? "หญิง" : "ชาย"}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">ประเภท</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="all">ทั้งหมด</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 text-left font-medium text-gray-600">อันดับ</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">นักกีฬา</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">สโมสร</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">ประเภท</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">50m</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">100m</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">150m</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">เวลา</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">ไม่พบผลการแข่งขัน</td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-brand-50/30">
                  <td className="px-4 py-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{r.rank}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.athleteName}</td>
                  <td className="px-4 py-3 text-gray-500">{r.club}</td>
                  <td className="px-4 py-3 text-gray-500">{r.category}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{r.splits["50"]?.toFixed(2) ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{r.splits["100"]?.toFixed(2) ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{r.splits["150"]?.toFixed(2) ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-brand-700">{formatSwimTime(r.time)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
