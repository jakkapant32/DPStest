# BlueHub — Swimming Platform

แพลตฟอร์มว่ายน้ำครบวงจร: ปฏิทินการแข่งขัน, ผลการแข่งขัน, Data Analytics, ร้านค้า

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — UI theme สีน้ำเงิน-ม่วง
- **Recharts** — Dual Analytics charts
- **Drizzle ORM** + PostgreSQL
- **Deploy:** Render.com

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/calendar` | ปฏิทินการแข่งขัน |
| `/results` | ผลการแข่งขัน + filters |
| `/analytics` | Swimming Dual Analytics (CSV + Google Sheets) |
| `/analytics/video` | Video Analysis — tag distance splits (Mako-style) + AI Suggest |
| `/shop` | ร้านค้า |
| `/about` | เกี่ยวกับเรา |
| `/admin` | Admin Dashboard (ต้อง login) |
| `/admin/login` | Admin login |

## Admin Panel

- URL: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Default password (dev): `bluehub2026`
- จัดการ: การแข่งขัน, ผลการแข่งขัน, สินค้า
- ข้อมูลเก็บใน `data/store.json` (auto-seed จาก mock data ครั้งแรก)

Set env vars for production:
```
ADMIN_PASSWORD=your-secure-password
ADMIN_SECRET=random-secret-string
```

## Analytics CSV Format

```csv
athlete,gender,age_group,club,stroke,distance,split_50,split_100,split_150,split_200,total_time
```

Sample file: `public/sample-data.csv`

## Deploy to Render

1. Push to GitHub
2. Connect repo on [Render Dashboard](https://dashboard.render.com)
3. Use `render.yaml` for Blueprint deploy
4. Set `DATABASE_URL` from Render PostgreSQL

## Video Analysis

1. Open [/analytics/video](http://localhost:3000/analytics/video)
2. Upload a race clip + athlete metadata (LCM/SCM, distance, lane)
3. **Calibrate** — drag distance lines + lane band (amber) to match the pool; flip if start is on the right
4. Press **Start** at the gun / dive, then **Q** to tag each distance (or **W** for stroke)
5. **AI Suggest** — runs browser-side motion tracking first; falls back to Python worker if needed
6. **Finish Session** — see finish time, stroke count/rate summary · **Export CSV**

## Roadmap

- **Phase 1** ✅ Core platform (Calendar, Results, Analytics, Shop, About)
- **Phase 1.5** Admin panel + DB integration + Payment
- **Phase 2** ✅ Video Analysis (manual tagging + AI distance suggestions via Python worker)
- **Phase 2.5** Stroke count / stroke rate + multi-athlete auto track
