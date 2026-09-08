"""BlueHub video analysis worker — suggest distance-crossing timestamps."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

import cv2
import numpy as np


def repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def jobs_dir(override: str | None) -> Path:
    if override:
        return Path(override)
    return repo_root() / "data" / "video-jobs"


def load_job(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def find_job(session_id: str | None, latest: bool, directory: Path) -> Path:
    if session_id:
        p = directory / f"{session_id}.job.json"
        if not p.exists():
            raise FileNotFoundError(f"Job not found: {p}")
        return p
    if latest:
        jobs = sorted(directory.glob("*.job.json"), key=lambda p: p.stat().st_mtime)
        if not jobs:
            raise FileNotFoundError(f"No jobs in {directory}")
        return jobs[-1]
    raise ValueError("Pass --session or --latest")


def lane_band(frame_h: int, lane: int, total_lanes: int = 8, lane_band_cfg: dict | None = None) -> tuple[int, int]:
    if lane_band_cfg and "y0Norm" in lane_band_cfg and "y1Norm" in lane_band_cfg:
        y0 = int(float(lane_band_cfg["y0Norm"]) * frame_h)
        y1 = int(float(lane_band_cfg["y1Norm"]) * frame_h)
        return max(0, y0), min(frame_h - 1, max(y0 + 2, y1))

    lane = max(1, min(total_lanes, lane))
    top = int(frame_h * 0.25)
    usable = frame_h - top
    band = usable / total_lanes
    y0 = int(top + (lane - 1) * band)
    y1 = int(top + lane * band)
    return y0, min(frame_h - 1, y1)


def estimate_x_norm(
    roi: np.ndarray, prev_gray: np.ndarray | None
) -> tuple[float | None, np.ndarray]:
    if roi.size == 0:
        return None, prev_gray if prev_gray is not None else np.zeros((1, 1), np.uint8)

    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    if prev_gray is None or prev_gray.shape != gray.shape:
        return None, gray

    diff = cv2.absdiff(gray, prev_gray)
    _, thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))

    ys, xs = np.where(thresh > 0)
    if len(xs) < 40:
        return None, gray

    cx = float(np.mean(xs))
    x_norm = cx / max(1, gray.shape[1] - 1)
    return x_norm, gray


def try_mediapipe_x(frame: np.ndarray, y0: int, y1: int) -> float | None:
    try:
        import mediapipe as mp  # type: ignore
    except ImportError:
        return None

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    with mp.solutions.pose.Pose(
        static_image_mode=False,
        model_complexity=0,
        enable_segmentation=False,
        min_detection_confidence=0.4,
        min_tracking_confidence=0.4,
    ) as pose:
        result = pose.process(rgb)
        if not result.pose_landmarks:
            return None
        lm = result.pose_landmarks.landmark
        pts = [lm[0], lm[11], lm[12]]
        xs = []
        h, w = frame.shape[:2]
        for p in pts:
            py = p.y * h
            if y0 <= py <= y1 and p.visibility > 0.4:
                xs.append(p.x)
        if not xs:
            return None
        return float(sum(xs) / len(xs))


def analyze(job: dict[str, Any]) -> dict[str, Any]:
    video_path = Path(job["videoPath"])
    if not video_path.exists():
        return {"suggestions": [], "error": f"Video not found: {video_path}"}

    cal = sorted(job.get("calibrationLines") or [], key=lambda c: c["distanceM"])
    markers = job.get("markers") or []
    lane = int(job.get("lane") or 4)
    race_start = job.get("raceStartSec")
    pool_type = job.get("poolType") or "LCM"
    length = 50 if pool_type == "LCM" else 25
    race_distance = int(job.get("raceDistance") or 100)
    max_lengths = max(1, int(np.ceil(race_distance / length)))
    mirrored = bool(job.get("mirrored"))
    lane_band_cfg = job.get("laneBand")

    if not cal:
        first = [m["distanceM"] for m in markers if m["distanceM"] <= length]
        cal = [{"distanceM": d, "xNorm": d / length} for d in first]

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return {"suggestions": [], "error": f"Cannot open video: {video_path}"}

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_idx = 0
    prev_gray = None
    lengths_done = 0
    crossed: dict[int, float] = {}
    last_x: float | None = None
    direction = 1
    sample_every = max(1, int(fps // 10))

    pending: list[tuple[int, float, int]] = []
    seen: set[int] = set()
    for li in range(max_lengths):
        base = li * length
        for c in cal:
            local_d = int(c["distanceM"])
            if local_d > length:
                continue
            d = base + local_d if li > 0 else local_d
            # For length index > 0, cal distances are within first length; remap
            if li > 0:
                d = base + local_d
            if d > race_distance or d in seen:
                continue
            seen.add(d)
            pending.append((d, float(c["xNorm"]), li))

    pending.sort(key=lambda t: t[0])

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        t_sec = frame_idx / fps
        frame_idx += 1

        if race_start is not None and t_sec < float(race_start):
            continue
        if frame_idx % sample_every != 0:
            continue

        h, _w = frame.shape[:2]
        y0, y1 = lane_band(h, lane, lane_band_cfg=lane_band_cfg)
        roi = frame[y0:y1, :]

        x_mp = try_mediapipe_x(frame, y0, y1)
        if x_mp is not None:
            x_norm = x_mp
            prev_gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        else:
            x_norm, prev_gray = estimate_x_norm(roi, prev_gray)

        if x_norm is None:
            continue

        if mirrored:
            x_norm = 1.0 - x_norm

        if last_x is not None:
            if direction == 1 and last_x > 0.85 and x_norm < last_x - 0.05:
                direction = -1
                lengths_done = min(max_lengths - 1, lengths_done + 1)
            elif direction == -1 and last_x < 0.15 and x_norm > last_x + 0.05:
                direction = 1
                lengths_done = min(max_lengths - 1, lengths_done + 1)

        x_along = x_norm if lengths_done % 2 == 0 else 1.0 - x_norm

        for dist_m, x_target, li in pending:
            if dist_m in crossed:
                continue
            if li > lengths_done:
                continue
            near = abs(x_along - x_target) < 0.045
            crossed_line = last_x is not None and (
                (last_x - x_target) * (x_along - x_target) <= 0
                and abs(x_along - x_target) < 0.08
            )
            if near or crossed_line:
                crossed[dist_m] = round(float(t_sec), 3)

        last_x = x_norm
        if len(crossed) >= len(pending):
            break

    cap.release()

    suggestions = [
        {"distanceM": d, "videoTimeSec": t}
        for d, t in sorted(crossed.items(), key=lambda kv: kv[0])
    ]

    if not suggestions:
        return {
            "suggestions": [],
            "error": "No crossings detected — try manual tagging or adjust lane/calibration",
        }

    return {"suggestions": suggestions, "meta": {"fps": fps, "frames": frame_idx}}


def write_result(job: dict[str, Any], result: dict[str, Any], directory: Path) -> Path:
    out = Path(job.get("outputPath") or "")
    if not str(out):
        sid = job.get("sessionId", "unknown")
        out = directory / f"{sid}.result.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="BlueHub video distance tagger")
    parser.add_argument("--session", help="Session id")
    parser.add_argument("--latest", action="store_true", help="Process newest job")
    parser.add_argument("--jobs-dir", dest="jobs_dir_arg", default=None)
    args = parser.parse_args(argv)

    directory = jobs_dir(args.jobs_dir_arg)
    try:
        job_path = find_job(args.session, args.latest, directory)
    except (FileNotFoundError, ValueError) as e:
        print(str(e), file=sys.stderr)
        return 1

    job = load_job(job_path)
    print(f"Processing job {job_path.name} …")
    result = analyze(job)
    out = write_result(job, result, directory)
    print(f"Wrote {out}")
    if result.get("error"):
        print(f"Warning: {result['error']}", file=sys.stderr)
        return 2
    print(f"Suggestions: {len(result.get('suggestions', []))}")
    return 0
