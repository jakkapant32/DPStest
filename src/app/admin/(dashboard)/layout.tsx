import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="min-w-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6">{children}</div>
      </div>
    </div>
  );
}
