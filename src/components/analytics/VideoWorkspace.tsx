"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Loader2,
  Play,
  Pause,
  Sparkles,
  Upload,
  CheckCircle2,
  Crosshair,
  FlipHorizontal2,
} from "lucide-react";
import { Button, Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  computeStrokeMetrics,
  defaultLaneBand,
  emptyStrokeMetrics,
  formatCumulativeDisplay,
  formatSplitDisplay,
  nextUntaggedIndex,
  segmentGroups,
  sessionToSwimRecord,
  summarizeSession,
  swimRecordToCsv,
  taggedCount,
  timingsFromRaceStart,
  type CalibrationLine,
  type LaneBand,
  type PoolType,
  type VideoSession,
} from "@/lib/video-analysis";
import { analyzeVideoInBrowser } from "@/lib/video-client-ai";
import {
  applyLocalTagAction,
  createLocalVideoSession,
  isLocalSession,
  listLocalSessionMeta,
  loadLocalSession,
  readResponseJsonSafe,
  saveLocalSessionMeta,
  shouldUseLocalUpload,
} from "@/lib/video-local-session";
import { VideoOverlay } from "@/components/analytics/VideoOverlay";
import type { Gender, Stroke } from "@/lib/types";

const SPEEDS = [0.25, 0.5, 1, 1.5, 2];

interface SessionListItem {
  id: string;
  athleteName: string;
  raceDistance: number;
  poolType: string;
  stroke: string;
  status: string;
  updatedAt: string;
  tagged: number;
  total: number;
  localOnly?: boolean;
}

