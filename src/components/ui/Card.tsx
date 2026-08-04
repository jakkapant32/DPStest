import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  variant?: "default" | "muted" | "dark";
}

export function Card({
  children,
  className,
  title,
  subtitle,
  variant = "default",
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-all duration-300",
        variant === "default" && "border-slate-100 bg-white shadow-sm",
        variant === "muted" &&
          "border-slate-100 bg-slate-50 hover:border-dps-cyan/30 hover:shadow-xl hover:shadow-dps-cyan/5",
        variant === "dark" && "border-slate-700 bg-slate-800 text-white",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3
              className={cn(
                "font-semibold",
                variant === "dark" ? "text-white" : "text-slate-800"
              )}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={cn("text-sm", variant === "dark" ? "text-slate-400" : "text-slate-500")}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
}

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm",
        className
      )}
    >
      <p className="text-2xl font-bold text-dps-navy">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all disabled:opacity-50",
        size === "sm" && "px-4 py-1.5 text-sm",
        size === "md" && "px-6 py-2.5 text-sm",
        size === "lg" && "px-8 py-4 text-base",
        variant === "primary" &&
          "bg-dps-cyan font-bold text-dps-navy shadow-lg shadow-cyan-500/30 hover:bg-cyan-400",
        variant === "secondary" &&
          "bg-dps-navy text-white shadow-md hover:bg-dps-blue hover:shadow-lg",
        variant === "outline" &&
          "border-2 border-dps-navy bg-white text-dps-navy hover:bg-dps-navy hover:text-white",
        variant === "ghost" &&
          "border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "live" | "upcoming" | "completed";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-slate-100 text-slate-700",
        variant === "live" && "bg-red-100 text-red-700",
        variant === "upcoming" && "border border-dps-cyan/30 bg-dps-cyan/20 text-dps-cyan",
        variant === "completed" && "bg-green-100 text-green-700"
      )}
    >
      {variant === "live" && (
        <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
      )}
      {children}
    </span>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  className?: string;
  dark?: boolean;
}

export function SectionHeader({ eyebrow, title, className, dark }: SectionHeaderProps) {
  return (
    <div className={cn("mb-12 text-center", className)}>
      {eyebrow && (
        <h2
          className={cn(
            "font-bebas mb-2 text-2xl tracking-widest",
            dark ? "text-dps-cyan" : "text-dps-cyan"
          )}
        >
          {eyebrow}
        </h2>
      )}
      <h3
        className={cn(
          "text-3xl font-bold md:text-4xl",
          dark ? "text-white" : "text-dps-navy"
        )}
      >
        {title}
      </h3>
      <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-dps-cyan" />
    </div>
  );
}
