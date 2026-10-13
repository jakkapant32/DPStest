import Papa from "papaparse";
import { findColumn, isBlankSwimTime, unwrapQuotedCsvRows } from "./csv-normalize";
import type { Gender, SwimRecord } from "./types";

export function timeToSeconds(timeStr: string | undefined | null): number | null {
  if (!timeStr || typeof timeStr !== "string") return null;
  const str = timeStr.trim();
  if (isBlankSwimTime(str)) return null;
  const parts = str.split(":");
  if (parts.length === 2) {
    const value = parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
    return Number.isFinite(value) ? value : null;
  }
  const n = parseFloat(str);
  return Number.isFinite(n) ? n : null;
}

function parseGender(raw: string | undefined): Gender {
  const g = (raw ?? "").trim().toLowerCase();
  if (g === "m" || g.startsWith("m") || g === "ชาย") return "male";
  return "female";
}

export function parseCSVToRecords(
  csvText: string,
  options?: { tag?: string }
): SwimRecord[] {
  const parsed = Papa.parse<Record<string, string>>(unwrapQuotedCsvRows(csvText), {
    header: true,
    skipEmptyLines: true,
  });

  const blocking = parsed.errors.filter(
    (e) => e.type === "Quotes" || e.code === "UndetectableDelimiter"
  );
  if (blocking.length > 0 && parsed.data.length === 0) {
    throw new Error(blocking[0]?.message ?? "CSV parse error");
  }

  const cols = Object.keys(parsed.data[0] ?? {});
  const distanceCols = cols
    .filter((c) => c.trim().match(/^\d+m$/i))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const nameKey = findColumn(
    cols,
    (k) => k.includes("ชื่อ") || k.includes("name") || k.includes("athlete")
  );
  const genderKey = findColumn(cols, (k) => k === "gender" || k === "เพศ");
  const clubKey = findColumn(cols, (k) => k === "สโมสร" || k === "club");
  const ageKey = findColumn(
    cols,
    (k) => k === "age" || k === "รุ่นอายุ" || k === "age_group" || k === "agegroup"
  );
  const officialTimeKey = findColumn(
    cols,
    (k) => k === "time" || k === "เวลา" || k === "total_time" || k === "total"
  );

  return parsed.data
    .map((row) => {
      const rawName =
        (nameKey && row[nameKey]?.trim()) ||
        row.athlete?.trim() ||
        row["ชื่อ"]?.trim() ||
        row.name?.trim() ||
        "";
      if (!rawName) return null;

      const athlete = options?.tag
        ? `${rawName} (${options.tag})`
        : rawName;

      const splits: Record<string, number> = {};

      if (distanceCols.length > 0) {
        distanceCols.forEach((col) => {
          const dist = col.replace(/m$/i, "");
          const sec = timeToSeconds(row[col]);
          if (sec !== null) splits[dist] = sec;
        });
      } else {
        for (const key of Object.keys(row)) {
          const match = key.match(/split[_\s]?(\d+)/i);
          if (match) {
            const sec = timeToSeconds(row[key]);
            if (sec !== null) splits[match[1]] = sec;
          }
        }
        if (Object.keys(splits).length === 0) {
          for (const dist of ["50", "100", "150", "200", "400", "1500"]) {
            const sec = timeToSeconds(row[dist] ?? row[`${dist}m`]);
            if (sec !== null) splits[dist] = sec;
          }
        }
      }

      const distKeys = Object.keys(splits).map(Number).sort((a, b) => a - b);
      const lastDist = distKeys[distKeys.length - 1];
      const totalFromSplits = lastDist ? splits[String(lastDist)] : null;
      const totalParsed = timeToSeconds(
        (officialTimeKey && row[officialTimeKey]) ||
          row.total_time ||
          row["total"] ||
          row["Time"] ||
          row["เวลา"]
      );
      const totalTime = totalParsed ?? totalFromSplits ?? 0;
      if (distKeys.length === 0 && totalTime <= 0) return null;

      return {
        athlete,
        gender: parseGender(genderKey ? row[genderKey] : row.gender),
        ageGroup:
          (ageKey && row[ageKey]?.trim()) ||
          row["รุ่นอายุ"]?.trim() ||
          row.age_group?.trim() ||
          row.Age?.trim() ||
          "",
        club: (clubKey && row[clubKey]?.trim()) || row.club?.trim() || row["สโมสร"]?.trim() || "",
        stroke: row.stroke ?? row["ท่า"] ?? "freestyle",
        distance: lastDist ?? parseInt(row.distance ?? row["ระยะ"] ?? "200", 10),
        splits,
        totalTime,
      } satisfies SwimRecord;
    })
    .filter((r): r is SwimRecord => r !== null);
}