export function VideoWorkspace() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [session, setSession] = useState<VideoSession | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(2);
  const [finished, setFinished] = useState(false);
  const [calibrateMode, setCalibrateMode] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [aiProgress, setAiProgress] = useState<number | null>(null);
  const [selectedCalibDist, setSelectedCalibDist] = useState<number | null>(
    null
  );

  const [athleteName, setAthleteName] = useState("");
  const [club, setClub] = useState("");
  const [lane, setLane] = useState(4);
  const [poolType, setPoolType] = useState<PoolType>("LCM");
  const [raceDistance, setRaceDistance] = useState(100);
  const [stroke, setStroke] = useState<Stroke>("freestyle");
  const [gender, setGender] = useState<Gender>("male");
  const [file, setFile] = useState<File | null>(null);

  const loadList = useCallback(async () => {
    const local = listLocalSessionMeta();
    try {
      const res = await fetch("/api/video/upload");
      if (res.ok) {
        const data = await res.json();
        const server = (data.sessions ?? []) as SessionListItem[];
        const merged = [...local, ...server].sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt)
        );
        setSessions(merged);
        return;
      }
    } catch {
      // offline / vercel without FS
    }
    setSessions(local);
  }, []);

  useEffect(() => {
    void loadList();
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [loadList]);

  const timings = useMemo(
    () =>
      session
        ? timingsFromRaceStart(session.markers, session.raceStartSec)
        : [],
    [session]
  );

  const timingById = useMemo(() => {
    const map = new Map<string, (typeof timings)[0]>();
    for (const t of timings) map.set(t.marker.id, t);
    return map;
  }, [timings]);

  const nextIdx = session ? nextUntaggedIndex(session.markers) : -1;
  const progress = session
    ? `${taggedCount(session.markers)}/${session.markers.length}`
    : "0/0";

  const groups = useMemo(
    () => (session ? segmentGroups(session.markers, session.poolType) : []),
    [session]
  );

  const summary = useMemo(
    () => (session ? summarizeSession(session) : null),
    [session]
  );

  const refreshSession = useCallback(async (id: string) => {
    if (id.startsWith("vid-local-")) {
      const local = loadLocalSession(id);
      if (!local) throw new Error("ไม่พบเซสชันในเบราว์เซอร์ (blob อาจหมดอายุ — อัปโหลดใหม่)");
      if (!local.videoUrl.startsWith("blob:")) {
        throw new Error("เซสชันนี้ต้องเลือกไฟล์วิดีโอใหม่ เพราะเก็บแค่ metadata");
      }
      setSession(local);
      return local;
    }
    const res = await fetch(`/api/video/sessions/${id}`);
    if (!res.ok) throw new Error("Failed to load session");
    const data = await res.json();
    setSession(data.session);
    return data.session as VideoSession;
  }, []);

  const patchSession = useCallback(
    async (body: Record<string, unknown>) => {
      if (!session) return;
      if (isLocalSession(session)) {
        const updated: VideoSession = {
          ...session,
          ...body,
          id: session.id,
          markers: (body.markers as VideoSession["markers"]) ?? session.markers,
          calibrationLines:
            (body.calibrationLines as VideoSession["calibrationLines"]) ??
            session.calibrationLines,
          laneBand:
            (body.laneBand as VideoSession["laneBand"]) ?? session.laneBand,
          strokeMetrics:
            (body.strokeMetrics as VideoSession["strokeMetrics"]) ??
            session.strokeMetrics,
          updatedAt: new Date().toISOString(),
          localOnly: true,
        };
        if (typeof body.mirrored === "boolean") updated.mirrored = body.mirrored;
        if (body.raceStartSec !== undefined) {
          updated.raceStartSec =
            body.raceStartSec === null ? null : Number(body.raceStartSec);
        }
        if (body.status) updated.status = body.status as VideoSession["status"];
        saveLocalSessionMeta(updated);
        setSession(updated);
        return updated;
      }
      const res = await fetch(`/api/video/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setSession(data.session);
      return data.session as VideoSession;
    },
    [session]
  );

  const persistTags = useCallback(
    async (body: Record<string, unknown>) => {
      if (!session) return;
      setBusy(true);
      setError(null);
      try {
        if (isLocalSession(session)) {
          const updated = applyLocalTagAction(session, body);
          setSession(updated);
          return;
        }
        const res = await fetch(`/api/video/sessions/${session.id}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Tag failed");
        setSession(data.session);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Tag failed");
      } finally {
        setBusy(false);
      }
    },
    [session]
  );

  const tagNext = useCallback(async () => {
    if (!session || !videoRef.current) return;
    if (session.raceStartSec === null) {
      setError("กด Start ก่อนแท็กระยะ");
      return;
    }
    await persistTags({
      action: "tagNext",
      videoTimeSec: videoRef.current.currentTime,
      source: "manual",
    });
  }, [session, persistTags]);

  const handleStart = useCallback(async () => {
    if (!session || !videoRef.current) return;
    await persistTags({
      action: "setRaceStart",
      raceStartSec: videoRef.current.currentTime,
    });
  }, [session, persistTags]);

  const addStroke = useCallback(async () => {
    if (!session || !videoRef.current) return;
    await persistTags({
      action: "addStroke",
      videoTimeSec: videoRef.current.currentTime,
    });
  }, [session, persistTags]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const nudge = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(
      0,
      Math.min(v.duration || 0, v.currentTime + delta)
    );
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeedIdx((i) => {
      const next = (i + 1) % SPEEDS.length;
      if (videoRef.current) videoRef.current.playbackRate = SPEEDS[next]!;
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!session) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        nudge(-1 / 30);
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        nudge(1 / 30);
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        cycleSpeed();
      } else if (e.key === "q" || e.key === "Q") {
        e.preventDefault();
        if (session.raceStartSec === null) void handleStart();
        else void tagNext();
      } else if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        void addStroke();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    session,
    togglePlay,
    nudge,
    cycleSpeed,
    handleStart,
    tagNext,
    addStroke,
  ]);

  const onUpload = async () => {
    if (!file) {
      setError("เลือกไฟล์วิดีโอก่อน");
      return;
    }
    setUploading(true);
    setError(null);
    setInfo(null);
    setFinished(false);

    const startLocal = (reason?: string) => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      const local = createLocalVideoSession({
        athleteName: athleteName || "Athlete",
        club,
        gender,
        lane,
        poolType,
        raceDistance,
        stroke,
        videoFileName: file.name || "race.mp4",
        videoUrl: url,
      });
      saveLocalSessionMeta(local);
      setSession(local);
      setFile(null);
      setCalibrateMode(false);
      setShowOverlay(true);
      setInfo(
        reason ||
          "ใช้โหมดวิเคราะห์ในเบราว์เซอร์ (ไม่อัปโหลดไฟล์ขึ้นเซิร์ฟเวอร์) — เหมาะกับ Vercel และไฟล์ใหญ่"
      );
      void loadList();
    };

    try {
      // Vercel / large files → skip server upload entirely
      if (shouldUseLocalUpload(file.size)) {
        startLocal(
          `ไฟล์ ${(file.size / (1024 * 1024)).toFixed(1)} MB — ใช้โหมดเบราว์เซอร์เพราะเกินขีดจำกัดอัปโหลดบน Vercel (~4.5MB)`
        );
        return;
      }

      const form = new FormData();
      form.set("video", file);
      form.set("athleteName", athleteName || "Athlete");
      form.set("club", club);
      form.set("lane", String(lane));
      form.set("poolType", poolType);
      form.set("raceDistance", String(raceDistance));
      form.set("stroke", stroke);
      form.set("gender", gender);
      const res = await fetch("/api/video/upload", { method: "POST", body: form });
      const parsed = await readResponseJsonSafe(res);
      if (!parsed.ok || parsed.data._nonJson) {
        startLocal(String(parsed.data.error || "อัปโหลดไม่สำเร็จ — สลับโหมดเบราว์เซอร์"));
        return;
      }
      if (!parsed.data.session) {
        throw new Error(String(parsed.data.error || "Upload failed"));
      }
      setSession(parsed.data.session as unknown as VideoSession);
      setFile(null);
      setCalibrateMode(false);
      setShowOverlay(true);
      await loadList();
    } catch (e) {
      // Last resort: still open locally so user can work
      try {
        startLocal(
          e instanceof Error
            ? `${e.message} — สลับโหมดเบราว์เซอร์แล้ว`
            : "อัปโหลดล้มเหลว — สลับโหมดเบราว์เซอร์แล้ว"
        );
      } catch {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const saveCalibration = async (
    lines: CalibrationLine[],
    band?: LaneBand,
    mirrored?: boolean
  ) => {
    if (!session) return;
    const body: Record<string, unknown> = { calibrationLines: lines };
    if (band) body.laneBand = band;
    if (typeof mirrored === "boolean") body.mirrored = mirrored;
    // optimistic local update for smooth dragging
    setSession({
      ...session,
      calibrationLines: lines,
      ...(band ? { laneBand: band } : {}),
      ...(typeof mirrored === "boolean" ? { mirrored } : {}),
    });
    try {
      await patchSession(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save calibration failed");
    }
  };

  const runAi = async () => {
    if (!session || !videoRef.current) return;
    setBusy(true);
    setError(null);
    setAiProgress(0);
    try {
      const v = videoRef.current;
      // Ensure we can decode frames
      if (v.readyState < 2) {
        await new Promise<void>((resolve) => {
          const done = () => {
            v.removeEventListener("loadeddata", done);
            resolve();
          };
          v.addEventListener("loadeddata", done);
          window.setTimeout(done, 2000);
        });
      }

      let workingSession = session;
      let result = await analyzeVideoInBrowser(v, workingSession, (pct) =>
        setAiProgress(pct)
      );

      // Auto-widen lane band and retry once if almost no motion
      if (result.suggestions.length === 0 || result.samples < 8) {
        const wideBand = { y0Norm: 0.28, y1Norm: 0.82 };
        workingSession = { ...session, laneBand: wideBand };
        setSession(workingSession);
        await patchSession({ laneBand: wideBand });
        setAiProgress(0);
        result = await analyzeVideoInBrowser(v, workingSession, (pct) =>
          setAiProgress(pct)
        );
      }

      if (result.suggestions.length === 0) {
        if (!isLocalSession(session)) {
          try {
            const res = await fetch(`/api/video/sessions/${session.id}/analyze`, {
              method: "POST",
            });
            const data = await res.json();
            if (res.ok) {
              setSession(data.session);
              for (let i = 0; i < 12; i++) {
                await new Promise((r) => setTimeout(r, 2000));
                const poll = await fetch(
                  `/api/video/sessions/${session.id}/analyze`
                );
                const pollData = await poll.json();
                setSession(pollData.session);
                if (
                  pollData.result ||
                  pollData.session?.aiJob?.status === "done"
                )
                  break;
                if (pollData.session?.aiJob?.status === "error") break;
              }
              await refreshSession(session.id);
            }
          } catch {
            // ignore python fallback errors on local/vercel
          }
        }
        setError(
          "ยังจับการเคลื่อนไหวได้น้อย — ปรับแถบส้มให้คลุมลู่นักกีฬา แล้วกด AI อีกครั้ง หรือแท็กมือด้วย Q"
        );
        return;
      }

      const applyBody = {
        action: "applyAi",
        suggestions: result.suggestions,
        strokePeaksSec: result.strokePeaksSec,
        onlyEmpty: true,
        engine: "browser",
        confidence: result.meanConfidence,
        message: `จับการเคลื่อนไหวได้ ${result.suggestions.length} จุด · conf ${(result.meanConfidence * 100).toFixed(0)}% · samples ${result.samples}`,
      };

      if (isLocalSession(session)) {
        const updated = applyLocalTagAction(workingSession, applyBody);
        setSession(updated);
      } else {
        const applyRes = await fetch(`/api/video/sessions/${session.id}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(applyBody),
        });
        const applyData = await applyRes.json();
        if (!applyRes.ok) throw new Error(applyData.error || "Apply AI failed");
        setSession(applyData.session);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI failed");
    } finally {
      setBusy(false);
      setAiProgress(null);
    }
  };

  const finishSession = async () => {
    if (!session) return;
    setBusy(true);
    try {
      const finishT =
        session.markers.find((m) => m.isFinish)?.videoTimeSec ?? null;
      const sm = computeStrokeMetrics(
        session.strokeMetrics?.strokeTimesSec ??
          session.strokeMetrics?.aiStrokeTimesSec ??
          [],
        session.raceStartSec,
        finishT
      );
      if (session.strokeMetrics?.aiStrokeTimesSec) {
        sm.aiStrokeTimesSec = session.strokeMetrics.aiStrokeTimesSec;
      }
      await patchSession({ status: "completed", strokeMetrics: sm });
      setFinished(true);
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Finish failed");
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    if (!session) return;
    if (isLocalSession(session)) {
      const timings = timingsFromRaceStart(
        session.markers,
        session.raceStartSec
      );
      const record = sessionToSwimRecord(
        session,
        session.raceStartSec,
        timings
      );
      if (!record) {
        setError("ต้องมี Start + Finish ก่อน Export CSV");
        return;
      }
      const csv = swimRecordToCsv(record);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${session.athleteName.replace(/\s+/g, "_")}-${session.raceDistance}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    window.open(
      `/api/video/sessions/${session.id}/export?format=csv`,
      "_blank"
    );
  };

  const laneBand = session?.laneBand ?? defaultLaneBand(session?.lane ?? 4);
  const strokeMetrics = session?.strokeMetrics ?? emptyStrokeMetrics();

  return (
    <div className="space-y-6">
      {!session && (
        <Card className="max-w-3xl">
          <h2 className="mb-1 text-lg font-bold text-dps-navy">
            สร้างเซสชัน Video Analysis
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            เลือกคลิป → calibrate เส้นระยะ → Start → แท็กหรือ AI Suggest
            <br />
            <span className="text-xs text-slate-400">
              บน Vercel ไฟล์ใหญ่จะวิเคราะห์ในเบราว์เซอร์โดยไม่อัปโหลดขึ้นเซิร์ฟเวอร์
            </span>
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">ชื่อนักกีฬา</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={athleteName}
                onChange={(e) => setAthleteName(e.target.value)}
                placeholder="David Popovici"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">สโมสร</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={club}
                onChange={(e) => setClub(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">ลู่</span>
              <input
                type="number"
                min={1}
                max={10}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={lane}
                onChange={(e) => setLane(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">สระ</span>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={poolType}
                onChange={(e) => setPoolType(e.target.value as PoolType)}
              >
                <option value="LCM">LCM (50m)</option>
                <option value="SCM">SCM (25m)</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">ระยะ</span>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={raceDistance}
                onChange={(e) => setRaceDistance(Number(e.target.value))}
              >
                {[50, 100, 200, 400].map((d) => (
                  <option key={d} value={d}>
                    {d}m
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">ท่า</span>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={stroke}
                onChange={(e) => setStroke(e.target.value as Stroke)}
              >
                <option value="freestyle">Freestyle</option>
                <option value="backstroke">Backstroke</option>
                <option value="breaststroke">Breaststroke</option>
                <option value="butterfly">Butterfly</option>
                <option value="medley">Medley</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">เพศ</span>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block text-slate-600">ไฟล์วิดีโอ</span>
              <input
                type="file"
                accept="video/*"
                className="w-full text-sm"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {info && <p className="mt-4 text-sm text-dps-navy">{info}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <Button
            className="mt-6"
            onClick={() => void onUpload()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            สร้างเซสชัน
          </Button>

          {sessions.length > 0 && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                เซสชันล่าสุด
              </h3>
              <ul className="space-y-2">
                {sessions.slice(0, 8).map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left text-sm hover:border-dps-cyan/40"
                      onClick={() => void refreshSession(s.id)}
                    >
                      <span className="font-medium text-slate-800">
                        {s.athleteName} · {s.poolType} {s.raceDistance}m
                      </span>
                      <span className="text-xs text-slate-500">
                        {s.tagged}/{s.total} · {s.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {session && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg">
              <video
                ref={videoRef}
                src={session.videoUrl}
                className="aspect-video w-full"
                playsInline
                preload="auto"
                onClick={togglePlay}
                onTimeUpdate={(e) =>
                  setCurrentTime((e.target as HTMLVideoElement).currentTime)
                }
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.playbackRate = SPEEDS[speedIdx]!;
                  }
                }}
              />
              <VideoOverlay
                lines={session.calibrationLines}
                laneBand={laneBand}
                mirrored={Boolean(session.mirrored)}
                calibrateMode={calibrateMode}
                selectedDistanceM={selectedCalibDist}
                showOverlay={showOverlay}
                onBackgroundClick={togglePlay}
                onMoveLine={(distanceM, xNorm) => {
                  const lines = session.calibrationLines.map((l) =>
                    l.distanceM === distanceM ? { ...l, xNorm } : l
                  );
                  void saveCalibration(lines);
                }}
                onMoveLaneBand={(band) => {
                  void saveCalibration(session.calibrationLines, band);
                }}
              />
              <div className="flex flex-wrap items-center gap-2 bg-slate-900 px-4 py-3 text-white">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
                  aria-label="Play/Pause"
                >
                  {playing ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-xs hover:bg-white/10"
                  onClick={() => nudge(-1 / 30)}
                >
                  A −1f
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-xs hover:bg-white/10"
                  onClick={() => nudge(1 / 30)}
                >
                  D +1f
                </button>
                <button
                  type="button"
                  className="rounded bg-dps-cyan/20 px-2 py-1 text-xs font-semibold text-dps-cyan"
                  onClick={cycleSpeed}
                >
                  {SPEEDS[speedIdx]}x (S)
                </button>
                <span className="ml-auto font-mono text-sm tabular-nums">
                  {currentTime.toFixed(2)}s
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              คลิกที่วิดีโอเพื่อเล่น/หยุด · Space · A/D · S · Q แท็กระยะ · W
              stroke · ปุ่ม AI Suggest จะสแกนทั้งคลิปหาการเคลื่อนไหวอัตโนมัติ
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={calibrateMode ? "primary" : "outline"}
                size="sm"
                onClick={() => {
                  setCalibrateMode((v) => !v);
                  setShowOverlay(true);
                }}
              >
                <Crosshair className="mr-2 h-4 w-4" />
                {calibrateMode ? "กำลัง Calibrate" : "Calibrate"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  void saveCalibration(
                    session.calibrationLines,
                    laneBand,
                    !session.mirrored
                  )
                }
              >
                <FlipHorizontal2 className="mr-2 h-4 w-4" />
                {session.mirrored ? "Start ขวา" : "Start ซ้าย"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOverlay((v) => !v)}
              >
                {showOverlay ? "ซ่อนเส้น" : "แสดงเส้น"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void runAi()}
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                AI ตรวจจับการเคลื่อนไหว
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCsv}
                disabled={session.raceStartSec === null}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                size="sm"
                onClick={() => void finishSession()}
                disabled={busy}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Finish Session
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSession(null);
                  setFinished(false);
                  setError(null);
                  setCalibrateMode(false);
                }}
              >
                เซสชันใหม่
              </Button>
            </div>

            {calibrateMode && (
              <Card className="bg-amber-50/80 text-sm">
                <p className="font-semibold text-amber-900">โหมด Calibrate</p>
                <p className="mt-1 text-amber-800/80">
                  ลากเส้นระยะแนวตั้งให้ตรงจุดบนสระ และลากขอบแถบส้มให้คลุมลู่ที่เลือก
                  แล้วเลือกจุดด้านล่างเพื่อไฮไลท์
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {session.calibrationLines.map((l) => (
                    <button
                      key={l.distanceM}
                      type="button"
                      className={cn(
                        "rounded-lg border px-2 py-1 text-xs font-semibold",
                        selectedCalibDist === l.distanceM
                          ? "border-violet-500 bg-violet-600 text-white"
                          : "border-amber-200 bg-white text-amber-900"
                      )}
                      onClick={() => setSelectedCalibDist(l.distanceM)}
                    >
                      {l.distanceM}m
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {aiProgress !== null && (
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Browser AI กำลังวิเคราะห์…</span>
                  <span>{aiProgress.toFixed(0)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-violet-500 transition-all"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>
              </div>
            )}

            {session.aiJob?.message && (
              <p className="text-xs text-slate-500">
                AI: {session.aiJob.status}
                {session.aiJob.engine ? ` (${session.aiJob.engine})` : ""}
                {typeof session.aiJob.confidence === "number"
                  ? ` · conf ${(session.aiJob.confidence * 100).toFixed(0)}%`
                  : ""}{" "}
                — {session.aiJob.message}
              </p>
            )}
            {info && <p className="text-sm text-dps-navy">{info}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            {(finished || session.status === "completed") && summary && (
              <Card className="border-dps-cyan/30 bg-dps-cyan/5">
                <h3 className="font-bold text-dps-navy">สรุปเซสชัน</h3>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-500">Finish</p>
                    <p className="font-mono font-semibold text-dps-navy">
                      {summary.finishTime?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tags</p>
                    <p className="font-mono font-semibold text-dps-navy">
                      {summary.tagged}/{summary.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Stroke count</p>
                    <p className="font-mono font-semibold text-dps-navy">
                      {summary.strokeCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Stroke rate</p>
                    <p className="font-mono font-semibold text-dps-navy">
                      {summary.strokeRateSpm
                        ? `${summary.strokeRateSpm.toFixed(1)} spm`
                        : "—"}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <Card className="h-fit bg-slate-50/80">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-dps-navy">
                {session.athleteName}
              </h2>
              <p className="text-sm text-slate-500">
                {session.poolType} {session.raceDistance}m {session.stroke} ·
                Lane {session.lane}
              </p>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span className="font-mono">{progress}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-dps-cyan transition-all"
                    style={{
                      width: `${
                        (taggedCount(session.markers) /
                          Math.max(1, session.markers.length)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {session.raceStartSec === null ? (
              <button
                type="button"
                onClick={() => void handleStart()}
                className="mb-6 w-full rounded-xl bg-violet-600 px-4 py-4 text-center font-semibold text-white shadow hover:bg-violet-700"
              >
                Start
                <span className="mt-1 block text-xs font-normal opacity-80">
                  TAP TO BEGIN · Q
                </span>
              </button>
            ) : (
              <p className="mb-4 rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
                Race start @ {session.raceStartSec.toFixed(2)}s
              </p>
            )}

            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-wider text-slate-500">
                  STROKE COUNT / RATE
                </h3>
                <button
                  type="button"
                  className="text-[10px] text-slate-400 hover:text-red-500"
                  onClick={() => void persistTags({ action: "clearStrokes" })}
                >
                  clear
                </button>
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <div>
                  <p className="font-mono text-2xl font-bold text-dps-navy">
                    {strokeMetrics.strokeCount}
                  </p>
                  <p className="text-xs text-slate-500">strokes</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-semibold text-violet-600">
                    {strokeMetrics.strokeRateSpm
                      ? strokeMetrics.strokeRateSpm.toFixed(1)
                      : "—"}
                  </p>
                  <p className="text-xs text-slate-500">spm</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void addStroke()}
                className="mt-3 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Tag stroke · W
              </button>
              {strokeMetrics.aiStrokeTimesSec &&
                strokeMetrics.aiStrokeTimesSec.length > 0 && (
                  <p className="mt-2 text-[10px] text-dps-cyan">
                    AI peaks: {strokeMetrics.aiStrokeTimesSec.length}
                  </p>
                )}
            </div>

            {groups.map((group) => {
              const active =
                nextIdx >= 0 &&
                group.markers.some(
                  (m) => m.id === session.markers[nextIdx]?.id
                );
              return (
                <div key={group.title} className="mb-5">
                  <h3
                    className={cn(
                      "mb-2 text-xs font-bold tracking-wider",
                      active ? "text-violet-600" : "text-slate-500"
                    )}
                  >
                    {group.title}
                    {active ? " — ACTIVE" : ""}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {group.markers.map((m) => {
                      const t = timingById.get(m.id);
                      const isNext =
                        nextIdx >= 0 && session.markers[nextIdx]?.id === m.id;
                      const done = m.videoTimeSec !== null;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          disabled={session.raceStartSec === null}
                          onClick={() => {
                            if (!videoRef.current) return;
                            if (done) {
                              void persistTags({
                                action: "clear",
                                markerId: m.id,
                              });
                            } else if (isNext) {
                              void tagNext();
                            } else {
                              void persistTags({
                                action: "tag",
                                markerId: m.id,
                                videoTimeSec: videoRef.current.currentTime,
                                source: "manual",
                              });
                            }
                          }}
                          className={cn(
                            "rounded-xl border px-2 py-2 text-left transition",
                            isNext &&
                              "border-violet-500 bg-violet-600 text-white shadow-md",
                            done &&
                              !isNext &&
                              "border-slate-200 bg-white text-slate-800",
                            !done &&
                              !isNext &&
                              "border-dashed border-slate-300 bg-white/60 text-slate-500"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-bold">{m.label}</span>
                            {isNext && (
                              <span className="text-[10px] uppercase tracking-wide opacity-90">
                                Next
                              </span>
                            )}
                            {done && m.source === "ai" && (
                              <span className="text-[10px] text-dps-cyan">
                                AI
                              </span>
                            )}
                          </div>
                          {done && t && (
                            <>
                              <p
                                className={cn(
                                  "mt-1 font-mono text-xs",
                                  isNext ? "text-violet-100" : "text-slate-600"
                                )}
                              >
                                {formatSplitDisplay(t.splitSec)}
                              </p>
                              <p
                                className={cn(
                                  "font-mono text-xs",
                                  isNext ? "text-violet-200" : "text-slate-400"
                                )}
                              >
                                {formatCumulativeDisplay(t.cumulativeSec)}
                              </p>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
