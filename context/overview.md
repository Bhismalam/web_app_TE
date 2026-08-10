# SwimClub Management System — Konsep Utama

Nama sementara: **SwimClub Management System**

## Target Pengguna

### 1. Atlet
- Melihat perkembangan performa
- Jadwal latihan
- Catatan time trial
- Riwayat lomba
- Target pribadi

### 2. Coach
- Monitoring atlet
- Evaluasi performa
- Membuat jadwal latihan
- Melihat perkembangan semua atlet

### 3. Admin Club
- Data atlet
- Event
- Database prestasi
- Administrasi KTA

## User Flow Utama

```
Login
  ↓
Dashboard
  ↓
Pilih fitur
  ├── Performance
  ├── Training
  ├── Competition
  ├── Achievement
  └── Profile
```

## Struktur Menu

**Mobile (Bottom Navigation)** — prioritas karena mayoritas atlet pakai HP:
- 🏠 Home
- 📊 Performance
- 🏊 Training
- 🏆 Event
- 👤 Profile

**Desktop (Sidebar)**:
- Dashboard
- Athletes
- Training
- Time Trial
- Competition
- Achievement
- Reports
- Settings