export async function fetchCSVFromUrl(url: string): Promise<string> {
  let fetchUrl = url.trim();
  if (fetchUrl.includes("docs.google.com/spreadsheets")) {
    fetchUrl = fetchUrl.replace(/\/edit.*$/, "/export?format=csv");
  }
  const res = await fetch(fetchUrl);
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
  return res.text();
}

export function getPaceData(
  records: SwimRecord[],
  mode: "pacing" | "cumulative"
): { distance: number; [athlete: string]: number | string }[] {
  if (records.length === 0) return [];

  const distances = new Set<number>();
  records.forEach((r) => {
    Object.keys(r.splits).forEach((d) => distances.add(parseInt(d, 10)));
  });
  const sortedDistances = Array.from(distances).sort((a, b) => a - b);

  return sortedDistances.map((dist, idx) => {
    const point: { distance: number; [key: string]: number | string } = {
      distance: dist,
    };
    records.forEach((r) => {
      const splitVal = r.splits[String(dist)];
      if (splitVal === undefined) return;
      if (mode === "cumulative") {
        point[r.athlete] = splitVal;
      } else {
        const prevDist = idx > 0 ? sortedDistances[idx - 1] : null;
        if (prevDist !== null) {
          const prev = r.splits[String(prevDist)];
          if (prev !== undefined) {
            point[r.athlete] = parseFloat((splitVal - prev).toFixed(2));
          }
        } else {
          point[r.athlete] = splitVal;
        }
      }
    });
    return point;
  });
}

export function computeStats(records: SwimRecord[]) {
  if (records.length === 0) {
    return { count: 0, bestTime: 0, avgPace: 0 };
  }
  const times = records.map((r) => r.totalTime).filter((t) => t > 0);
  const bestTime = times.length ? Math.min(...times) : 0;

  const paces: number[] = [];
  records.forEach((r) => {
    const dists = Object.keys(r.splits).map(Number).sort((a, b) => a - b);
    if (dists.length >= 2) {
      const seg = r.splits[String(dists[1])]! - r.splits[String(dists[0])]!;
      paces.push(seg);
    } else if (r.splits["50"]) {
      paces.push(r.splits["50"]);
    }
  });
  const avgPace = paces.length
    ? paces.reduce((a, b) => a + b, 0) / paces.length
    : 0;

  return { count: records.length, bestTime, avgPace };
}

/** Sort age-group labels by first number so "9" comes before "10-11". */
export function sortAgeGroups(groups: string[]): string[] {
  return [...groups].sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] ?? "", 10);
    const numB = parseInt(b.match(/\d+/)?.[0] ?? "", 10);
    if (Number.isFinite(numA) && Number.isFinite(numB) && numA !== numB) {
      return numA - numB;
    }
    return a.localeCompare(b, "th");
  });
}

const Y_AXIS_STEP = 5;

/** Y-axis ticks every 5 units so pacing differences are easier to read. */
export function getChartYAxisConfig(
  chartData: { distance: number; [key: string]: number | string }[],
  seriesKeys: string[]
): { domain: [number, number]; ticks: number[] } {
  let min = Infinity;
  let max = -Infinity;

  for (const point of chartData) {
    for (const key of seriesKeys) {
      const value = point[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    const ticks: number[] = [];
    for (let t = 0; t <= 60; t += Y_AXIS_STEP) ticks.push(t);
    return { domain: [0, 60], ticks };
  }

  const domainMin = Math.floor(min / Y_AXIS_STEP) * Y_AXIS_STEP;
  const domainMax = Math.ceil(max / Y_AXIS_STEP) * Y_AXIS_STEP;
  const ticks: number[] = [];
  for (let t = domainMin; t <= domainMax; t += Y_AXIS_STEP) {
    ticks.push(t);
  }

  return { domain: [domainMin, domainMax], ticks };
}

export const CHART_COLORS = [
  "#06B6D4",
  "#1E3A8A",
  "#0A192F",
  "#22c55e",
  "#f97316",
  "#8b5cf6",
  "#eab308",
  "#ec4899",
];

export const SAMPLE_FILES = {
  fr200: {
    label: "200FR M&F (ตัวอย่าง)",
    path: "/sample-data/200FR-M-F-v2.csv",
  },
  m1500: {
    label: "1500M หญิง (ตัวอย่าง)",
    path: "/sample-data/1500M-F-v2.csv",
  },
  arena2026: {
    label: "Arena Open 2026",
    path: "/sample-data/arena-open-2026.csv",
  },
} as const;

export const RESULTS_SAMPLE = {
  label: "ผลการแข่งขัน (ตัวอย่าง)",
  path: "/sample-data/results-sample.csv",
} as const;

export const ARENA_RESULTS_SAMPLE = {
  label: "Arena Open 2026",
  path: "/sample-data/arena-open-2026.csv",
} as const;
