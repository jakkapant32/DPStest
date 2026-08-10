import Image from "next/image";
import { cn } from "@/lib/utils";

const MEDAL_SRC = {
  1: "/icons/medals/medal-1.png",
  2: "/icons/medals/medal-2.png",
  3: "/icons/medals/medal-3.png",
} as const;

export type MedalRank = keyof typeof MEDAL_SRC;

interface MedalIconProps {
  rank: MedalRank;
  className?: string;
}

export function MedalIcon({ rank, className }: MedalIconProps) {
  return (
    <Image
      src={MEDAL_SRC[rank]}
      alt=""
      width={169}
      height={295}
      aria-hidden
      className={cn("inline-block h-7 w-auto shrink-0", className)}
    />
  );
}
