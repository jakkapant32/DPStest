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

  const navLinkClass = (href: string) =>
    cn(
      "whitespace-nowrap text-base font-medium transition-colors",
      currentPath === href || currentPath.startsWith(href + "/")
        ? "text-dps-cyan"
        : "text-slate-600 hover:text-dps-cyan"
    );

  return (
    <header className="fixed z-50 w-full border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-28 w-full max-w-[1600px] items-center gap-4 px-4 sm:px-5 lg:gap-6 lg:px-6 xl:px-8">
        <Logo size="lg" className="shrink-0" />

        <nav className="hidden min-w-0 flex-1 flex-nowrap items-center justify-center gap-3 lg:flex xl:gap-4">
          {siteConfig.nav.map((item) =>
            item.href === "/analytics" ? (
              <AnalyticsNavDropdown key={item.href} />
            ) : item.href === "/events" ? (
              <EventsNavDropdown key={item.href} />
            ) : (
              <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        <Link
          href="/about"
          className="hidden shrink-0 whitespace-nowrap rounded-full bg-dps-navy px-5 py-2.5 text-base font-medium text-white shadow-md transition-all hover:bg-dps-blue hover:shadow-lg lg:inline-flex xl:px-6"
        >
          ติดต่อเรา
        </Link>

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
