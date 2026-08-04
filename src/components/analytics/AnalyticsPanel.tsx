"use client";

import { useCallback, useMemo, useState } from "react";
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
import { Upload, Link2, Loader2 } from "lucide-react";
import { Card, StatCard, Button } from "@/components/ui/Card";
import {
  CHART_COLORS,
  computeStats,
  fetchCSVFromUrl,
  getPaceData,
  parseCSVToRecords,
} from "@/lib/analytics";
import type { AnalyticsDataset, Gender, SwimRecord } from "@/lib/types";
import { formatSwimTime } from "@/lib/utils";

interface AnalyticsPanelProps {
  side: "left" | "right";
  defaultDataset: AnalyticsDataset;
}

export function AnalyticsPanel({ side, defaultDataset }: AnalyticsPanelProps) {
  const [name, setName] = useState(defaultDataset.name);
  const [records, setRecords] = useState<SwimRecord[]>(defaultDataset.records);
  const [sheetUrl, setSheetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [genderFilter, setGenderFilter] = useState<Gender | "all">("all");
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [clubs, setClubs] = useState<string[]>([]);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [chartMode, setChartMode] = useState<"pacing" | "cumulative">("pacing");

  const allAgeGroups = useMemo(
    () => Array.from(new Set(records.map((r) => r.ageGroup).filter(Boolean))),
    [records]
  );
  const allClubs = useMemo(
    () => Array.from(new Set(records.map((r) => r.club).filter(Boolean))),
    [records]
  );
  const allAthletes = useMemo(
    () => records.map((r) => r.athlete),
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (genderFilter !== "all" && r.gender !== genderFilter) return false;
      if (ageGroups.length > 0 && !ageGroups.includes(r.ageGroup)) return false;
      if (clubs.length > 0 && !clubs.includes(r.club)) return false;
      if (selectedAthletes.length > 0 && !selectedAthletes.includes(r.athlete))
        return false;
      return true;
    });
  }, [records, genderFilter, ageGroups, clubs, selectedAthletes]);

  const stats = useMemo(() => computeStats(filteredRecords), [filteredRecords]);
  const chartData = useMemo(
    () => getPaceData(filteredRecords, chartMode),
    [filteredRecords, chartMode]
  );

  const activeAthletes = useMemo(
    () => filteredRecords.map((r) => r.athlete),
    [filteredRecords]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string;
          const parsed = parseCSVToRecords(text);
          setRecords(parsed);
          setSelectedAthletes([]);
          setAgeGroups([]);
          setClubs([]);
          if (parsed.length > 0) {
            setName(file.name.replace(/\.csv$/i, ""));
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "CSV parse error");
        }
      };
      reader.readAsText(file);
    },
    []
  );

  const handleLoadSheet = useCallback(async () => {
    if (!sheetUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let url = sheetUrl.trim();
      if (url.includes("docs.google.com/spreadsheets")) {
        url = url.replace(/\/edit.*$/, "/export?format=csv");
      }
      const text = await fetchCSVFromUrl(url);
      const parsed = parseCSVToRecords(text);
      setRecords(parsed);
      setSelectedAthletes([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sheet");
    } finally {
      setLoading(false);
    }
  }, [sheetUrl]);

  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    item: string
  ) => {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
  };

  const sideLabel = side === "left" ? "รายการ 1 (ซ้าย)" : "รายการ 2 (ขวา)";

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Filters sidebar */}
      <div className="w-full shrink-0 space-y-4 lg:w-48">
        <Card title="เพศ">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as Gender | "all")}
            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          >
            <option value="all">ทั้งหมด</option>
            <option value="female">หญิง</option>
            <option value="male">ชาย</option>
          </select>
        </Card>

        {allAgeGroups.length > 0 && (
          <Card title="รุ่นอายุ">
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {allAgeGroups.map((ag) => (
                <label key={ag} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={ageGroups.includes(ag)}
                    onChange={() => toggleItem(ageGroups, setAgeGroups, ag)}
                    className="rounded border-gray-300 text-brand-600"
                  />
                  {ag}
                </label>
              ))}
            </div>
          </Card>
        )}

        {allClubs.length > 0 && (
          <Card title="สโมสร">
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {allClubs.map((club) => (
                <label key={club} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={clubs.includes(club)}
                    onChange={() => toggleItem(clubs, setClubs, club)}
                    className="rounded border-gray-300 text-brand-600"
                  />
                  <span className="truncate">{club}</span>
                </label>
              ))}
            </div>
          </Card>
        )}

        <Card title="กราฟ">
          <div className="space-y-2">
            {(["pacing", "cumulative"] as const).map((mode) => (
              <label key={mode} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`chart-${side}`}
                  checked={chartMode === mode}
                  onChange={() => setChartMode(mode)}
                  className="text-brand-600"
                />
                {mode === "pacing" ? "Pacing" : "Cumulative"}
              </label>
            ))}
          </div>
        </Card>

        {allAthletes.length > 0 && (
          <Card title="นักกีฬา">
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {allAthletes.map((athlete) => (
                <label key={athlete} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      selectedAthletes.length === 0 ||
                      selectedAthletes.includes(athlete)
                    }
                    onChange={() => {
                      if (selectedAthletes.length === 0) {
                        setSelectedAthletes(
                          allAthletes.filter((a) => a !== athlete)
                        );
                      } else {
                        toggleItem(selectedAthletes, setSelectedAthletes, athlete);
                      }
                    }}
                    className="rounded border-gray-300 text-brand-600"
                  />
                  <span className="truncate">{athlete}</span>
                </label>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-4">
        <Card title={`นำเข้าข้อมูล: ${sideLabel}`}>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                ชื่อการวิเคราะห์
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="200FR M&F_v2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Google Sheets (CSV URL)
              </label>
              <div className="flex gap-2">
                <input
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
                <Button size="sm" onClick={handleLoadSheet} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Link2 className="mr-1 h-3.5 w-3.5" />
                      โหลด
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-brand-200 bg-brand-50/50 px-4 py-3 text-sm text-brand-700 hover:bg-brand-50">
                <Upload className="h-4 w-4" />
                เลือกไฟล์ CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="นักกีฬา" value={String(stats.count)} />
          <StatCard label="Best Time" value={formatSwimTime(stats.bestTime)} />
          <StatCard label="Avg Pace (50m)" value={stats.avgPace.toFixed(2)} />
        </div>

        <Card>
          <h3 className="mb-4 text-center font-semibold text-gray-900">
            {name} ({chartMode === "pacing" ? "Pacing" : "Cumulative"})
          </h3>
          {chartData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-gray-400">
              ไม่มีข้อมูล — นำเข้า CSV หรือเลือก filter
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="distance"
                  label={{ value: "ระยะทาง (เมตร)", position: "insideBottom", offset: -2 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  label={{
                    value: chartMode === "pacing" ? "Pace (วินาที)" : "เวลารวม (วินาที)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11 },
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => value.toFixed(2)}
                  labelFormatter={(label) => `${label}m`}
                />
                <Legend />
                {activeAthletes.map((athlete, i) => (
                  <Line
                    key={athlete}
                    type="monotone"
                    dataKey={athlete}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
