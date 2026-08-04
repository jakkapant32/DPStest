"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isShop = pathname === "/shop";
  const isHome = pathname === "/";

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main
        className={cn(
          "min-h-screen",
          !isHome && !isShop && "bg-slate-50 pt-20",
          isHome && "pt-0",
          isShop && "pt-20"
        )}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
