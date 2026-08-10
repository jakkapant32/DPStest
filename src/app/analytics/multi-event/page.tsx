import { SwimDashboard } from "@/components/analytics/SwimDashboard";
import { SAMPLE_FILES } from "@/lib/analytics";

export const metadata = {
  title: "วิเคราะห์ — หลายรายการแข่งขัน",
};

export default function MultiEventAnalyticsPage() {
  return (
    <SwimDashboard
      mode="multi-event"
      title="BlueHub Swimming Analytics — Multi-Event"
      description="นำเข้าหลายรายการแข่งขัน — ตั้งชื่อ tag แล้วโหลด CSV ทีละรายการ"
      samples={[
        { ...SAMPLE_FILES.fr200, tag: "200FR" },
        { ...SAMPLE_FILES.m1500, tag: "1500M" },
      ]}
    />
  );
}
