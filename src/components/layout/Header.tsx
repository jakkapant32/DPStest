"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Waves } from "lucide-react";
import { siteConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Header() {
  const currentPath = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-md">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-brand-700">{siteConfig.name}</span>
            <span className="hidden text-xs text-gray-400 sm:block">
              {siteConfig.tagline}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                currentPath === item.href || currentPath.startsWith(item.href + "/")
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-brand-600"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <MobileNav currentPath={currentPath} />
      </div>
    </header>
  );
}

function MobileNav({ currentPath }: { currentPath: string }) {
  return (
    <details className="relative md:hidden">
      <summary className="cursor-pointer list-none rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
        เมนู
      </summary>
      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-card">
        {siteConfig.nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm",
              currentPath === item.href
                ? "bg-brand-50 text-brand-700"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
