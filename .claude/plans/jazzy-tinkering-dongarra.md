# Sprint 4: Final E2E QA, PostgreSQL Readiness, Git Sync & Defense Preparation

## Context
Executing Sprint 4 for **TIU Scholars** (`https://github.com/erjigitvvv/TIU-scholars.git`) as Senior Full-Stack Engineer & QA Lead. Ensuring zero lint errors, PostgreSQL schema synchronization, E2E verification test script, and capstone defense demo guide (`DEMO_GUIDE.md`).

## Plan

### Part A: Sprint 3 QA Fixes & Git Verification
1. Run `npm run lint` and resolve any warnings/errors (0 errors, 0 warnings).
2. Check `git status` and `git log -n 5 --oneline`. Ensure clean working tree.
3. Verify 0 `.ts`/`.tsx` files across the repository.

### Part B: PostgreSQL Production Readiness & DB Sync Check
1. Verify `prisma/schema.prisma` and `admin-panel/core/models.py` schema parity.
2. Ensure `admin-panel/requirements.txt` includes `psycopg2-binary` and `settings.py` supports `dj-database-url`.
3. Document 5-step SQLite → PostgreSQL migration workflow and 4-step DB schema change workflow in `README.md`.

### Part C: End-to-End (E2E) Live Verification Script
1. Write and execute an automated verification test script (`scripts/e2e-verify.js`) covering all 7 scenarios:
   - Guest visibility guard (ACTIVE scholars & APPROVED publications only).
   - Auth & onboarding guard (PENDING user restricted from `/dashboard`).
   - Deduplication & co-author linking (DOI collision handling).
   - Integrity lock (APPROVED publication forbidden from update/delete by scholar).
   - Django moderation & metrics recalculation (Approve publication updates metrics & creates audit log).
   - AuditLog tamper protection (add/change/delete disabled).
   - PDF CV export & Django import-export.

### Part D: Capstone Defense Demo Guide (`DEMO_GUIDE.md`)
1. Create `DEMO_GUIDE.md` with:
   - 30-second quickstart commands for Next.js (`:3000`) and Django Admin (`:8000`).
   - Verified demo credentials for Super Admin, Moderator, Kafedra, Active Scholar, and Pending Scholar.
   - 5-minute live defense demo script.
