import { AnalyticsPanel } from "@/components/analytics/AnalyticsPanel";
import { sampleAnalyticsLeft, sampleAnalyticsRight } from "@/lib/mock-data";

export const metadata = {
  title: "วิเคราะห์ข้อมูล",
};

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Swimming <span className="text-gradient">Dual Analytics</span>
        </h1>
        <p className="mt-2 text-gray-500">
          เปรียบเทียบสถิติ 2 รายการแข่งขัน side-by-side
          รองรับ CSV และ Google Sheets
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <AnalyticsPanel side="left" defaultDataset={sampleAnalyticsLeft} />
        <AnalyticsPanel side="right" defaultDataset={sampleAnalyticsRight} />
      </div>
    </div>
  );
}
