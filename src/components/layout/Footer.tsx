import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { siteConfig } from "@/lib/types";
import { eventsMenuHref, eventsTools } from "@/lib/events-menu";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 pt-16 pb-8 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo variant="light" showTagline={false} size="md" className="mb-6" />
            <p className="mb-6 leading-relaxed text-slate-400">{siteConfig.description}</p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-dps-cyan"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <h4 className="mb-6 font-bold">เมนู</h4>
            <ul className="space-y-3">
              {siteConfig.nav.flatMap((item) =>
                item.href === "/events"
                  ? [
                      <li key={eventsMenuHref}>
                        <Link
                          href={eventsMenuHref}
                          className="text-slate-400 transition-colors hover:text-dps-cyan"
                        >
                          จัดการแข่งขัน
                        </Link>
                      </li>,
                      ...eventsTools.map((sub) => (
                        <li key={sub.href} className="pl-3">
                          <Link
                            href={sub.href}
                            className="text-slate-400 transition-colors hover:text-dps-cyan"
                          >
                            {sub.tabLabel}
                          </Link>
                        </li>
                      )),
                    ]
                  : [
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-slate-400 transition-colors hover:text-dps-cyan"
                        >
                          {item.label}
                        </Link>
                      </li>,
                    ]
              )}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="mb-6 font-bold">ติดต่อเรา</h4>
            <ul className="space-y-4">
              <li className="flex items-start text-slate-400">
                <MapPin className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-dps-cyan" />
                <span>123 อาคารสปอร์ตคอมเพล็กซ์ ชั้น 9 ถนนสุขุมวิท กรุงเทพมหานคร 10110</span>
              </li>
              <li className="flex items-center text-slate-400">
                <Phone className="mr-3 h-5 w-5 shrink-0 text-dps-cyan" />
                <span>02-XXX-XXXX</span>
              </li>
              <li className="flex items-center text-slate-400">
                <Mail className="mr-3 h-5 w-5 shrink-0 text-dps-cyan" />
                <span>contact@dps-swimming.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-slate-800 pt-8 text-sm text-slate-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} Distance Per Stroke (DPS) Co., Ltd. All rights
            reserved.
          </p>
          <div className="mt-4 flex gap-4 md:mt-0">
            <a href="#" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
