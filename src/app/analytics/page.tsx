import { AnalyticsPanel } from "@/components/analytics/AnalyticsPanel";
import { SectionHeader } from "@/components/ui/Card";
import { sampleAnalyticsLeft, sampleAnalyticsRight } from "@/lib/mock-data";

export const metadata = {
  title: "วิเคราะห์ข้อมูล",
};

export default function AnalyticsPage() {
  return (
    <div className="pattern-bg min-h-screen">
      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="DATA ANALYTICS"
          title="Swimming Dual Analytics"
          className="mb-8"
        />
        <p className="-mt-8 mb-10 text-center text-slate-500">
          เปรียบเทียบสถิติ 2 รายการแข่งขัน side-by-side — รองรับ CSV และ Google Sheets
        </p>

        <div className="grid gap-8 xl:grid-cols-2">
          <AnalyticsPanel side="left" defaultDataset={sampleAnalyticsLeft} />
          <AnalyticsPanel side="right" defaultDataset={sampleAnalyticsRight} />
        </div>
      </div>
    </div>
  );
}
