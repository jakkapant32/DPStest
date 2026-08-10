"use client";

import { useCallback, useMemo, useState, Fragment } from "react";
import { ChevronDown, Loader2, Upload } from "lucide-react";
import { Card, Button, SectionHeader } from "@/components/ui/Card";
import { MedalIcon } from "@/components/ui/MedalIcon";
import { cn } from "@/lib/utils";
import { fetchCSVFromUrl } from "@/lib/analytics";
import {
  getRankStyle,
  parseResultsCSV,
  sortResultRows,
  type ParsedResultRow,
} from "@/lib/results-csv";
import type { RaceResult, SwimEvent } from "@/lib/types";

function mockToParsed(results: RaceResult[]): ParsedResultRow[] {
  return results.map((r) => ({
    id: r.id,
    name: r.athleteName,
    gender: r.gender === "male" ? "Male" : "Female",
    ageGroup: r.ageGroup,
    club: r.club,
    rankOrig: String(r.rank),
    finalTimeStr: `${Math.floor(r.time / 60)}:${(r.time % 60).toFixed(2).padStart(5, "0")}`,
    finalTimeSec: r.time,
    splits: Object.fromEntries(
      Object.entries(r.splits).map(([k, v]) => [`${k}m`, v.toFixed(2)])
    ),
  }));
}

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
  const [csvRows, setCsvRows] = useState<ParsedResultRow[] | null>(null);
  const [distances, setDistances] = useState<string[]>(["50m", "100m", "150m"]);
  const [sheetUrl, setSheetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [genderFilter, setGenderFilter] = useState("All");
  const [ageFilter, setAgeFilter] = useState("All");
  const [clubFilter, setClubFilter] = useState("All");

  const mockRows = useMemo(() => {
    const eventResults = initialResults.filter((r) => r.eventId === selectedEvent);
    return mockToParsed(eventResults);
  }, [initialResults, selectedEvent]);

  const sourceRows = csvRows ?? mockRows;
  const usingCsv = csvRows !== null;

  const filterOptions = useMemo(() => {
    const genders = Array.from(new Set(sourceRows.map((r) => r.gender).filter((v) => v !== "-")));
    const ages = Array.from(new Set(sourceRows.map((r) => r.ageGroup).filter((v) => v !== "-")));
    const clubs = Array.from(new Set(sourceRows.map((r) => r.club).filter((v) => v !== "-")));
    return { genders, ages, clubs };
  }, [sourceRows]);

  const filtered = useMemo(() => {
    const rows = sourceRows.filter((r) => {
      if (genderFilter !== "All" && r.gender !== genderFilter) return false;
      if (ageFilter !== "All" && r.ageGroup !== ageFilter) return false;
      if (clubFilter !== "All" && r.club !== clubFilter) return false;
      return true;
    });
    return sortResultRows(rows, ageFilter);
  }, [sourceRows, genderFilter, ageFilter, clubFilter]);

  const rankedRows = useMemo(() => {
    let currentAgeGroup = "";
    let calculatedRank = 0;
    return filtered.map((row) => {
      if (row.ageGroup !== currentAgeGroup) {
        currentAgeGroup = row.ageGroup;
        calculatedRank = 1;
      } else {
        calculatedRank++;
      }
      const parsed = parseInt(row.rankOrig, 10);
      const rank = !Number.isNaN(parsed) ? parsed : calculatedRank;
      return { row, rank };
    });
  }, [filtered]);

  const loadCsv = useCallback((text: string) => {
    const { rows, distances: d } = parseResultsCSV(text);
    setCsvRows(rows);
    setDistances(d);
    setGenderFilter("All");
    setAgeFilter("All");
    setClubFilter("All");
    setError(null);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        loadCsv(ev.target?.result as string);
      } catch (err) {
        setError(err instanceof Error ? err.message : "อ่านไฟล์ไม่สำเร็จ");
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSheet = async () => {
    if (!sheetUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const text = await fetchCSVFromUrl(sheetUrl.trim());
      loadCsv(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const completedEvents = initialEvents.filter((e) => e.status === "completed");

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="OFFICIAL RESULTS"
        title="ระบบรายงานผลการแข่งขัน"
        className="mb-2"
      />
      <p className="mb-8 text-center text-slate-500">
        รายงานผลการแข่งขันอย่างเป็นทางการ — รองรับ CSV และ Google Sheets
      </p>

      <Card className="mb-6 border-t-4 border-t-dps-navy">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 xl:flex-row xl:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              โหลดจาก Google Sheets (CSV Link)
            </label>
            <div className="flex gap-2">
              <input
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-dps-cyan focus:outline-none focus:ring-2 focus:ring-dps-cyan/20"
                placeholder="วางลิงก์ CSV ที่นี่..."
              />
              <Button size="sm" onClick={handleLoadSheet} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ดึงข้อมูล"}
              </Button>
            </div>
          </div>
          <span className="hidden text-sm text-slate-400 xl:block">หรือ</span>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              อัปโหลดไฟล์ CSV
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-dps-cyan/30 bg-dps-cyan/5 px-4 py-2.5 text-sm text-dps-navy hover:bg-dps-cyan/10">
              <Upload className="h-4 w-4" />
              เลือกไฟล์
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {!usingCsv && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">การแข่งขัน</label>
              <select
                value={selectedEvent}
                onChange={(e) => {
                  setSelectedEvent(e.target.value);
                  setGenderFilter("All");
                  setAgeFilter("All");
                  setClubFilter("All");
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-dps-cyan focus:outline-none focus:ring-2 focus:ring-dps-cyan/20"
              >
                {completedEvents.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">เพศ</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-dps-cyan focus:outline-none focus:ring-2 focus:ring-dps-cyan/20"
            >
              <option value="All">ทั้งหมด</option>
              {filterOptions.genders.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">รุ่นอายุ</label>
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-dps-cyan focus:outline-none focus:ring-2 focus:ring-dps-cyan/20"
            >
              <option value="All">ทั้งหมด</option>
              {filterOptions.ages.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">สโมสร</label>
            <select
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-dps-cyan focus:outline-none focus:ring-2 focus:ring-dps-cyan/20"
            >
              <option value="All">ทั้งหมด</option>
              {filterOptions.clubs.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {usingCsv && (
          <button
            type="button"
            onClick={() => setCsvRows(null)}
            className="mt-4 text-sm text-dps-cyan hover:underline"
          >
            ← กลับไปใช้ข้อมูลตัวอย่างจากระบบ
          </button>
        )}
      </Card>

      {rankedRows.length === 0 ? (
        <Card className="py-16 text-center text-slate-400">
          ไม่พบผลการแข่งขันที่ตรงกับตัวกรอง
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-dps-navy text-white">
                  <th className="w-16 px-6 py-4 text-center font-semibold">Rank</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="hidden px-6 py-4 font-semibold md:table-cell">Gender</th>
                  <th className="hidden px-6 py-4 font-semibold sm:table-cell">Age Group</th>
                  <th className="px-6 py-4 font-semibold">Club</th>
                  <th className="px-6 py-4 text-right font-semibold">Final Time</th>
                  <th className="w-10 px-4 py-4" />
                </tr>
              </thead>
              <tbody
                className="group/table"
                onMouseLeave={() => setHoveredId(null)}
              >
                {rankedRows.map(({ row, rank }) => {
                  const style = getRankStyle(rank);
                  const isExpanded = expandedId === row.id;
                  const isHovered = hoveredId === row.id;
                  const isDimmed = hoveredId !== null && !isHovered;

                  return (
                    <Fragment key={row.id}>
                      <tr
                        key={row.id}
                        className={cn(
                          "group cursor-pointer border-b border-slate-100 transition-all duration-200",
                          style.row,
                          isDimmed && "opacity-35 blur-[0.4px]",
                          isHovered && "relative z-10 scale-[1.01] opacity-100 blur-none shadow-md"
                        )}
                        onMouseEnter={() => setHoveredId(row.id)}
                        onClick={() => setExpandedId(isExpanded ? null : row.id)}
                      >
                        <td className={cn("px-6 py-4 text-center text-base font-bold", style.rank)}>
                          {rank}
                        </td>
                        <td className={cn("px-6 py-4 text-base font-semibold", style.name, isHovered && "font-bold")}>
                          <span className="inline-flex items-center gap-2">
                            {style.medal && <MedalIcon rank={style.medal} />}
                            {row.name}
                          </span>
                        </td>
                        <td className="hidden px-6 py-4 text-slate-500 md:table-cell">{row.gender}</td>
                        <td className="hidden px-6 py-4 text-slate-500 sm:table-cell">{row.ageGroup}</td>
                        <td className="max-w-[200px] truncate px-6 py-4 text-slate-600" title={row.club}>
                          {row.club}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-base font-bold text-slate-800">
                          {row.finalTimeStr}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <ChevronDown
                            className={cn(
                              "inline h-5 w-5 text-slate-400 transition-transform group-hover:text-dps-cyan",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${row.id}-splits`} className="border-b-2 border-slate-200 bg-slate-50/80">
                          <td colSpan={7} className="p-0">
                            <div className="p-6">
                              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                                Split Times
                              </p>
                              <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                                {distances.map((d) => (
                                  <div key={d} className="border-l-2 border-dps-cyan/40 pl-2">
                                    <span className="text-[10px] font-semibold uppercase text-slate-500">{d}</span>
                                    <p className="font-mono text-sm font-medium text-slate-800">
                                      {row.splits[d] ?? "-"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
