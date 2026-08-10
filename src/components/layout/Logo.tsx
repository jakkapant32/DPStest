import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

const logoHeights = {
  sm: 36,
  md: 48,
  lg: 96,
};

export function Logo({
  variant = "dark",
  size = "md",
  showTagline = true,
  className,
}: LogoProps) {
  const height = logoHeights[size];

  return (
    <Link href="/" className={cn("group flex items-center", className)}>
      <Image
        src="/logo/dps-logo.png"
        alt="DPS — Distance Per Stroke"
        width={Math.round(height * 2.8)}
        height={height}
        className="-mr-6 h-auto w-auto transition-transform group-hover:scale-[1.02]"
        style={{ height, width: "auto" }}
        priority
      />
      {showTagline && size !== "sm" && (
        <div
          className={cn(
            "hidden flex-col border-l-2 pl-2 font-montserrat text-[9px] font-bold leading-tight tracking-[0.25em] sm:flex",
            variant === "light"
              ? "border-slate-700 text-slate-400"
              : "border-slate-200 text-slate-500"
          )}
        >
          <span>DISTANCE</span>
          <span>PER STROKE</span>
        </div>
      )}
    </Link>
  );
}
