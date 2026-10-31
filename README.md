# GSA 2026 Batch 2 · Inauguration Memories

Arsip personal inaugurasi Google Student Ambassador 2026 Batch 2, dari Steven Erlinto dan Galih Kusuma Wijaya. Berisi 28 kenangan: 19 foto dan 9 video, dengan lima chapter perjalanan dan bonus candidate journey.

Desain mengikuti [website GSA Indonesia](https://googlestudentambassador.id/): hero biru ke hitam, Google Sans Flex, navbar pil, dan panel gelap. Galeri menggunakan polaroid gantung di atas grid yang memudar, dengan ayunan terkait scroll. Klik polaroid untuk membuka media dan deskripsi yang tersedia.

## Preview lokal

Jalankan dari root repository:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Buka [localhost:8000](http://localhost:8000). Tidak perlu install dependency atau menjalankan build.

## Fitur

- Search berdasarkan judul, lokasi, deskripsi, chapter, dan tag; prompt cepat menggunakan data lokal, tanpa API AI.
- Filter kategori, termasuk video dan perjalanan kandidat; jumlah media dihitung dari data.
- Galeri polaroid dengan CSS scroll-driven animation, fallback IntersectionObserver, dan dukungan reduced motion.
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

Uji browser dilakukan pada search, filter, viewer, menu, motion, serta beberapa ukuran viewport; catatan hasil aktual ada di `PLAN.md`. Website tetap statis dan dapat dilayani dari GitHub Pages atau konfigurasi Vercel yang sudah ada.

Kredit: made by memories, from Steven and Galih · GSAID26B20013 & GSAID26B20004.
