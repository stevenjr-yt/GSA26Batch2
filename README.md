# GSA 2026 Batch 2 · Inauguration Memories

Arsip personal inaugurasi Google Student Ambassador 2026 Batch 2, dari Steven Erlinto dan Galih Kusuma Wijaya. Berisi 28 kenangan: 19 foto dan 9 video, dengan lima chapter perjalanan dan bonus candidate journey.

Desain mengikuti [website GSA Indonesia](https://googlestudentambassador.id/): hero biru ke hitam, Google Sans Flex, navbar pil, dan panel gelap. Galeri menggunakan polaroid gantung di atas grid yang memudar, dengan ayunan fisik dan momentum. Klik polaroid untuk membuka media dan deskripsi yang tersedia.

## Preview lokal

Jalankan dari root repository:

```sh
npm install
npm run dev
```

Buka [localhost:8000](http://localhost:8000). Gunakan Node.js 22 atau lebih baru. Halaman tetap buildless; Node menyediakan API upload untuk preview lokal.

## Fitur

- Search berdasarkan judul, lokasi, deskripsi, chapter, dan tag; prompt cepat menggunakan data lokal, tanpa API AI.
- Filter kategori, termasuk video dan perjalanan kandidat; jumlah media dihitung dari data.
- Galeri polaroid dengan physics pegas: scroll cepat memberi impulse lebih kuat, inertia berlanjut setelah scroll berhenti, damping mengembalikan posisi, dan reduced motion tetap didukung.
- Viewer native dialog: foto utuh, video dengan kontrol, deskripsi opsional, panah keyboard, Escape, dan pengembalian fokus.
- Navigasi mobile, chapter cerita, rewind, dan FAQ.
- Suara ambien opt-in melalui Web Audio dan confetti manual.
- Font lokal WOFF2 dan foto WebP dengan fallback JPEG.

## Struktur

```text
index.html            Struktur halaman dan dialog
assets/css/style.css  Token, layout, polaroid, motion, responsive
assets/js/app.js      Renderer, filter/search, viewer, utilitas
assets/js/data.js     Seluruh data kenangan dan prompt lokal
assets/brand/         Logo/ornamen dan catatan sumber
assets/fonts/         Google Sans Flex, Inter, serta lisensi OFL
assets/images/        Foto, poster, dan thumbnail asli
assets/videos/        Video MP4 asli
PLAN.md               Audit referensi, rencana, dan progres implementasi
```

## Pemeriksaan

```sh
node --check assets/js/app.js
node --check assets/js/data.js
```

Uji browser dilakukan pada search, filter, viewer, menu, motion, serta beberapa ukuran viewport; catatan hasil aktual ada di `PLAN.md`. Deploy ke Vercel agar endpoint `/api/moments` ikut berjalan. Hosting statis saja tetap menampilkan arsip, tetapi tidak menyediakan API upload.

Kredit: made by memories, from Steven and Galih · GSAID26B20013 & GSAID26B20004.

Tes interaksi dan physics (memerlukan Playwright CLI untuk pengembangan):

```sh
playwright-cli -s=gsa-check open http://localhost:8000
playwright-cli -s=gsa-check run-code --filename=tests/browser-smoke.js
playwright-cli -s=gsa-check run-code --filename=tests/polaroid-physics.js
```

## Supabase dan upload bersama

1. Salin `.env.example` ke `.env` jika belum ada; isi `SUPABASE_URL` dan `SUPABASE_SECRET_KEY` (`sb_secret_...`). Key legacy `service_role` boleh memakai `SUPABASE_SERVICE_ROLE_KEY` sebagai pengganti.
2. Jalankan `supabase/setup.sql` di SQL Editor project Supabase. Bucket default `gsa-moments` bersifat publik untuk melihat/download, tetapi hanya server yang menulis data.
3. Jalankan `npm run dev`. Restart setelah mengubah `.env`.
4. Pada Vercel, isi variabel yang sama melalui Project Settings → Environment Variables. File `.env` tidak di-commit atau dikirim ke browser.

Foto dikompresi browser lalu divalidasi dan dikompresi ulang oleh server menjadi WebP maksimal **100.000 byte**. Supabase menyimpan foto serta metadata; upload tidak membuat commit atau redeploy. API membatasi 20 upload per IP dalam 24 jam. Pengguna tidak dapat mengubah/menghapus momen orang lain melalui API publik. Admin bisa mengelola record di dashboard Supabase.

```sh
npm test
playwright-cli -s=gsa-check run-code --filename=tests/upload-browser.js
```

`npm test` memakai mock Supabase. Tes browser upload juga memalsukan respons publikasi, sehingga tidak menambah data pada project asli. Uji Supabase nyata dilakukan dengan data sementara; seluruh row dan objek uji dibersihkan.

## Video Google Drive

Di form Upload momen kamu, pilih **Foto** untuk mengunggah file langsung, atau **Video Google Drive** untuk menempel link file video. Foto tetap dibatasi 100 KB. Video tetap berada di Drive; Supabase hanya menyimpan link, judul, deskripsi opsional, dan tag.

- Project Supabase baru: jalankan `supabase/setup.sql` versi terbaru.
- Project yang sudah memakai schema foto awal: jalankan `supabase/upgrade-drive-video.sql` satu kali. Foto lama dipertahankan.
- Bagikan file Drive sebagai **Siapa saja yang memiliki link → Pelihat**, lalu salin link file (bukan folder).
- Player menggunakan halaman `/preview` Google Drive di iframe. Tombol **Buka / unduh di Drive** mengikuti izin unduhan dari pemilik video.
- Link `/file/d/ID/view`, `/open?id=ID`, dan `/uc?id=ID` diterima; resource key dipertahankan jika ada. Domain selain `drive.google.com` ditolak.
- Pemutaran dapat dipengaruhi izin, status pemrosesan, dan batas playback Google Drive. Integrasi tidak menggunakan proxy video atau mengakali pembatasan pemilik. Lihat [panduan pemutaran Drive](https://support.google.com/drive/answer/2423694) dan [pengaturan berbagi](https://support.google.com/drive/answer/7166529).

Tes browser untuk iframe menggunakan mock player; tidak ada file Drive publik milik pengguna yang diberikan untuk uji playback nyata. Penyimpanan metadata video pada Supabase asli sudah diverifikasi dan data uji langsung dihapus.
