"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, Upload, Link2, ChartLine } from "lucide-react";
import { Card, StatCard, Button } from "@/components/ui/Card";
import { cn, formatSwimTime } from "@/lib/utils";
import {
  CHART_COLORS,
  computeStats,
  fetchCSVFromUrl,
  getChartYAxisConfig,
  getPaceData,
  parseCSVToRecords,
} from "@/lib/analytics";
import type { SwimRecord } from "@/lib/types";
import { ChartFocusTooltip } from "./ChartFocusTooltip";

export type DashboardMode = "single-club" | "multi-club" | "multi-event";

interface SampleFile {
  label: string;
  path: string;
  tag?: string;
}

interface SwimDashboardProps {
  mode: DashboardMode;
  title: string;
  description: string;
  samples?: SampleFile[];
}

function toggleList(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

function toggleAll(list: string[], all: string[]): string[] {
  return list.length === all.length ? [] : [...all];
}

const DEFAULT_CHART_ATHLETES = 8;
const MAX_LEGEND_ATHLETES = 12;

export function SwimDashboard({
  mode,
  title,
  description,
  samples = [],
}: SwimDashboardProps) {
  const [records, setRecords] = useState<SwimRecord[]>([]);
  const [datasetTags, setDatasetTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [genderFilter, setGenderFilter] = useState<string>("All");
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [clubs, setClubs] = useState<string[]>([]);
  const [singleClub, setSingleClub] = useState("All");
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [chartMode, setChartMode] = useState<"pacing" | "cumulative">("pacing");
  const [hoveredAthlete, setHoveredAthlete] = useState<string | null>(null);
  const [lockedAthlete, setLockedAthlete] = useState<string | null>(null);

  const focusAthlete = lockedAthlete ?? hoveredAthlete;

  const hasData = records.length > 0;

  const allGenders = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.gender === "male") set.add("M");
      else set.add("F");
    });
    return Array.from(set);
  }, [records]);

  const allAgeGroups = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.ageGroup).filter(Boolean))).sort(),
    [records]
  );

  const allClubs = useMemo(
    () => Array.from(new Set(records.map((r) => r.club).filter(Boolean))).sort(),
    [records]
  );

  useEffect(() => {
    if (allAgeGroups.length && ageGroups.length === 0) {
      setAgeGroups([...allAgeGroups]);
    }
  }, [allAgeGroups, ageGroups.length]);

  useEffect(() => {
    if (allClubs.length && clubs.length === 0) {
      if (mode === "single-club") {
        setSingleClub(allClubs[0] ?? "All");
      } else {
        setClubs([...allClubs]);
      }
    }
  }, [allClubs, clubs.length, mode]);

  const poolRecords = useMemo(() => {
    return records.filter((r) => {
      if (genderFilter !== "All") {
        const g = r.gender === "male" ? "M" : "F";
        if (g !== genderFilter && genderFilter !== r.gender) return false;
      }
      if (ageGroups.length > 0 && !ageGroups.includes(r.ageGroup)) return false;
      if (mode === "single-club") {
        if (singleClub !== "All" && r.club !== singleClub) return false;
      } else if (clubs.length > 0 && !clubs.includes(r.club)) {
        return false;
      }
      return true;
    });
  }, [records, genderFilter, ageGroups, clubs, singleClub, mode]);

  const allAthletesInPool = useMemo(
    () => Array.from(new Set(poolRecords.map((r) => r.athlete))).sort(),
    [poolRecords]
  );

  useEffect(() => {
    if (allAthletesInPool.length && selectedAthletes.length === 0) {
      setSelectedAthletes(allAthletesInPool.slice(0, DEFAULT_CHART_ATHLETES));
    }
  }, [allAthletesInPool, selectedAthletes.length]);

  const filteredRecords = useMemo(() => {
    if (selectedAthletes.length === 0) return [];
    return poolRecords.filter((r) => selectedAthletes.includes(r.athlete));
  }, [poolRecords, selectedAthletes]);

  const stats = useMemo(() => computeStats(filteredRecords), [filteredRecords]);
  const chartData = useMemo(
    () => getPaceData(filteredRecords, chartMode),
    [filteredRecords, chartMode]
  );
  const yAxis = useMemo(
    () => getChartYAxisConfig(chartData, filteredRecords.map((r) => r.athlete)),
    [chartData, filteredRecords]
  );

  const loadCsvText = useCallback(
    (text: string, tag?: string) => {
      const parsed = parseCSVToRecords(text, tag ? { tag } : undefined);
      if (parsed.length === 0) throw new Error("ไม่พบข้อมูลในไฟล์");
      if (mode === "multi-event") {
        setRecords((prev) => [...prev, ...parsed]);
        if (tag) setDatasetTags((prev) => [...prev, tag]);
      } else {
        setRecords(parsed);
        setAgeGroups([]);
        setClubs([]);
        setSelectedAthletes([]);
        setDatasetTags(tag ? [tag] : []);
        setHoveredAthlete(null);
        setLockedAthlete(null);
      }
      setError(null);
    },
    [mode]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const tag =
          mode === "multi-event"
            ? tagInput.trim() || file.name.replace(/\.csv$/i, "")
            : undefined;
        loadCsvText(ev.target?.result as string, tag);
        setTagInput("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "อ่านไฟล์ไม่สำเร็จ");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleLoadSheet = async () => {
    if (!sheetUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const text = await fetchCSVFromUrl(sheetUrl.trim());
      const tag =
        mode === "multi-event"
          ? tagInput.trim() || `ข้อมูลที่ ${datasetTags.length + 1}`
          : undefined;
      loadCsvText(text, tag);
      setTagInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = useCallback(async (sample: SampleFile) => {
    setLoading(true);
    setError(null);
    try {
      const text = await fetch(sample.path).then((r) => {
        if (!r.ok) throw new Error("โหลดไฟล์ตัวอย่างไม่สำเร็จ");
        return r.text();
      });
      loadCsvText(
        text,
        mode === "multi-event" ? sample.tag ?? sample.label : undefined
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดตัวอย่างไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [loadCsvText, mode]);

  useEffect(() => {
    if (samples.length > 0 && records.length === 0) {
      loadSample(samples[0]);
    }
  }, [samples, records.length, loadSample]);

  const clearAll = () => {
    setRecords([]);
    setDatasetTags([]);
    setAgeGroups([]);
    setClubs([]);
    setSelectedAthletes([]);
    setSingleClub("All");
    setSheetUrl("");
    setHoveredAthlete(null);
    setLockedAthlete(null);
  };

  const handleLineFocus = (athlete: string) => {
    setLockedAthlete((prev) => (prev === athlete ? null : athlete));
    setHoveredAthlete(athlete);
  };

  const handleChartMouseLeave = () => {
    if (!lockedAthlete) setHoveredAthlete(null);
  };

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-dps-cyan">
        <h2 className="text-xl font-bold text-dps-navy">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>

        {mode === "multi-event" && (
          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              ตั้งชื่อรายการ (Tag)
            </label>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="เช่น 200m หญิง"
              className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-dps-cyan focus:outline-none focus:ring-2 focus:ring-dps-cyan/20"
            />
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-dps-cyan/20 bg-dps-cyan/5 p-4">
            <label className="mb-2 block text-sm font-semibold text-dps-navy">
              โหลดจาก Google Sheets (CSV Link)
            </label>
            <div className="flex gap-2">
              <input
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="วางลิงก์ CSV..."
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-dps-cyan focus:outline-none"
              />
              <Button size="sm" onClick={handleLoadSheet} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ดึงข้อมูล"}
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-semibold text-dps-navy">
              อัปโหลดไฟล์ CSV
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-dps-cyan/40 bg-white px-4 py-2.5 text-sm hover:bg-dps-cyan/5">
              <Upload className="h-4 w-4 text-dps-cyan" />
              เลือกไฟล์
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {samples.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {samples.map((s) => (
              <button
                key={s.path}
                type="button"
                onClick={() => loadSample(s)}
                className="rounded-full bg-dps-navy/10 px-4 py-1.5 text-sm font-medium text-dps-navy transition hover:bg-dps-navy hover:text-white"
              >
                โหลด {s.label}
              </button>
            ))}
          </div>
        )}

        {mode === "multi-event" && datasetTags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {datasetTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-dps-cyan/15 px-3 py-1 text-xs font-semibold text-dps-navy"
              >
                {tag}
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-red-600 hover:underline"
            >
              ล้างข้อมูลทั้งหมด
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </Card>

      {!hasData ? (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <ChartLine className="h-8 w-8 text-dps-cyan" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">ยังไม่มีข้อมูลแสดงผล</h3>
          <p className="mt-2 text-slate-500">
            อัปโหลด CSV หรือกดโหลดไฟล์ตัวอย่างด้านบน
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            {allGenders.length > 0 && (
              <Card title="เพศ">
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                >
                  <option value="All">ทั้งหมด</option>
                  {allGenders.map((g) => (
                    <option key={g} value={g}>
                      {g === "M" ? "ชาย" : "หญิง"}
                    </option>
                  ))}
                </select>
              </Card>
            )}

            {allAgeGroups.length > 0 && (
              <Card title="รุ่นอายุ">
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-dps-cyan hover:underline"
                    onClick={() =>
                      setAgeGroups(toggleAll(ageGroups, allAgeGroups))
                    }
                  >
                    สลับ
                  </button>
                </div>
                <div className="max-h-36 space-y-1 overflow-y-auto">
                  {allAgeGroups.map((ag) => (
                    <label key={ag} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={ageGroups.includes(ag)}
                        onChange={() => setAgeGroups(toggleList(ageGroups, ag))}
                        className="rounded text-dps-cyan"
                      />
                      <span className="truncate">{ag}</span>
                    </label>
                  ))}
                </div>
              </Card>
            )}

            {allClubs.length > 0 && (
              <Card title="สโมสร">
                {mode === "single-club" ? (
                  <select
                    value={singleClub}
                    onChange={(e) => {
                      setSingleClub(e.target.value);
                      setSelectedAthletes([]);
                    }}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  >
                    {allClubs.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <div className="mb-2 flex justify-end">
                      <button
                        type="button"
                        className="text-xs text-dps-cyan hover:underline"
                        onClick={() => setClubs(toggleAll(clubs, allClubs))}
                      >
                        สลับ
                      </button>
                    </div>
                    <div className="max-h-36 space-y-1 overflow-y-auto">
                      {allClubs.map((club) => (
                        <label key={club} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={clubs.includes(club)}
                            onChange={() => {
                              setClubs(toggleList(clubs, club));
                              setSelectedAthletes([]);
                            }}
                            className="rounded text-dps-cyan"
                          />
                          <span className="truncate" title={club}>
                            {club}
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            )}

            <Card title="รูปแบบกราฟ">
              {(["pacing", "cumulative"] as const).map((m) => (
                <label key={m} className="mb-2 flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="chartMode"
                    checked={chartMode === m}
                    onChange={() => setChartMode(m)}
                    className="text-dps-cyan"
                  />
                  {m === "pacing" ? "ความเร็วต่อช่วง (Pacing)" : "เวลาสะสม (Cumulative)"}
                </label>
              ))}
            </Card>

            <Card title="นักกีฬา">
              <p className="mb-2 text-xs text-slate-500">
                เลือกนักกีฬาเพื่อแสดงบนกราฟ (แนะนำไม่เกิน {MAX_LEGEND_ATHLETES} คน) ·
                คลิกชื่อเพื่อล็อกไฮไลท์
              </p>
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  className="text-xs text-dps-cyan hover:underline"
                  onClick={() =>
                    setSelectedAthletes(
                      toggleAll(selectedAthletes, allAthletesInPool)
                    )
                  }
                >
                  สลับ
                </button>
              </div>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {allAthletesInPool.map((athlete) => (
                  <label
                    key={athlete}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-1 py-0.5 text-sm transition",
                      focusAthlete === athlete && "bg-dps-cyan/10 font-semibold text-dps-navy",
                      lockedAthlete === athlete && "ring-1 ring-dps-cyan/40"
                    )}
                    onMouseEnter={() => setHoveredAthlete(athlete)}
                    onMouseLeave={() => {
                      if (!lockedAthlete) setHoveredAthlete(null);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAthletes.includes(athlete)}
                      onChange={() =>
                        setSelectedAthletes(toggleList(selectedAthletes, athlete))
                      }
                      className="rounded text-dps-cyan"
                    />
                    <span
                      className="cursor-pointer truncate"
                      title={athlete}
                      onClick={() => handleLineFocus(athlete)}
                    >
                      {athlete}
                    </span>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4 lg:col-span-3">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="นักกีฬา" value={String(stats.count)} />
              <StatCard
                label="เวลาจบที่ดีที่สุด"
                value={stats.bestTime ? formatSwimTime(stats.bestTime) : "-"}
              />
              <StatCard label="Avg Pace" value={stats.avgPace.toFixed(2)} />
            </div>

            <Card className="min-h-[420px]">
              {lockedAthlete && (
                <div className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-dps-cyan/30 bg-dps-cyan/5 px-3 py-2 text-sm">
                  <span className="truncate font-semibold text-dps-navy">
                    🔒 ล็อก: {lockedAthlete}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLockedAthlete(null)}
                    className="shrink-0 text-xs text-dps-cyan hover:underline"
                  >
                    ปลดล็อก
                  </button>
                </div>
              )}
              {chartData.length === 0 ? (
                <div className="flex h-80 items-center justify-center text-slate-400">
                  เลือกนักกีฬาและตัวกรองเพื่อแสดงกราฟ
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData} onMouseLeave={handleChartMouseLeave}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="distance"
                      tick={{ fontSize: 11 }}
                      label={{
                        value: "ระยะทาง (m)",
                        position: "insideBottom",
                        offset: -2,
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      type="number"
                      domain={yAxis.domain}
                      ticks={yAxis.ticks}
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      content={
                        <ChartFocusTooltip
                          focusAthlete={focusAthlete}
                          valueLabel={chartMode === "pacing" ? "Pace" : "เวลา"}
                        />
                      }
                    />
                    {filteredRecords.length <= MAX_LEGEND_ATHLETES && (
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    )}
                    {filteredRecords.map((r, i) => {
                      const isFocused = focusAthlete === r.athlete;
                      const isDimmed = focusAthlete !== null && !isFocused;
                      return (
                        <Line
                          key={r.athlete}
                          type="monotone"
                          dataKey={r.athlete}
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          strokeWidth={isFocused ? 4 : 2}
                          strokeOpacity={isDimmed ? 0.1 : 1}
                          dot={{
                            r: isFocused ? 5 : 3,
                            fillOpacity: isDimmed ? 0.1 : 1,
                          }}
                          activeDot={{ r: 7 }}
                          style={{ cursor: "pointer" }}
                          onMouseEnter={() => setHoveredAthlete(r.athlete)}
                          onMouseLeave={() => {
                            if (!lockedAthlete) setHoveredAthlete(null);
                          }}
                          onClick={() => handleLineFocus(r.athlete)}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            {mode !== "multi-event" && (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-slate-500 hover:text-red-600"
              >
                ล้างข้อมูล
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
