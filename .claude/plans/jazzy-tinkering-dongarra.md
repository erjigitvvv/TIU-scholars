# Sprint 4: Final Polish & Release Readiness

## Context
Completing Sprint 4 for **TIU Scholars** (`https://github.com/erjigitvvv/TIU-scholars.git`) as Senior Full-Stack Engineer & UI/UX Specialist. Delivering the real PDF CV generator (`src/lib/pdfCv.js`), PostgreSQL readiness checks, E2E test verification, `DEMO_GUIDE.md`, and expert UI/UX polish (motion, monogram avatars, empty states, semantic badges, and skeletons).

## Plan

### Part A: Mandatory Sprint 3 QA Fix (Real PDF CV)
1. Install `jspdf` and `jspdf-autotable`.
2. Implement `src/lib/pdfCv.js` generating a professional academic PDF document (`{FullName}_CV.pdf`).
3. Update `/scholars/[id]/page.jsx` to call `generatePdfCv(s)` on button click.

### Part B: PostgreSQL Production Readiness & DB Sync
1. Verify `prisma/schema.prisma` and `admin-panel/core/models.py` schema parity.
2. Confirm `admin-panel/requirements.txt` includes `psycopg2-binary` and `settings.py` supports `dj-database-url`.
3. Document PostgreSQL migration workflow in `README.md`.

### Part C: End-to-End (E2E) Live QA Verification
1. Run `scripts/e2e-verify.js` covering all 7 required test scenarios and verify pass outputs.

### Part D: Capstone Defense Demo Guide (`DEMO_GUIDE.md`)
1. Create/verify `DEMO_GUIDE.md` with quickstart instructions, credentials, and 5-minute live demo script.

### Part E: Expert UI/UX Designer Polish & Micro-Interactions
1. **Crisp Academic Motion:** Add Framer Motion easing (`[0.22, 1, 0.36, 1]`, duration 0.35s), count-up animations for KPI numbers (`tabular-nums`), and sliding active tab indicator (`layoutId="activeTabIndicator"`).
2. **Monogram Avatars (`src/components/ui/ScholarAvatar.jsx`):** Crisp `#0F294A` initials monogram (`AT`) when avatar missing.
3. **Empty States (`src/components/ui/EmptyState.jsx`):** Polished empty state with Lucide icons and `#F8FAFC` badge.
4. **Semantic Badges & Top-3 Ranks:** Distinct styling for Scopus, WoS, Q1/Q2, and Gold/Silver/Bronze ranks.
5. **Loading Skeletons:** Clean `animate-pulse` loaders on filtered directory pages.
