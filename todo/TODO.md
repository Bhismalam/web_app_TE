# To-Do — SwimClub Management System

## Pre-Development
- [x] Tentukan stack/teknologi yang dipakai — Next.js + Express.js + PostgreSQL + Prisma (lihat context/tech-stack.md)
- [x] Tentukan struktur repo — `frontend/` + `backend/`, auth JWT custom
- [x] Setup struktur project awal — scaffold Next.js + Express + Prisma schema selesai
- [x] Setup PostgreSQL lokal & isi `backend/.env` (DATABASE_URL, JWT_SECRET), migration awal sudah dijalankan — end-to-end teruji (lihat context/tech-stack.md)
- [ ] Buat design system di Figma (Button, Card, Chart, Avatar, Badge)
- [x] Konfigurasi Tailwind theme dengan palette Ocean Blue/Aqua — `frontend/src/app/globals.css` (`--primary`/`--secondary`)
- [ ] Install chart library (Recharts) di frontend — perlu untuk Performance Tracking (grafik multi-kategori, bukan cuma last/best time)
- [ ] Buat design system di Figma (Button, Card, Chart, Avatar, Badge)
- [x] Buat `backend/prisma/seed.js` — data contoh (atlet Bhisma, coach, admin, event, time trial, training) via `npm run prisma:seed`

## Phase 1 — MVP (wajib)
- [x] Login (role: Atlet, Coach, Admin) — form UI + integrasi API + redirect ke dashboard, teruji end-to-end di browser (Playwright)
- [x] Dashboard Atlet (Home) — Next Competition, Your Performance (last/best time + progress %), Today's Training. Teruji end-to-end dengan data seed asli (Playwright + screenshot)
- [x] Athlete Profile (biodata, foto, statistik medali) — halaman `/profile`, statistik Gold/Silver/Bronze dari `EventEntry.result`, teruji end-to-end (Playwright + screenshot)
- [ ] Database atlet (Admin)
- [ ] Event / Competition (detail + daftar peserta) — backend endpoint sudah ada (`/api/events`), UI belum
- [ ] Time Trial (input coach + evaluasi bintang + rekomendasi) — backend endpoint sudah ada (`/api/time-trials`), UI belum
- [ ] Grafik progress performa (Performance Tracking) — dashboard baru tampilkan last/best time, belum ada line chart per bulan
- [ ] Training Reminder / Training Calendar — backend endpoint sudah ada (`/api/training`), baru dipakai untuk "today" di dashboard, UI kalender bulanan belum
- [ ] Coach Dashboard

## Phase 2 — Lanjutan
- [ ] Chat coach-atlet
- [ ] Absensi latihan
- [ ] Payment membership
- [ ] Push notification
- [ ] Ranking club

## Sedang dikerjakan

## Selesai
