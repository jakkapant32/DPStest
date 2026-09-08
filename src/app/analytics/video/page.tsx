import { VideoWorkspace } from "@/components/analytics/VideoWorkspace";

export const metadata = {
  title: "Video Analysis",
};

export default function VideoAnalyticsPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-dps-cyan">
          VIDEO ANALYSIS
        </p>
        <h1 className="mt-2 text-2xl font-bold text-dps-navy md:text-3xl">
          วิเคราะห์วิดีโอ — ระยะ × เวลา
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
          แท็กจุดที่นักกีฬาถึงแต่ละเมตร (สไตล์ Mako Vision) แล้วได้ split /
          cumulative — ใช้มือหรือ AI Suggest
        </p>
      </div>
      <VideoWorkspace />
    </>
  );
}
