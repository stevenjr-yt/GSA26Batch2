# 🌟 Google Student Ambassador (GSA) Inauguration 2026 Batch 2 - Memories Archive

Website kenangan interaktif bernuansa **Google Gemini 2026** (Light Blue, Glassmorphism, Cosmic Aurora, & Sparkle Star) untuk mendokumentasikan momen bersejarah pelantikan **Google Student Ambassador 2026 Batch 2**.

---

## 🚀 Fitur Utama

- 🎨 **Google Gemini Light Blue Aesthetic**: Desain modern khas Gemini AI dengan gradien biru langit muda, efek glassmorphism, dan ornamen SVG Gemini Sparkle.
- ⚡ **Ultra Ringan & Terkompresi**:
  - Seluruh foto dikompresi ke format generasi terbaru **WebP** & optimized JPEG.
  - Seluruh video MP4 dikompresi dengan codec **H.264 Web-Stream Ready** (`+faststart`).
  - Menggunakan **SVG vector murni** untuk seluruh ikon UI agar tajam di semua layar tanpa beban download berat.
- 🧠 **Interactive Gemini AI Search & Prompt Chips**:
  - Cari kenangan secara instan atau klik prompt cepat seperti *"Momen Hujan Confetti"*, *"Di mana foto cermin cembung?"*, *"Taruhan UNO Rp 30.000"*, dll.
  - Menampilkan jawaban cerdas simulasi AI Gemini.
- 🗺️ **Interpretasi Lengkap Lokasi Kegiatan (5 Chapters)**:
  1. **Chapter 1: Transit & Commute (MRT Jakarta)** — Suasana pagi berdesakan di gerbong dan peron stasiun MRT Jakarta.
  2. **Chapter 2: The Inauguration Ceremony (GP Space, Jakarta)** — Antrean masuk jas almamater, pelantikan di panggung LED megah, pembagian Google Varsity Jacket & ID Card, serta momen klimaks **Hujan Confetti Drop**!
  3. **Chapter 3: Google Indonesia HQ Tour (Pacific Century Place, SCBD)** — Dinding logo 3D batik bunga Google, instalasi Bangkit, Google G-Bike, lorong payung tradisional, dan tour microkitchen pantry.
  4. **Chapter 4: Culinary & Little Tokyo (Blok M & IPPUDO)** — Street mirror selfie di Melawai Blok M, semangkuk hangat IPPUDO ramen, dan makan bersama sepanci emas ramyeon Korea.
  5. **Chapter 5: Night Thrills & Hotel UNO (Rumah Hantu Jeruk Purut & Kamar Hotel)** — Uji nyali Rumah Hantu Jeruk Purut dan duel sengit UNO kamar hotel pukul 23:24 dengan taruhan transfer QRIS Rp 30.000!
  6. **Bonus Chapter: Steven Erlinto Genesis Poster** — Dokumentasi poster kandidat awal *"Ready to Become Your Next AI Leader"*.
- 🎵 **Generative Ambient Synth Soundscape**:
  - Suara ambient futuristik Gemini yang digenerate langsung oleh browser via **Web Audio API** (tanpa perlu file MP3 besar eksternal!).
- 🎉 **Canvas Confetti Cannon**: Letupan confetti warna Google murni yang bisa dipicu kapan saja.
- 🔍 **Interactive Lightbox Modal**: Penampil foto & video resolusi tinggi dengan navigasi panah keyboard dan detail cerita lengkap.

---

## 📁 Struktur Folder Project (Siap Langsung Up ke GitHub)

```text
gsa-2026-batch2-memories/
├── index.html                  # Halaman utama website
├── README.md                   # Dokumentasi project & panduan deploy
├── .gitignore                  # File ignore git
└── assets/
    ├── css/
    │   └── style.css           # Styling Google Gemini theme & animasi
    ├── js/
    │   ├── data.js             # Data koleksi foto/video & interpretasi cerita
    │   └── app.js              # Interaktivitas galeri, lightbox, synth, & filter
    ├── images/
    │   ├── *.webp / *.jpg      # Seluruh foto terkompresi
    │   └── video-thumbs/       # Thumbnail cepat untuk preview video
    └── videos/
        └── *.mp4               # Video vlog & highlight terkompresi
```

---

## 💻 Cara Menjalankan Secara Lokal (Preview)

Di terminal Anda, buka folder project ini dan jalankan local web server:

```bash
cd ~/.gemini/antigravity/scratch/gsa-2026-batch2-memories
python3 -m http.server 8000
```

Buka browser di alamat: `http://localhost:8000`

---

## 🐙 Cara Langsung Push ke GitHub & Aktifkan GitHub Pages

Ikuti 3 langkah mudah ini di terminal Anda:

### 1. Inisialisasi Git & Commit
```bash
cd ~/.gemini/antigravity/scratch/gsa-2026-batch2-memories
git init
git add .
git commit -m "feat: initial commit Google Student Ambassador 2026 Batch 2 memories website"
```

### 2. Buat Repositori Baru di GitHub
1. Buka [github.com/new](https://github.com/new).
2. Beri nama repositori, misalnya: `gsa-2026-batch2-memories`.
3. Biarkan opsi *Add README* tidak dicentang (karena sudah ada).
4. Klik **Create repository**.

### 3. Push ke GitHub
Salin URL repositori Anda dan jalankan perintah berikut:

```bash
git branch -M main
git remote add origin https://github.com/USERNAME_GITHUB_KAMU/gsa-2026-batch2-memories.git
git push -u origin main
```

*(Ganti `USERNAME_GITHUB_KAMU` dengan username GitHub Anda)*

---

## 🌐 Cara Mengaktifkan GitHub Pages (Website Langsung Online Gratis!)

1. Di halaman repositori GitHub Anda, klik tab **Settings**.
2. Di menu sebelah kiri, klik **Pages**.
3. Pada bagian **Build and deployment > Branch**:
   - Pilih branch: `main`
   - Pilih folder: `/ (root)`
4. Klik **Save**.
5. Tunggu sekitar 1-2 menit, website kenangan Anda akan langsung online di:
   `https://USERNAME_GITHUB_KAMU.github.io/gsa-2026-batch2-memories/`

---
Dibuat dengan bangga untuk seluruh keluarga besar **Google Student Ambassador 2026 Batch 2** 🚀
Tagline: *"Ready to Become Your Next AI Leader"*
