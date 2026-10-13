const BLANK_TOKENS = new Set([
  "",
  "-",
  "nt",
  "dns",
  "dnf",
  "dq",
  "dsq",
  "ns",
  "scr",
]);

/** True for empty cells and non-times such as NT / DNS / DQ. */
export function isBlankSwimTime(value: string | undefined | null): boolean {
  if (value == null) return true;
  return BLANK_TOKENS.has(value.trim().toLowerCase());
}

/**
 * Some exports wrap an entire CSV row in one pair of quotes:
 *   "name,F,20,club,2:10.06,..."
 * Papa then sees a single column. Unwrap those rows only.
 * Standard quoted CSV (`"a","b"`) is left unchanged.
 */
export function unwrapQuotedCsvRows(csvText: string): string {
  const text = csvText.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  if (lines.length === 0) return text;

  const wholeRow = (line: string) => {
    const t = line.trim();
    if (!(t.startsWith('"') && t.endsWith('"') && t.length > 2)) return false;
    const inner = t.slice(1, -1);
    if (inner.includes('"')) return false;
    return inner.includes(",");
  };

  const quotedCount = lines.filter(wholeRow).length;
  if (quotedCount < lines.length * 0.8) return text;

  return lines
    .map((line) => {
      const t = line.trim();
      if (wholeRow(t)) return t.slice(1, -1);
      return t;
    })
    .join("\n");
}

export function findColumn(
  cols: string[],
  match: (normalized: string) => boolean
): string | undefined {
  return cols.find((col) => match(col.trim().toLowerCase()));
}
