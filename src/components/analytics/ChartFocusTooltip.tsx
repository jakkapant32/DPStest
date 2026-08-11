"use client";

import type { TooltipProps } from "recharts";

interface ChartFocusTooltipProps extends TooltipProps<number, string> {
  focusAthlete: string | null;
  valueLabel?: string;
}

export function ChartFocusTooltip({
  active,
  payload,
  label,
  focusAthlete,
  valueLabel = "ค่า",
}: ChartFocusTooltipProps) {
  if (!active || !payload?.length || !focusAthlete) return null;

  const entry = payload.find((p) => p.dataKey === focusAthlete);
  if (!entry || entry.value == null) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="max-w-[220px] truncate text-xs font-bold text-dps-navy">{focusAthlete}</p>
      <p className="mt-0.5 font-mono text-sm text-slate-800">
        {label}m · {valueLabel} {Number(entry.value).toFixed(2)}
      </p>
    </div>
  );
}
