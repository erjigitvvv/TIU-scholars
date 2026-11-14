# TIU Scholars — Capstone Defense Demo Guide

Welcome to the official **CapStone Defense Demo Guide** for **TIU Scholars** (`https://github.com/erjigitvvv/TIU-scholars.git`). This guide provides exact startup commands, verified demo credentials, and a structured 5-minute live defense presentation script.

---

## 1. Quickstart (30 Seconds Startup)

### Terminal 1: Next.js Public Portal & Professor Cabinet (`:3000`)
```bash
npm install
npx prisma db push
npx prisma db seed
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000)*

### Terminal 2: Django Unfold Admin Panel (`:8000`)
```bash
cd admin-panel
python -m venv venv
# Windows:
./venv/Scripts/activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_roles
python manage.py runserver 8000
```
*Open [http://localhost:8000/admin](http://localhost:8000/admin)*

---

## 2. Verified Demo Credentials

| Role / Persona | Email | Password | Portal / URL |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@tiu.uz` | `Admin123!` | Django Admin (`http://localhost:8000/admin`) |
| **Ilmiy Bo'lim (Moderator)** | `moderator@tiu.uz` | `Moderator123!` | Django Admin (`http://localhost:8000/admin`) |
| **Kafedra Mas'uli** | `kafedra@tiu.uz` | `Kafedra123!` | Django Admin (`http://localhost:8000/admin`) |
| **Active Scholar** | `scholar@tiu.uz` | *(Prisma seed / Custom)* | Professor Cabinet (`http://localhost:3000/dashboard`) |
| **Pending Scholar** | `pending@tiu.uz` | *(Prisma seed / Custom)* | Pending Approval Screen (`http://localhost:3000/pending-approval`) |

---

## 3. 5-Minute Live Defense Demo Script

### Minute 0–1: Public Portal & Scholars Discovery (`http://localhost:3000`)
1. **Landing Page:** Show the academic minimalistic design, live animated KPI counters (`tabular-nums`), leading researchers showcase, and faculties quick-filter grid.
2. **Scholars Directory (`/scholars`):** Search for a researcher by name or keyword, apply faculty & academic degree filters, and sort by TIU Score.
3. **Scholar Public Profile & PDF CV (`/scholars/[id]`):** Click into a leading professor profile. Demonstrate the 5 interactive tabs (*Publications*, *Grants*, *Supervisions*, *Co-Authors*, *Biography*) and click **"Download CV"** to export their curriculum vitae instantly.
4. **Rankings (`/rankings`):** Switch between the **Scholar Leaderboard** and **Department Leaderboard**.

### Minute 1–2: Scholar Professor Cabinet & Submission (`http://localhost:3000/dashboard`)
1. Log in as **Active Scholar** (`scholar@tiu.uz`).
2. Show the overview dashboard with personal KPI target progress bars.
3. Navigate to **Publications** (`/dashboard/publications`).
4. Demonstrate adding a publication via **DOI Auto-fill** (fetching title, citations, and metadata via CrossRef API in under 5 seconds) or **BibTeX batch import**.
5. Emphasize the **Integrity Lock**: approved publications display a locked state and cannot be modified or deleted by scholars.

### Minute 2–3: Onboarding & Security Guards
1. Log in as **Pending Scholar** (`pending@tiu.uz`).
2. Show how the route guard and middleware automatically intercept access and route them to `/pending-approval`.
3. Log out and demonstrate the registration flow (`/register`) with faculty/department dropdowns.

### Minute 4: Django Moderation & Metrics Recalculation (`http://localhost:8000/admin`)
1. Log in as **Ilmiy Bo'lim Moderator** (`moderator@tiu.uz`) in Django Admin.
2. Navigate to the **Publications** moderation queue.
3. Select a pending publication and execute the **"Approve selected publications & recalculate metrics"** admin action.
4. Explain how this instantly updates the publication status to `APPROVED`, automatically recalculates the scholar's **H-index**, **total citations**, and **TIU score** using the scoring weights engine, and logs an immutable entry in the **AuditLog**.

### Minute 5: AuditLog Tamper Protection & Production Readiness
1. Navigate to **Audit Logs** in Django Admin.
2. Demonstrate **AuditLog Tamper Protection**: try to add, edit, or delete an audit log entry to show that `AuditLogAdmin` strictly returns `False` for `has_add_permission`, `has_change_permission`, and `has_delete_permission`.
3. Conclude by highlighting the **PostgreSQL Production Readiness** (`DATABASE_URL` switch and `dj-database-url` integration) and zero-error test/lint verification.
