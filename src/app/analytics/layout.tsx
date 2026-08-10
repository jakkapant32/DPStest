import { AnalyticsSubNav } from "@/components/analytics/AnalyticsSubNav";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pattern-bg min-h-screen">
      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
        <AnalyticsSubNav />
        {children}
      </div>
    </div>
  );
}
