# Detail Fitur

## A. Dashboard Atlet (WAJIB)
Halaman utama saat atlet login. Menampilkan:
- Sapaan personal ("Halo, Bhisma 👋")
- Next Competition (nama event, tanggal, kategori)
- Your Performance (kategori, last time, best time, progress %)
- Today's Training (nama sesi, jam)

Tujuan: atlet langsung tahu latihan hari ini, event berikutnya, performa terakhir tanpa perlu navigasi.

## B. Athlete Profile
Biodata + foto atlet:
- Nama, Nomor Atlet (mis. FS-0231), KTA (mis. BALI-FS-2026-0231)
- Tanggal lahir, Kategori (Junior/Senior), Club

Statistik atlet (gaya "game profile"):
- Total Competition, 🥇 Gold, 🥈 Silver, 🥉 Bronze

## C. Performance Tracking (fitur pembeda utama)
Bukan sekadar tabel — wajib pakai **grafik** (line chart progres waktu per kategori, mis. 50M Surface per bulan).
Tujuan: atlet bisa menjawab "Apakah saya berkembang?"

## D. Time Trial Management
Input oleh coach:
- Nama atlet, kategori, tanggal, time, kondisi (mis. Pool 25M), catatan coach

Output evaluasi:
- Rating bintang: Start, Speed, Technique
- Recommendation / fokus latihan (mis. underwater kick, breathing control)

## E. Event / Competition
Detail event:
- Nama, tanggal, lokasi, kategori (50M/100M/200M)
- Daftar atlet yang ikut (checklist)

## F. Training Reminder → Training Calendar
Bukan sekadar reminder — kalender bulanan dengan sesi latihan per tanggal (Sprint Training, Technique Training, Strength Training, dsb).

## G. Achievement / Trophy Room (wajib untuk motivasi atlet)
Konsep seperti game — badge unlock:
- First Competition, 10 Competition, Personal Best, dst.

## H. Coach Dashboard
Ringkasan untuk coach:
- Total Athlete, Active Training, Average Improvement (%), Need Attention (jumlah atlet)

## Component UI (Figma, sebelum coding)
- Button: Primary, Secondary, Danger
- Card: Competition Card, Performance Card, Training Card
- Chart: Line chart, Bar chart
- Avatar
- Badge (contoh: 🥇 Gold Medal, 🔥 Personal Best, ⭐ Active Athlete)

## Design Style
- Style: Modern Sport Dashboard
- Warna:
  - Primary (Ocean Blue): `#0066FF`
  - Secondary (Aqua): `#00C2FF`
  - Background (White/Soft Grey): `#F5F8FC`
  - Text: `#111827`
- Hindari desain ramai/berlebihan — clean, sport-focused.
