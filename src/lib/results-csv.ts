import Papa from "papaparse";

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
  if (s === "" || s === "-") return null;
  const parts = s.split(":");
  return parts.length === 2
    ? parseInt(parts[0], 10) * 60 + parseFloat(parts[1])
    : parseFloat(parts[0]);
}

export function parseResultsCSV(csvText: string): {
  rows: ParsedResultRow[];
  distances: string[];
} {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0]?.message ?? "CSV parse error");
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
  const nameKey = cols.find(
    (k) => k.includes("ชื่อ") || k.toLowerCase().includes("name")
  );
  const genderKey = cols.find(
    (k) => k.toLowerCase() === "gender" || k === "เพศ"
  );
  const clubKey = cols.find(
    (k) => k.toLowerCase() === "สโมสร" || k.toLowerCase() === "club"
  );
  const rankKey = cols.find(
    (k) => k.includes("อันดับ") || k.toLowerCase() === "rank"
  );

  const rows: ParsedResultRow[] = data.map((row, index) => {
    const splits: Record<string, string> = {};
    distances.forEach((d) => {
      splits[d] = row[d]?.trim() || "-";
    });

    const finalTimeStr = row[finalDistance]?.trim() || "-";

    return {
      id: `csv-${index}`,
      name: (nameKey && row[nameKey]?.trim()) || "Unknown",
      gender: (genderKey && row[genderKey]?.trim()) || "-",
      ageGroup: row["รุ่นอายุ"]?.trim() || row["Age"]?.trim() || "-",
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
      row: "bg-[#FFFAF0] hover:bg-[#FEF3C7]",
      name: "text-[#B45309]",
      rank: "text-[#B45309]",
      medal: 1 as const,
    };
  }
  if (rank === 2) {
    return {
      row: "bg-[#F8FAFC] hover:bg-[#F1F5F9]",
      name: "text-[#475569]",
      rank: "text-[#475569]",
      medal: 2 as const,
    };
  }
  if (rank === 3) {
    return {
      row: "bg-[#FFF5F0] hover:bg-[#FFEDD5]",
      name: "text-[#C2410C]",
      rank: "text-[#C2410C]",
      medal: 3 as const,
    };
  }
  return {
    row: "bg-white hover:bg-slate-50",
    name: "text-dps-navy",
    rank: "text-slate-700",
    medal: null,
  };
}
