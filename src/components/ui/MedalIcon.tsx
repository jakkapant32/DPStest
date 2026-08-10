import { cn } from "@/lib/utils";

const MEDAL_VARIANTS = {
  1: {
    circle: "#EAB308",
    ring: "#CA8A04",
    ribbon: "#FDE047",
    ribbonShadow: "#CA8A04",
  },
  2: {
    circle: "#94A3B8",
    ring: "#64748B",
    ribbon: "#E2E8F0",
    ribbonShadow: "#64748B",
  },
  3: {
    circle: "#EA580C",
    ring: "#C2410C",
    ribbon: "#FDBA74",
    ribbonShadow: "#C2410C",
  },
} as const;

export type MedalRank = keyof typeof MEDAL_VARIANTS;

interface MedalIconProps {
  rank: MedalRank;
  className?: string;
}

export function MedalIcon({ rank, className }: MedalIconProps) {
  const colors = MEDAL_VARIANTS[rank];

  return (
    <svg
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("inline-block h-[18px] w-[15px] shrink-0", className)}
    >
      <path
        d="M6.5 13.5L4.5 22L8 19.8L10 22.5L12 19.8L15.5 22L13.5 13.5"
        fill={colors.ribbonShadow}
        opacity={0.35}
      />
      <path
        d="M6 13L4.5 21L8 19L10 21.5L12 19L15.5 21L14 13"
        fill={colors.ribbon}
        stroke={colors.ring}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="7.5" r="6.25" fill={colors.circle} stroke={colors.ring} strokeWidth="1.25" />
      <circle
        cx="10"
        cy="7.5"
        r="4.25"
        fill="none"
        stroke="white"
        strokeWidth="0.75"
        opacity={0.45}
      />
      <circle cx="8.25" cy="5.75" r="1.1" fill="white" opacity={0.35} />
    </svg>
  );
}
