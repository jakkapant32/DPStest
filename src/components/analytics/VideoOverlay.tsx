"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { CalibrationLine, LaneBand } from "@/lib/video-analysis";

interface Props {
  lines: CalibrationLine[];
  laneBand: LaneBand;
  mirrored: boolean;
  calibrateMode: boolean;
  selectedDistanceM: number | null;
  showOverlay: boolean;
  onMoveLine: (distanceM: number, xNorm: number) => void;
  onMoveLaneBand: (band: LaneBand) => void;
  /** Fired when user clicks empty video area (not on a handle) */
  onBackgroundClick?: () => void;
}

export function VideoOverlay({
  lines,
  laneBand,
  mirrored,
  calibrateMode,
  selectedDistanceM,
  showOverlay,
  onMoveLine,
  onMoveLaneBand,
  onBackgroundClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<
    | { type: "line"; distanceM: number }
    | { type: "laneTop" }
    | { type: "laneBottom" }
    | null
  >(null);
  const movedRef = useRef(false);

  const clientToNorm = useCallback((clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (clientY - r.top) / r.height)),
    };
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || !calibrateMode) return;
    movedRef.current = true;
    const { x, y } = clientToNorm(e.clientX, e.clientY);
    if (drag.type === "line") {
      const xNorm = mirrored ? 1 - x : x;
      onMoveLine(drag.distanceM, xNorm);
    } else if (drag.type === "laneTop") {
      onMoveLaneBand({
        y0Norm: Math.min(y, laneBand.y1Norm - 0.04),
        y1Norm: laneBand.y1Norm,
      });
    } else if (drag.type === "laneBottom") {
      onMoveLaneBand({
        y0Norm: laneBand.y0Norm,
        y1Norm: Math.max(y, laneBand.y0Norm + 0.04),
      });
    }
  };

  if (!showOverlay && !onBackgroundClick) return null;

  return (
    <div
      ref={ref}
      className="absolute inset-0"
      // Container never steals events except via children / explicit click layer
      style={{ pointerEvents: "none" }}
      onPointerMove={onPointerMove}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
    >
      {/* Click-through play layer — always receives clicks except where handles sit above */}
      <button
        type="button"
        aria-label="Play or pause video"
        className="absolute inset-0 z-0 cursor-pointer bg-transparent"
        style={{ pointerEvents: "auto" }}
        onClick={() => {
          if (calibrateMode && movedRef.current) {
            movedRef.current = false;
            return;
          }
          onBackgroundClick?.();
        }}
      />

      {showOverlay && (
        <>
          {/* Lane band (visual only) */}
          <div
            className="pointer-events-none absolute left-0 right-0 z-[1] border-y-2 border-amber-400/70 bg-amber-400/10"
            style={{
              top: `${laneBand.y0Norm * 100}%`,
              height: `${(laneBand.y1Norm - laneBand.y0Norm) * 100}%`,
            }}
          />

          {calibrateMode && (
            <>
              <div
                className="absolute left-0 right-0 z-[2] h-4 -translate-y-1/2 cursor-ns-resize"
                style={{
                  top: `${laneBand.y0Norm * 100}%`,
                  pointerEvents: "auto",
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  movedRef.current = false;
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  setDrag({ type: "laneTop" });
                }}
              />
              <div
                className="absolute left-0 right-0 z-[2] h-4 -translate-y-1/2 cursor-ns-resize"
                style={{
                  top: `${laneBand.y1Norm * 100}%`,
                  pointerEvents: "auto",
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  movedRef.current = false;
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  setDrag({ type: "laneBottom" });
                }}
              />
            </>
          )}

          {lines.map((line) => {
            const x = mirrored ? 1 - line.xNorm : line.xNorm;
            const active = selectedDistanceM === line.distanceM;
            return (
              <div
                key={line.distanceM}
                className={cn(
                  "absolute top-0 bottom-0 z-[2] w-3 -translate-x-1/2",
                  calibrateMode ? "cursor-ew-resize" : "pointer-events-none"
                )}
                style={{
                  left: `${x * 100}%`,
                  pointerEvents: calibrateMode ? "auto" : "none",
                }}
                onPointerDown={(e) => {
                  if (!calibrateMode) return;
                  e.preventDefault();
                  e.stopPropagation();
                  movedRef.current = false;
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  setDrag({ type: "line", distanceM: line.distanceM });
                }}
              >
                <div
                  className={cn(
                    "absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2",
                    active ? "bg-violet-400" : "bg-cyan-300/80"
                  )}
                />
                <span
                  className={cn(
                    "absolute top-2 left-1/2 -translate-x-1/2 rounded px-1 py-0.5 text-[10px] font-bold",
                    active
                      ? "bg-violet-600 text-white"
                      : "bg-black/60 text-cyan-100"
                  )}
                >
                  {line.distanceM}m
                </span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
