import { GraduationCap } from "lucide-react";
import { ServicePageLayout } from "@/components/services/ServicePageLayout";

export const metadata = {
  title: "การศึกษา & ทุนการศึกษา",
};

export default function EducationPage() {
  return (
    <ServicePageLayout
      eyebrow="EDUCATION & SCHOLARSHIP"
      title="การศึกษาต่อ & ทุนการศึกษา"
      subtitle="ให้คำปรึกษาและประสานงานเรียนต่อทั้งในและต่างประเทศ รวมทุนการศึกษากีฬา (Sports Scholarship)"
      icon={GraduationCap}
      features={[
        {
          title: "เรียนต่อในประเทศ",
          desc: "แนะแนวโรงเรียน มหาวิทยาลัย และโปรแกรมกีฬาว่ายน้ำในประเทศไทย",
        },
        {
          title: "เรียนต่อต่างประเทศ",
          desc: "ประสานงานมหาวิทยาลัยและโปรแกรมว่ายน้ำในอเมริกา ออสเตรเลีย ยุโรป และเอเชีย",
        },
        {
          title: "ทุนการศึกษากีฬา",
          desc: "จัดหาและให้คำแนะนำเรื่อง Sports Scholarship ตามผลงานและศักยภาพ",
        },
        {
          title: "เตรียม Portfolio สมัครเรียน",
          desc: "ช่วยจัดทำเอกสาร ผลการแข่งขัน และวิดีโอสำหรับสมัครมหาวิทยาลัย",
        },
        {
          title: "ที่ปรึกษาด้าน NCAA / NAIA",
          desc: "ให้คำปรึกษาเรื่อง eligibility และขั้นตอนสมัครเรียนในอเมริกา",
        },
        {
          title: "ติดตามผลและประสานงาน",
          desc: "ดูแลเอกสาร วีซ่า และประสานงานกับสถาบันการศึกษาจนถึงวันเข้าเรียน",
        },
      ]}
    />
  );
}
