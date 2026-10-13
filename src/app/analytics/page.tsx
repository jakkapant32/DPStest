import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/Card";
import { analyticsTools } from "@/lib/analytics-menu";
import { SAMPLE_FILES } from "@/lib/analytics";

export const metadata = {
  title: "วิเคราะห์ข้อมูล",
};

export default function AnalyticsHubPage() {
  return (
    <>
      <SectionHeader
        eyebrow="DATA ANALYTICS"
        title="ระบบวิเคราะห์ข้อมูล"
        className="mb-4"
      />
      <p className="mb-10 text-center text-slate-500">
        เลือกเครื่องมือวิเคราะห์ตามตัวอย่างจากลูกค้า — รองรับ CSV และ Google Sheets
      </p>

      <div className="mb-8 rounded-xl border border-dps-cyan/20 bg-dps-cyan/5 p-4 text-center text-sm text-slate-600">
        ไฟล์ตัวอย่าง:{" "}
        <span className="font-medium text-dps-navy">{SAMPLE_FILES.fr200.label}</span>,{" "}
        <span className="font-medium text-dps-navy">{SAMPLE_FILES.m1500.label}</span>,{" "}
        <span className="font-medium text-dps-navy">{SAMPLE_FILES.arena2026.label}</span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {analyticsTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-dps-cyan/40 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-dps-cyan/10 text-dps-cyan transition group-hover:bg-dps-cyan group-hover:text-white">
              <tool.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-bold text-slate-800">{tool.title}</h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              {tool.description}
            </p>
            {tool.sampleHint && (
              <p className="mb-3 text-xs text-dps-cyan">ตัวอย่าง: {tool.sampleHint}</p>
            )}
            <span className="inline-flex items-center text-sm font-semibold text-dps-navy group-hover:text-dps-cyan">
              เปิดใช้งาน
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
