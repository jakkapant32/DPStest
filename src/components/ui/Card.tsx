import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className, title, subtitle }: CardProps) {
  return (
    <div className={cn("rounded-2xl border border-gray-100 bg-white p-5 shadow-card", className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
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
        "rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-4 text-center",
        className
      )}
    >
      <p className="text-2xl font-bold text-brand-700">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md";
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
        "inline-flex items-center justify-center rounded-xl font-medium transition-all disabled:opacity-50",
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm",
        variant === "primary" &&
          "bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-md hover:shadow-lg hover:brightness-105",
        variant === "secondary" && "bg-brand-50 text-brand-700 hover:bg-brand-100",
        variant === "outline" &&
          "border border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-600",
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
        variant === "default" && "bg-gray-100 text-gray-700",
        variant === "live" && "bg-red-100 text-red-700",
        variant === "upcoming" && "bg-brand-100 text-brand-700",
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
