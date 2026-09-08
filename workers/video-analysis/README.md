# BlueHub Video Analysis Worker

Python worker that suggests timestamps when the tracked athlete crosses calibrated distance lines.

## Setup

```bash
cd workers/video-analysis
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run against a queued job

After clicking **AI Suggest** in the UI (writes `data/video-jobs/{sessionId}.job.json`):

```bash
python -m worker --session <sessionId>
```

Or process the newest job:

```bash
python -m worker --latest
```

## How it works (MVP)

1. Coach calibrates distance lines + lane band in the browser UI.
2. **Browser AI** (default): samples frames via canvas, tracks motion in the lane band, stamps crossings. Also estimates stroke peaks.
3. **Python worker** (fallback): reads job JSON when browser AI finds nothing / OpenCV installed.

```bash
cd workers/video-analysis
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m worker --latest
```

## Job fields

- `calibrationLines`, `laneBand`, `mirrored`, `lane`, `raceStartSec`, `markers`
