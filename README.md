# TIU Scholars — Tashkent International University Scientific Potential & Scholars Portal

TIU Scholars is a comprehensive academic platform designed for **Tashkent International University (TIU)**. It features a high-performance **Next.js Public Portal & Professor Cabinet** sharing the exact same database with a robust **Django Unfold Admin Panel** tailored for Ilmiy Bo'lim (Moderators), Department Heads, and Super Admins.

---

## Architecture & Technology Stack

- **Public Portal & Professor Cabinet:** Next.js (JavaScript ONLY, **0 TypeScript files**), Tailwind CSS, Lucide icons, Framer Motion.
- **Admin Panel (`admin-panel/`):** Django 4.2+, `django-unfold` (Academic Minimalistic White theme), `django-import-export` (Excel/CSV export), and custom RBAC roles.
- **Database Layer:** Prisma ORM connected to SQLite (`prisma/dev.db` locally) or PostgreSQL (`DATABASE_URL` for production).

---

## Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 2. Run Next.js Public Portal & Professor Cabinet
```bash
# Install Node dependencies
npm install

# Run database migrations / seed if needed
npx prisma db push
npx prisma db seed

# Start Next.js development server on http://localhost:3000
npm run dev
```

### 3. Run Django Admin Panel
```bash
cd admin-panel

# Create & activate virtual environment (Windows PowerShell / Git Bash)
python -m venv venv
# Windows:
./venv/Scripts/activate
# macOS/Linux:
# source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run migrations and seed staff roles & groups
python manage.py migrate
python manage.py seed_roles

# Start Django dev server on http://localhost:8000
python manage.py runserver 8000
```

---

## Production Deployment (PostgreSQL Migration)

To migrate from local SQLite to PostgreSQL in production:
1. Update `prisma/schema.prisma` datasource provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL="postgresql://user:password@host:port/dbname"` in your `.env` file.
3. Update `admin-panel/admin_panel/settings.py` DATABASES configuration using `dj-database-url`:
   ```python
   import dj_database_url
   DATABASES = {
       'default': dj_database_url.config(default=os.getenv('DATABASE_URL'))
   }
   ```
4. Run `npx prisma db push` and `python manage.py migrate`.

---

## Demo Accounts

| Role | Email | Password | Portal / URL |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@tiu.uz` | `Admin123!` | Django Admin (`http://localhost:8000/admin`) |
| **Ilmiy Bo'lim (Moderator)** | `moderator@tiu.uz` | `Moderator123!` | Django Admin (`http://localhost:8000/admin`) |
| **Kafedra Mas'uli** | `kafedra@tiu.uz` | `Kafedra123!` | Django Admin (`http://localhost:8000/admin`) |
| **Active Scholar** | `scholar@tiu.uz` | *(Prisma seed)* | Professor Cabinet (`http://localhost:3000/dashboard`) |
