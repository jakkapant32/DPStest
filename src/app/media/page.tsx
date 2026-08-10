import { Camera } from "lucide-react";
import { ServicePageLayout } from "@/components/services/ServicePageLayout";

export const metadata = {
  title: "สื่อ & Portfolio",
};

export default function MediaPage() {
  return (
    <ServicePageLayout
      eyebrow="MEDIA & PORTFOLIO"
      title="ถ่ายภาพ & วิดีโอ Profile / Portfolio"
      subtitle="ผลิตสื่อมืออาชีพสำหรับนักว่ายน้ำ — ภาพนิ่ง วิดีโอ และ Portfolio สำหรับสมัครเรียน สปอนเซอร์ และสื่อสารออนไลน์"
      icon={Camera}
      features={[
        {
          title: "Athlete Profile Photo",
          desc: "ถ่ายภาพโปรไฟล์มืออาชีพสำหรับใช้ในโซเชียล สื่อ และเอกสารสมัคร",
        },
        {
          title: "Highlight Reel / วิดีโอ",
          desc: "ตัดต่อคลิปไฮไลท์การแข่งขันและการฝึกซ้อมสำหรับสมัครทุนและมหาวิทยาลัย",
        },
        {
          title: "Portfolio สมัครเรียน",
          desc: "จัดทำชุดสื่อครบวงจรตามข้อกำหนดของมหาวิทยาลัยและโปรแกรมทุน",
        },
        {
          title: "ถ่ายทำในสระและสนามแข่ง",
          desc: "ทีมงานถ่ายทำ On-site ทั้งในและนอกสระ พร้อมอุปกรณ์มืออาชีพ",
        },
        {
          title: "Content สำหรับ Social Media",
          desc: "ผลิตคอนเทนต์ Reels, Shorts และโพสต์สำหรับสร้าง Personal Brand",
        },
        {
          title: "แพ็กเกจสปอนเซอร์",
          desc: "จัดทำสื่อสำหรับแบรนด์และสปอนเซอร์ที่ร่วมสนับสนุนนักกีฬา",
        },
      ]}
    />
  );
}
