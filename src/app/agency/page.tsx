import { Users } from "lucide-react";
import { ServicePageLayout } from "@/components/services/ServicePageLayout";

export const metadata = {
  title: "เอเจนซี่นักกีฬา",
};

export default function AgencyPage() {
  return (
    <ServicePageLayout
      eyebrow="ATHLETE AGENCY"
      title="เอเจนซี่นักกีฬา"
      subtitle="ดูแลและส่งเสริมนักว่ายน้ำในเส้นทางอาชีพ ตั้งแต่ระดับเยาวชนจนถึงนักกีฬาอาชีพ"
      icon={Users}
      features={[
        {
          title: "การจัดการภาพลักษณ์",
          desc: "วางแผน Personal Branding และสื่อสารกับแฟนกีฬาและสปอนเซอร์",
        },
        {
          title: "ประสานงานสัญญาและสปอนเซอร์",
          desc: "เชื่อมโยงนักกีฬากับแบรนด์และพันธมิตรที่เหมาะสม",
        },
        {
          title: "วางแผนเส้นทางอาชีพ",
          desc: "กำหนดเป้าหมายการแข่งขัน การฝึกซ้อม และการพัฒนาระยะยาว",
        },
        {
          title: "ดูแลสื่อและการประชาสัมพันธ์",
          desc: "ประสานงานข่าว สื่อ และกิจกรรมส่งเสริมนักกีฬา",
        },
        {
          title: "เครือข่ายโค้ชและสโมสร",
          desc: "เชื่อมต่อกับโค้ช สโมสร และองค์กรกีฬาในและต่างประเทศ",
        },
        {
          title: "ที่ปรึกษาด้านกฎและข้อบังคับ",
          desc: "ให้คำแนะนำเรื่องสิทธิ์นักกีฬา การแข่งขัน และข้อกำหนดของสมาคม",
        },
      ]}
    />
  );
}
