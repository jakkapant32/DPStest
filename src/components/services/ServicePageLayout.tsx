import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Card, Button, SectionHeader } from "@/components/ui/Card";

interface Feature {
  title: string;
  desc: string;
}

interface ServicePageLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  features: Feature[];
  ctaHref?: string;
  ctaLabel?: string;
}

export function ServicePageLayout({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  features,
  ctaHref = "/about",
  ctaLabel = "ติดต่อเรา",
}: ServicePageLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader eyebrow={eyebrow} title={title} className="mb-6" />
      <p className="mx-auto mb-12 max-w-3xl text-center text-lg leading-relaxed text-slate-600">
        {subtitle}
      </p>

      <Card className="mx-auto mb-12 max-w-4xl">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-dps-cyan/10 text-dps-cyan">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dps-navy">บริการของ DPS</h2>
            <p className="mt-2 leading-relaxed text-slate-600">
              ดำเนินงานภายใต้มาตรฐานมืออาชีพ พร้อมทีมผู้เชี่ยวชาญด้านกีฬาว่ายน้ำ
              และเครือข่ายในอุตสาหกรรมทั้งในและต่างประเทศ
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} variant="muted" className="h-full">
            <h3 className="mb-2 font-semibold text-slate-800">{f.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href={ctaHref}>
          <Button size="lg" className="group">
            {ctaLabel}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
