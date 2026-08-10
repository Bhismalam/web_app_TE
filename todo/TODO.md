# To-Do — SwimClub Management System

## Pre-Development
- [x] Tentukan stack/teknologi yang dipakai — Next.js + Express.js + PostgreSQL + Prisma (lihat context/tech-stack.md)
- [x] Tentukan struktur repo — `frontend/` + `backend/`, auth JWT custom
- [x] Setup struktur project awal — scaffold Next.js + Express + Prisma schema selesai
- [x] Setup PostgreSQL lokal & isi `backend/.env` (DATABASE_URL, JWT_SECRET), migration awal sudah dijalankan — end-to-end teruji (lihat context/tech-stack.md)
- [x] Konfigurasi Tailwind theme dengan palette Ocean Blue/Aqua — `frontend/src/app/globals.css` (`--primary`/`--secondary`)
- [x] Install chart library (Recharts) di frontend
- [ ] Buat design system di Figma (Button, Card, Chart, Avatar, Badge)
- [x] Buat `backend/prisma/seed.js` — data contoh (3 atlet dengan variasi performa, coach, admin, event, time trial, training) via `npm run prisma:seed`

## Phase 1 — MVP (wajib)
- [x] Login (role: Atlet, Coach, Admin) — form UI + integrasi API + redirect ke dashboard, teruji end-to-end di browser (Playwright)
- [x] Dashboard Atlet (Home) — Next Competition, Your Performance (last/best time + progress %), Today's Training. Teruji end-to-end dengan data seed asli (Playwright + screenshot)
- [x] Athlete Profile (biodata, foto, statistik medali) — halaman `/profile`, statistik Gold/Silver/Bronze dari `EventEntry.result`, teruji end-to-end (Playwright + screenshot)
- [x] Database atlet (Admin) — halaman `/admin/athletes`: list semua atlet, edit biodata inline, tambah akun atlet baru. Teruji end-to-end (Playwright + screenshot). **Phase 1 MVP selesai 100%.**
- [x] Event / Competition (detail + daftar peserta) — halaman `/events` (list + form buat event untuk Admin) dan `/events/[id]` (detail + checklist peserta + medali), teruji end-to-end (Playwright + screenshot)
- [x] Time Trial (input coach + evaluasi bintang + rekomendasi) — halaman `/time-trials`, pilih atlet + form + riwayat time trial, teruji end-to-end (Playwright + screenshot)
- [x] Grafik progress performa (Performance Tracking) — halaman `/performance`, line chart Recharts per kategori (tab switcher kalau >1 kategori), tooltip hover, teruji end-to-end (Playwright + screenshot)
- [x] Training Reminder / Training Calendar — halaman `/training`, grid kalender bulanan (navigasi bulan, highlight hari ini) + form buat jadwal untuk Coach/Admin, teruji end-to-end (Playwright + screenshot)
- [x] Coach Dashboard — Total Athlete, Active Training, Average Improvement, Need Attention (+ daftar atlet & alasan), teruji end-to-end (Playwright + screenshot)

## Hardening keamanan (2026-08-10)
- [x] Registrasi publik atlet — halaman `/register`, langsung auto-login setelah daftar (return token dari backend)
- [x] Kunci `POST /api/auth/register` supaya role selalu dipaksa ATHLETE di backend (sebelumnya bisa dikirim role apa saja dari klien — celah privilege escalation, sudah diverifikasi tertutup via curl test)
- [x] `POST /api/auth/register-staff` (ADMIN only) — jalur terpisah untuk bikin akun Coach/Admin, belum ada UI-nya (dipakai lewat API langsung atau seed script untuk sekarang)

## UI/UX improvements (2026-08-10)
- [x] Ganti rating bintang dari emoji (☆/⭐, render tidak konsisten) ke SVG kustom (`StarIcon.tsx`) — dipakai di `StarRatingInput` (form) dan `StarRatingDisplay` (riwayat)
- [x] Field `sport` (Swimming/Finswimming) di data atlet — schema Prisma + migration, filter di halaman Admin Athletes dan Time Trial (pilih atlet), pilihan cabang di form registrasi
- [x] Dialog konfirmasi sebelum Logout — `ConfirmDialog.tsx`, dipasang di tombol Logout dashboard

## Phase 2 — Lanjutan
- [ ] Chat coach-atlet
- [ ] Absensi latihan
- [ ] Payment membership
- [ ] Push notification
- [ ] Ranking club
- [ ] UI admin untuk membuat akun Coach/Admin baru (pakai endpoint `register-staff` yang sudah ada)

## Sedang dikerjakan

## Selesai
