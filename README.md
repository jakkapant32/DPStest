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
| `/shop` | ร้านค้า |
| `/about` | เกี่ยวกับเรา |

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

## Roadmap

- **Phase 1** ✅ Core platform (Calendar, Results, Analytics, Shop, About)
- **Phase 1.5** Admin panel + DB integration + Payment
- **Phase 2** Video upload + AI stroke analysis (Python worker)
