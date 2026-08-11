"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { analyticsTools } from "@/lib/analytics-menu";
import { cn } from "@/lib/utils";

export function AnalyticsNavDropdown({ compact }: { compact?: boolean }) {
  const currentPath = usePathname();
  const isActive = currentPath === "/analytics" || currentPath.startsWith("/analytics/");

  if (compact) {
    return (
      <div className="border-t border-slate-100 pt-2 mt-1">
        <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          วิเคราะห์ข้อมูล
        </p>
        <Link
          href="/analytics"
          className={cn(
            "block rounded-lg px-3 py-2 text-sm font-medium",
            currentPath === "/analytics"
              ? "bg-dps-cyan/10 text-dps-cyan"
              : "text-slate-600 hover:bg-slate-50"
          )}
        >
          ภาพรวม
        </Link>
        {analyticsTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm font-medium",
              currentPath === tool.href
                ? "bg-dps-cyan/10 text-dps-cyan"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {tool.tabLabel}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="group relative">
      <Link
        href="/analytics"
        className={cn(
          "inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-base font-medium transition-colors",
          isActive ? "text-dps-cyan" : "text-slate-600 hover:text-dps-cyan"
        )}
      >
        วิเคราะห์ข้อมูล
        <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
      </Link>

      <div className="pointer-events-none absolute left-0 top-full z-50 pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="min-w-[240px] overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
          <Link
            href="/analytics"
            className={cn(
              "block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50",
              currentPath === "/analytics"
                ? "bg-dps-cyan/10 text-dps-cyan"
                : "text-slate-700"
            )}
          >
            ภาพรวม
          </Link>
          <div className="my-1 border-t border-slate-100" />
          {analyticsTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={cn(
                "block px-4 py-2.5 text-sm transition-colors hover:bg-slate-50",
                currentPath === tool.href
                  ? "bg-dps-cyan/10 font-medium text-dps-cyan"
                  : "text-slate-600"
              )}
            >
              {tool.tabLabel}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
