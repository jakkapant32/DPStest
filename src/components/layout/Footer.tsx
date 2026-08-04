import Link from "next/link";
import { Waves } from "lucide-react";
import { siteConfig } from "@/lib/types";

export function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-gradient-to-b from-white to-brand-50/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
                <Waves className="h-4 w-4" />
              </div>
              <span className="font-bold text-brand-700">{siteConfig.name}</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">{siteConfig.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">เมนู</h3>
            <ul className="mt-3 space-y-2">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-brand-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">ติดต่อ</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>อีเมล: hello@bluehub.co</li>
              <li>Line: @bluehub</li>
              <li>กรุงเทพฯ, ประเทศไทย</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-100 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {siteConfig.name}. United by Water.
        </div>
      </div>
    </footer>
  );
}
