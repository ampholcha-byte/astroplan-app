@AGENTS.md

<!-- project-instructions v1 -->
# AstroPlan — Project Instructions

## 📋 Handover Rules (CRITICAL — ทำทุกครั้ง)

**จบงาน (ในวันเดียว)** → อัปเดต `docs/planning/handover.md`:
- **Current Status:** สรุปสิ่งที่ทำเสร็จ
- **Last Modified Files:** รายชื่อไฟล์ที่แก้ไข
- **Next Task:** งานถัดไปที่ควรทำ

**พักระหว่างวัน (Pause/Resume)** → อัปเดต handover.md เหมือนกัน + ระบุจุดที่หยุด

**จบงานแต่ละ Phase** → ทำแบบจบงานปกติ + **git commit** ด้วย:
```bash
rtk git add .
rtk git commit -m "feat: complete Phase X — <สรุปสั้นๆ>"
```

> ⚠️ ห้ามลืม handover.md ไม่ว่าจะหยุดแบบไหนก็ตาม

## 📂 Planning Documents (CRITICAL — READ FIRST)

**ก่อนเริ่มทำงานใดๆ ให้อ่าน `docs/planning/` ก่อนเสมอ:**

| ไฟล์ | วัตถุประสงค์ |
|---|---|
| `docs/planning/handover.md` | สถานะปัจจุบัน + ไฟล์ที่แก้ล่าสุด + task ถัดไป |
| `docs/planning/phase_1_mvp.md` | Phase 1 scope, milestones, acceptance criteria |
| `docs/planning/phase_2_future.md` | Phase 2 features (ห้าม implement จนกว่าจะเข้า Phase 2) |
| `docs/planning/ai_implementation_rules.md` | กฎการทำงานของ AI |
| `docs/planning/00_master_overview.md` | ภาพรวมโปรเจกต์, tech stack, data model, global rules |

**Session Handover Rule:** ก่อนหยุดทำงาน ให้อัปเดต `docs/planning/handover.md` เสมอ (สถานะปัจจุบัน, ไฟล์ที่แก้, task ถัดไป)

## 🗺️ Project Roadmap

### Phase 1: MVP — ✅ เสร็จแล้ว
- ค้นหาสถานที่ (Nominatim geocoding)
- ปฏิทินรายเดือน + นำทางเดือน
- สีพื้นหลังตามความมืด/สว่างของจันทร์
- Galactic Center rise/set times
- Cloud cover (mock data)
- Day details modal
- Mobile-first responsive UI

### Phase 2: Future — ⏳ ยังไม่เริ่ม
1. Real Cloud Cover Data (Weather API)
2. Notification System
3. Global Geographic Expansion
4. Golden Hour / Blue Hour
5. Light Pollution Overlay
6. Photo Planning Checklist

> ⚠️ **ห้าม implement Phase 2 จนกว่า Phase 1 จะ verified เรียบร้้อย**

## 🏗️ Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (mobile-first)
- **Astro Calc:** `suncalc` + custom Galactic Center formula
- **Geocoding:** OpenStreetMap Nominatim API
- **Cloud Cover:** Mock data (Phase 1), real API (Phase 2)

## 📁 Folder Structure
```
src/
├── app/
│   ├── page.tsx             # Main Calendar Page
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── LocationSearch.tsx
│   ├── CalendarGrid.tsx
│   ├── DayCell.tsx
│   ├── PathGraphic.tsx
│   ├── DayDetailsModal.tsx
│   ├── BestDaysSummary.tsx
│   └── SettingsPanel.tsx
├── data/
│   └── mockCalendarData.ts
├── lib/
│   ├── astro.ts
│   └── geocoding.ts
└── types/
    └── index.ts
```

## 🎨 UI Conventions
- **Dark sky (moon level 1-3):** พื้นหลังดำ/เทาเข้ม
- **Medium (moon level 4-7):** พื้นหลังม่วง/กำมะหยี่
- **Bright moon (moon level 8-10):** พื้นหลังเหลือง/ทอง
- **GC Rise:** จุดสีเขียว (emerald)
- **GC Set:** จุดสีแดง (rose)
- **Holiday:** สามเหลี่ยมแดงมุมบนซ้าย

## 📏 Global Rules
- Mobile-first responsive (mobile + desktop)
- Online only (no PWA/offline)
- Thailand เป็นขอบเขตเริ่มต้น
- Inline error messages (no toast)
- ห้ามเปลี่ยน tech stack โดยไม่ถาม
<!-- /project-instructions -->

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->
