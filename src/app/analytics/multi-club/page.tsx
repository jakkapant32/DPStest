import { SwimDashboard } from "@/components/analytics/SwimDashboard";
import { SAMPLE_FILES } from "@/lib/analytics";

export const metadata = {
  title: "วิเคราะห์ — หลายสโมสร",
};

export default function MultiClubAnalyticsPage() {
  return (
    <SwimDashboard
      mode="multi-club"
      title="Swimming Data Analytics — Multi-Club"
      description="เลือกได้มากกว่า 1 สโมสร — ชี้เมาส์ที่เส้นกราฟเพื่อไฮไลท์"
      samples={[SAMPLE_FILES.fr200]}
    />
  );
}
