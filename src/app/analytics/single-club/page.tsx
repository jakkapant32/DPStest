import { SwimDashboard } from "@/components/analytics/SwimDashboard";
import { SAMPLE_FILES } from "@/lib/analytics";

export const metadata = {
  title: "วิเคราะห์ — ทีละ 1 สโมสร",
};

export default function SingleClubAnalyticsPage() {
  return (
    <SwimDashboard
      mode="single-club"
      title="Swimming Data Analytics"
      description="เลือกสโมสรทีละรายการเพื่อเปรียบเทียบนักกีฬา — รองรับ CSV และ Google Sheets"
      samples={[SAMPLE_FILES.fr200]}
    />
  );
}
