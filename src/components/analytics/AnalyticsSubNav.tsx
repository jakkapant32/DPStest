"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { analyticsTools } from "@/lib/analytics-menu";

export function AnalyticsSubNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 overflow-x-auto border-b border-slate-200">
      <ul className="flex min-w-max gap-1 pb-px">
        <li>
          <Link
            href="/analytics"
            className={cn(
              "block whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors",
              pathname === "/analytics"
                ? "border-b-2 border-dps-cyan bg-dps-cyan/5 text-dps-cyan"
                : "text-slate-600 hover:bg-slate-50 hover:text-dps-navy"
            )}
          >
            ภาพรวม
          </Link>
        </li>
        {analyticsTools.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className={cn(
                "block whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors",
                pathname === tool.href || pathname.startsWith(tool.href + "/")
                  ? "border-b-2 border-dps-cyan bg-dps-cyan/5 text-dps-cyan"
                  : "text-slate-600 hover:bg-slate-50 hover:text-dps-navy"
              )}
            >
              {tool.tabLabel}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
