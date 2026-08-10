import { AnalyticsPanel } from "@/components/analytics/AnalyticsPanel";
import { SectionHeader } from "@/components/ui/Card";
import { sampleAnalyticsLeft, sampleAnalyticsRight } from "@/lib/mock-data";

export const metadata = {
  title: "เปรียบเทียบ 2 รายการ",
};

export default function CompareAnalyticsPage() {
  return (
    <>
      <SectionHeader
        eyebrow="DUAL ANALYTICS"
        title="เปรียบเทียบ 2 รายการ"
        className="mb-8"
      />
      <p className="-mt-8 mb-10 text-center text-slate-500">
        เปรียบเทียบสถิติ 2 ชุดข้อมูล side-by-side — ชี้เมาส์ที่เส้นกราฟเพื่อไฮไลท์
      </p>
      <div className="grid gap-8 xl:grid-cols-2">
        <AnalyticsPanel side="left" defaultDataset={sampleAnalyticsLeft} />
        <AnalyticsPanel side="right" defaultDataset={sampleAnalyticsRight} />
      </div>
    </>
  );
}
