import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

export function Logo({
  variant = "dark",
  size = "md",
  showTagline = true,
  className,
}: LogoProps) {
  const textSize =
    size === "lg" ? "text-5xl" : size === "sm" ? "text-3xl" : "text-4xl";
  const barH = size === "lg" ? "h-10" : size === "sm" ? "h-6" : "h-8";
  const barW = size === "sm" ? "w-1" : "w-1.5";

  return (
    <Link href="/" className={cn("group flex items-center", className)}>
      <div
        className={cn(
          "font-bebas flex items-center leading-none tracking-wider transition-transform group-hover:scale-105",
          textSize
        )}
      >
        <span className={variant === "light" ? "text-white" : "text-dps-navy"}>
          D
        </span>
        <div className={cn(barW, barH, "mx-1 rotate-12 bg-dps-cyan")} />
        <span className={variant === "light" ? "text-slate-300" : "text-dps-blue"}>
          P
        </span>
        <div
          className={cn(
            barW,
            barH,
            "mx-1 rotate-12",
            variant === "light" ? "bg-slate-500" : "bg-dps-blue"
          )}
        />
        <span className="text-dps-cyan">S</span>
      </div>
      {showTagline && size !== "sm" && (
        <div
          className={cn(
            "ml-3 hidden flex-col border-l-2 pl-3 font-montserrat text-[9px] font-bold leading-tight tracking-[0.25em] sm:flex",
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
