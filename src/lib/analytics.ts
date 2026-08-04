import Papa from "papaparse";
import type { Gender, SwimRecord } from "./types";

export function parseCSVToRecords(csvText: string): SwimRecord[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0]?.message ?? "CSV parse error");
  }

  return parsed.data
    .map((row) => {
      const athlete = row.athlete ?? row["ชื่อ"] ?? row["name"] ?? "";
      if (!athlete) return null;

      const genderRaw = (row.gender ?? row["เพศ"] ?? "female").toLowerCase();
      const gender: Gender =
        genderRaw.startsWith("m") || genderRaw === "ชาย" ? "male" : "female";

      const splits: Record<string, number> = {};
      for (const key of Object.keys(row)) {
        const match = key.match(/split[_\s]?(\d+)/i);
        if (match) {
          const val = parseFloat(row[key] ?? "");
          if (!Number.isNaN(val)) splits[match[1]] = val;
        }
      }

      if (Object.keys(splits).length === 0) {
        for (const dist of ["50", "100", "150", "200", "400"]) {
          const val = parseFloat(row[dist] ?? row[`${dist}m`] ?? "");
          if (!Number.isNaN(val)) splits[dist] = val;
        }
      }

      const totalTime = parseFloat(
        row.total_time ?? row["total"] ?? row["time"] ?? row["เวลา"] ?? "0"
      );

      return {
        athlete,
        gender,
        ageGroup: row.age_group ?? row["ageGroup"] ?? row["รุ่นอายุ"] ?? "",
        club: row.club ?? row["สโมสร"] ?? "",
        stroke: row.stroke ?? row["ท่า"] ?? "freestyle",
        distance: parseInt(row.distance ?? row["ระยะ"] ?? "200", 10),
        splits,
        totalTime: Number.isNaN(totalTime) ? 0 : totalTime,
      } satisfies SwimRecord;
    })
    .filter((r): r is SwimRecord => r !== null);
}

export async function fetchCSVFromUrl(url: string): Promise<string> {
  const res = await fetch(url);
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

  return sortedDistances.map((dist) => {
    const point: { distance: number; [key: string]: number | string } = {
      distance: dist,
    };
    records.forEach((r) => {
      const splitVal = r.splits[String(dist)];
      if (splitVal === undefined) return;
      if (mode === "pacing") {
        point[r.athlete] = splitVal;
      } else {
        const prevDist =
          sortedDistances.filter((d) => d <= dist).slice(0, -1).pop() ?? 0;
        let cumulative = 0;
        for (const d of sortedDistances) {
          if (d > dist) break;
          cumulative += r.splits[String(d)] ?? 0;
        }
        point[r.athlete] = cumulative;
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
  const bestTime = Math.min(...times);
  const avgPace =
    records.reduce((sum, r) => {
      const firstSplit = r.splits["50"] ?? r.totalTime / (r.distance / 50);
      return sum + firstSplit;
    }, 0) / records.length;

  return { count: records.length, bestTime, avgPace };
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
