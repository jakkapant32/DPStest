import Papa from "papaparse";
import { findColumn, isBlankSwimTime, unwrapQuotedCsvRows } from "./csv-normalize";

export interface ParsedResultRow {
  id: string;
  name: string;
  gender: string;
  ageGroup: string;
  club: string;
  rankOrig: string;
  finalTimeStr: string;
  finalTimeSec: number | null;
  splits: Record<string, string>;
}

export function timeToSec(str: string | undefined | null): number | null {
  if (!str || typeof str !== "string") return null;
  const s = str.trim();
  if (isBlankSwimTime(s)) return null;
  const parts = s.split(":");
  const value =
    parts.length === 2
      ? parseInt(parts[0], 10) * 60 + parseFloat(parts[1])
      : parseFloat(parts[0]);
  return Number.isFinite(value) ? value : null;
}

export function parseResultsCSV(csvText: string): {
  rows: ParsedResultRow[];
  distances: string[];
} {
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

  const data = parsed.data;
  if (data.length === 0) throw new Error("ไม่พบข้อมูลในไฟล์");

  const cols = Object.keys(data[0] ?? {});
  const distances = cols
    .filter((c) => c.trim().match(/^\d+m$/i))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  if (distances.length === 0) {
    throw new Error("ไม่พบคอลัมน์ระยะทาง (เช่น 50m, 100m)");
  }

  const finalDistance = distances[distances.length - 1];
  const nameKey = findColumn(
    cols,
    (k) => k.includes("ชื่อ") || k.includes("name") || k.includes("athlete")
  );
  const genderKey = findColumn(cols, (k) => k === "gender" || k === "เพศ");
  const clubKey = findColumn(cols, (k) => k === "สโมสร" || k === "club");
  const rankKey = findColumn(cols, (k) => k.includes("อันดับ") || k === "rank");
  const ageKey = findColumn(
    cols,
    (k) => k === "age" || k === "รุ่นอายุ" || k === "age_group" || k === "agegroup"
  );
  const officialTimeKey = findColumn(
    cols,
    (k) => k === "time" || k === "เวลา" || k === "total_time" || k === "total"
  );

  const rows: ParsedResultRow[] = data.map((row, index) => {
    const splits: Record<string, string> = {};
    distances.forEach((d) => {
      const cell = row[d]?.trim() || "";
      splits[d] = isBlankSwimTime(cell) ? "-" : cell;
    });

    const official = officialTimeKey ? row[officialTimeKey]?.trim() : "";
    const fromSplit = finalDistance ? row[finalDistance]?.trim() : "";
    const finalTimeStr = !isBlankSwimTime(official)
      ? official
      : !isBlankSwimTime(fromSplit)
        ? fromSplit
        : "-";

    return {
      id: `csv-${index}`,
      name: (nameKey && row[nameKey]?.trim()) || "Unknown",
      gender: (genderKey && row[genderKey]?.trim()) || "-",
      ageGroup: (ageKey && row[ageKey]?.trim()) || "-",
      club: (clubKey && row[clubKey]?.trim()) || "-",
      rankOrig: (rankKey && row[rankKey]?.trim()) || "",
      finalTimeStr,
      finalTimeSec: timeToSec(finalTimeStr),
      splits,
    };
  });

  return { rows, distances };
}

export function sortResultRows(
  rows: ParsedResultRow[],
  filterAge: string
): ParsedResultRow[] {
  return [...rows].sort((a, b) => {
    if (filterAge === "All" && a.ageGroup !== b.ageGroup) {
      return a.ageGroup.localeCompare(b.ageGroup);
    }
    if (a.finalTimeSec === null) return 1;
    if (b.finalTimeSec === null) return -1;
    return a.finalTimeSec - b.finalTimeSec;
  });
}

export function getRankStyle(rank: number) {
  if (rank === 1) {
    return {
      rowCellStyle: { backgroundColor: "#93C5FD" } as const,
      rankTextStyle: { color: "#1E3A8A", fontWeight: 700 } as const,
      medal: 1 as const,
      isPodium: true,
    };
  }
  if (rank === 2) {
    return {
      rowCellStyle: { backgroundColor: "#BFDBFE" } as const,
      rankTextStyle: { color: "#1D4ED8", fontWeight: 600 } as const,
      medal: 2 as const,
      isPodium: true,
    };
  }
  if (rank === 3) {
    return {
      rowCellStyle: { backgroundColor: "#DBEAFE" } as const,
      rankTextStyle: { color: "#2563EB", fontWeight: 600 } as const,
      medal: 3 as const,
      isPodium: true,
    };
  }
  return {
    rowCellStyle: undefined,
    rankTextStyle: undefined,
    medal: null,
    isPodium: false,
  };
}
