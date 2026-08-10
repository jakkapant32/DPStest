"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { siteConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { AnalyticsNavDropdown } from "./AnalyticsNavDropdown";
import { EventsNavDropdown } from "./EventsNavDropdown";

export function Header() {
  const currentPath = usePathname();

  return (
    <header className="fixed z-50 w-full border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-28 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo size="lg" />

        <nav className="hidden items-center gap-4 lg:flex xl:gap-5">
          {siteConfig.nav.map((item) =>
            item.href === "/analytics" ? (
              <AnalyticsNavDropdown key={item.href} />
            ) : item.href === "/events" ? (
              <EventsNavDropdown key={item.href} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors xl:text-base",
                  currentPath === item.href ||
                    currentPath.startsWith(item.href + "/")
                    ? "text-dps-cyan"
                    : "text-slate-600 hover:text-dps-cyan"
                )}
              >
                {item.label}
              </Link>
            )
          )}
          <Link
            href="/about"
            className="rounded-full bg-dps-navy px-6 py-2.5 font-medium text-white shadow-md transition-all hover:bg-dps-blue hover:shadow-lg"
          >
            ติดต่อเรา
          </Link>
        </nav>

        <MobileNav currentPath={currentPath} />
      </div>
    </header>
  );
}

function MobileNav({ currentPath }: { currentPath: string }) {
  return (
    <details className="relative lg:hidden">
      <summary className="cursor-pointer list-none text-slate-600 hover:text-dps-navy">
        <Menu className="h-8 w-8" />
      </summary>
      <div className="absolute right-0 mt-2 max-h-[80vh] w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-card">
        {siteConfig.nav.map((item) =>
          item.href === "/analytics" ? (
            <AnalyticsNavDropdown key={item.href} compact />
          ) : item.href === "/events" ? (
            <EventsNavDropdown key={item.href} compact />
          ) : (
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
              {item.label}
            </Link>
          )
        )}
        <Link
          href="/about"
          className="mt-1 block rounded-full bg-dps-navy px-3 py-2 text-center text-sm font-medium text-white"
        >
          ติดต่อเรา
        </Link>
      </div>
    </details>
  );
}
