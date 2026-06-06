# ✦ AstroPlan — Milky Way Photography Planner

> วางแผนถ่ายภาพทางดาราศาสตร์ให้สมบูรณ์แบบ ด้วยข้อมูลดวงจัน ตำแหน่ง Galactic Center สภาพอากาศ และมลพิษทางแสง — ทั้งหมดในหน้าเดียว

## ✨ ฟีเจอร์

| ฟีเจอร์ | รายละเอียด |
|---|---|
| 🌙 **ดวงจัน** | คำนวณระดับความสว่างจันทร์จริง (SunCalc) — สีพื้นหลังปฏิทินเปลี่ยนตามความมืด/สว่าง |
| 🌌 **Galactic Center** | คำนวณเวลา rise/set ของศูนย์กาลักศก์ทางช้างเผือก |
| 🌤 **สภาพอากาศ** | เชื่อม OpenWeatherMap API สำหรับ cloud cover จริง (ถ้ามี API key) |
| 🌅 **Golden / Blue Hour** | แสดงเวลา golden hour, blue hour, sunrise, sunset, moonrise, moonset |
| 🌃 **Light Pollution** | แสดง Bortle scale + sky brightness (mpsas) สำหรับตำแหน่งที่เลือก |
| 📋 **Checklist** | สร้าง shooting plan checklist สำหรับแต่ละวัน (เก็บใน localStorage) |
| 🔔 **แจ้งเตือน** | Browser notification เมื่อพรุ่งนี้เป็นวันที่ดีสำหรับถ่ายภาพ |
| 📱 **Responsive** | ใช้งานได้ทั้งมือถือและเดสก์ท็อป |

## 🚀 เริ่มต้นใช้งาน

### ติดตั้ง

```bash
git clone https://github.com/ampholcha-byte/astroplan-app.git
cd astroplan-app
npm install
```

### รัน dev server

```bash
npm run dev
```

เปิด http://localhost:3000

### Build production

```bash
npm run build
npm start
```

## ⚙️ ตั้งค่า (ไม่บังคับ)

แอปใช้งานได้เลยโดยไม่ต้องตั้งค่าอะไร แต่ถ้าต้องการข้อมูลสภาพอากาศจริง:

1. สมัคร API key ฟรีที่ [openweathermap.org/api](https://openweathermap.org/api)
2. เปิดแอป → กด ⚙️ Settings → ใส่ API key ช่อง "Weather API Key"

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Astro Calc:** [SunCalc](https://github.com/mourner/suncalc) + custom Galactic Center formula
- **Geocoding:** OpenStreetMap Nominatim API (ฟรี ไม่ต้อง API key)
- **Weather:** OpenWeatherMap API (ฟรี ถ้ามี key, ไม่มีก็ใช้ mock data)

## 📂 โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── page.tsx          # หน้าหลัก — ปฏิทิน + navigation
│   ├── layout.tsx        # Root layout + metadata
│   ├── actions.ts        # Server actions (weather, light pollution)
│   └── globals.css       # Global styles
├── components/
│   ├── CalendarGrid.tsx      # ตารางปฏิทิน 7 คอลัมน์
│   ├── DayCell.tsx           # ช่องวัน (สีตามดวงจัน, GC times, cloud %)
│   ├── DayDetailsModal.tsx   # รายละเอียดวัน (score, sun/moon times, light pollution, advice)
│   ├── LocationSearch.tsx    # ค้นหาสถานที่ + GPS
│   ├── BestDaysSummary.tsx   # วันที่ดีที่สุด 5 วันของเดือน
│   ├── SettingsPanel.tsx     # ตั้งค่า (location, timezone, weather API key)
│   ├── ChecklistPanel.tsx    # Shooting checklist
│   ├── NotificationBanner.tsx # แจ้งเตือนวันที่ดี
│   └── PathGraphic.tsx       # SVG เส้นทาง E-S-W
├── lib/
│   ├── astro.ts              # คำนวณดาราศาสตร์ (moon, GC, sun/moon times)
│   ├── geocoding.ts          # Nominatim geocoding
│   ├── weather.ts            # OpenWeatherMap API + mock
│   ├── lightpollution.ts     # Light pollution data + Bortle scale
│   ├── checklist.ts          # Checklist CRUD (localStorage)
│   └── notifications.ts      # Browser notification system
├── types/
│   └── index.ts              # TypeScript interfaces
└── data/
    └── mockCalendarData.ts   # Mock data (fallback)
```

## 📝 License

MIT
