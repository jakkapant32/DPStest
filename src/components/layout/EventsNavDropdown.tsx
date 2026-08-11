"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { eventsMenuHref, eventsTools } from "@/lib/events-menu";
import { cn } from "@/lib/utils";

export function EventsNavDropdown({ compact }: { compact?: boolean }) {
  const currentPath = usePathname();
  const isActive =
    currentPath === eventsMenuHref ||
    eventsTools.some(
      (item) =>
        currentPath === item.href || currentPath.startsWith(item.href + "/")
    );

  if (compact) {
    return (
      <div className="mt-1 border-t border-slate-100 pt-2">
        <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          จัดการแข่งขัน
        </p>
        <Link
          href={eventsMenuHref}
          className={cn(
            "block rounded-lg px-3 py-2 text-sm font-medium",
            currentPath === eventsMenuHref
              ? "bg-dps-cyan/10 text-dps-cyan"
              : "text-slate-600 hover:bg-slate-50"
          )}
        >
          ภาพรวม
        </Link>
        {eventsTools.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm font-medium",
              currentPath === item.href ||
                currentPath.startsWith(item.href + "/")
                ? "bg-dps-cyan/10 text-dps-cyan"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {item.tabLabel}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={eventsMenuHref}
        className={cn(
          "inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-base font-medium transition-colors",
          isActive ? "text-dps-cyan" : "text-slate-600 hover:text-dps-cyan"
        )}
      >
        จัดการแข่งขัน
        <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
      </Link>

      <div className="pointer-events-none absolute left-0 top-full z-50 pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="min-w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
          <Link
            href={eventsMenuHref}
            className={cn(
              "block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50",
              currentPath === eventsMenuHref
                ? "bg-dps-cyan/10 text-dps-cyan"
                : "text-slate-700"
            )}
          >
            ภาพรวม
          </Link>
          <div className="my-1 border-t border-slate-100" />
          {eventsTools.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-4 py-2.5 text-sm transition-colors hover:bg-slate-50",
                currentPath === item.href ||
                  currentPath.startsWith(item.href + "/")
                  ? "bg-dps-cyan/10 font-medium text-dps-cyan"
                  : "text-slate-600"
              )}
            >
              {item.tabLabel}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
