# To-Do — SwimClub Management System

## Pre-Development
- [x] Tentukan stack/teknologi yang dipakai — Next.js + Express.js + PostgreSQL + Prisma (lihat context/tech-stack.md)
- [x] Tentukan struktur repo — `frontend/` + `backend/`, auth JWT custom
- [x] Setup struktur project awal — scaffold Next.js + Express + Prisma schema selesai
- [x] Setup PostgreSQL lokal & isi `backend/.env` (DATABASE_URL, JWT_SECRET), migration awal sudah dijalankan — end-to-end teruji (lihat context/tech-stack.md)
- [ ] Buat design system di Figma (Button, Card, Chart, Avatar, Badge)
- [ ] Konfigurasi Tailwind theme dengan palette Ocean Blue/Aqua
- [ ] Install chart library (Recharts) di frontend

## Phase 1 — MVP (wajib)
- [x] Login (role: Atlet, Coach, Admin) — form UI + integrasi API + redirect ke dashboard, teruji end-to-end di browser (Playwright)
- [ ] Athlete Profile (biodata, foto, statistik medali) — backend endpoint sudah ada (`/api/athletes`), UI belum
- [ ] Database atlet (Admin)
- [ ] Event / Competition (detail + daftar peserta) — backend endpoint sudah ada (`/api/events`), UI belum
- [ ] Time Trial (input coach + evaluasi bintang + rekomendasi) — backend endpoint sudah ada (`/api/time-trials`), UI belum
- [ ] Grafik progress performa (Performance Tracking)
- [ ] Training Reminder / Training Calendar
- [ ] Dashboard Atlet (Home)
- [ ] Coach Dashboard

## Phase 2 — Lanjutan
- [ ] Chat coach-atlet
- [ ] Absensi latihan
- [ ] Payment membership
- [ ] Push notification
- [ ] Ranking club

## Sedang dikerjakan

## Selesai
