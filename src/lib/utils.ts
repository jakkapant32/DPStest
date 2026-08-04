import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSwimTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toFixed(2).padStart(5, "0")}`;
  }
  return secs.toFixed(2);
}

export function parseSwimTime(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes(":")) {
    const [minPart, secPart] = trimmed.split(":");
    const mins = parseFloat(minPart);
    const secs = parseFloat(secPart);
    if (Number.isNaN(mins) || Number.isNaN(secs)) return null;
    return mins * 60 + secs;
  }
  const secs = parseFloat(trimmed);
  return Number.isNaN(secs) ? null : secs;
}
