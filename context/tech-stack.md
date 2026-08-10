# Tech Stack

Diputuskan 2026-08-10.

| Layer      | Pilihan            | Alasan |
|------------|---------------------|--------|
| Frontend   | **Next.js** (React) | Routing bawaan, bisa full-stack, cocok untuk dashboard modern & mobile-first |
| Backend    | **Express.js**      | Simpel, banyak referensi, cukup untuk kebutuhan API CRUD project ini |
| Database   | **PostgreSQL**      | Data relasional: atlet ↔ time trial ↔ event ↔ achievement |
| ORM        | **Prisma**          | Type-safe, migration mudah, developer experience baik |

## Struktur Repo (final)

```
web app TE/
├── frontend/   Next.js (TypeScript, Tailwind, App Router)
└── backend/    Express.js + Prisma
    ├── src/
    │   ├── controllers/   (auth, athlete, event, timeTrial)
    │   ├── routes/
    │   ├── middleware/    (auth.js — JWT authenticate + role authorize)
    │   ├── lib/prisma.js
    │   ├── app.js
    │   └── server.js
    └── prisma/schema.prisma
```

- Auth: custom JWT (bcryptjs untuk hash password, jsonwebtoken untuk token, role-based lewat `authorize(...roles)` middleware)
- Chart library: belum diinstall — rencana Recharts saat mengerjakan Performance Tracking
- Styling: Tailwind CSS (sudah terpasang di frontend) — palette Ocean Blue #0066FF / Aqua #00C2FF di [features.md](features.md) perlu dikonfigurasi di `tailwind.config`

## Prisma Schema (awal)
Model: `User` (role: ATHLETE/COACH/ADMIN), `AthleteProfile`, `Event`, `EventEntry`, `TimeTrial`, `Achievement`, `AthleteAchievement`, `TrainingSession`.

## Cara jalankan (development)
```
# Backend
cd backend
# isi DATABASE_URL & JWT_SECRET di .env (lihat .env.example)
npm run prisma:migrate   # buat tabel di PostgreSQL
npm run dev              # http://localhost:4000

# Frontend
cd frontend
npm run dev               # http://localhost:3000
```

## Status Database (2026-08-10)
PostgreSQL 16 sudah terinstall lokal via winget dan berjalan sebagai service Windows.

⚠️ Port **5433**, bukan default 5432 — karena PostgreSQL 18 sudah ada duluan di komputer ini dan memakai port 5432.

- User: `postgres`, Password: `postgres` (default, cukup untuk dev lokal)
- Database: `swimclub` (sudah dibuat)
- `backend/.env` sudah terisi dan migration awal (`prisma migrate dev --name init`) sudah dijalankan — semua tabel sudah ada
- End-to-end sudah diverifikasi: `/health`, `/api/auth/register`, `/api/auth/login` bekerja normal dengan DB asli
