# PLAN: Redesign UI Web Inaugurasi GSA 2026 Batch 2

Tanggal audit: **31 Oktober 2026, WIB**
Repo: `D:\Job\GSA\web-inau`
Baseline: branch `main`, commit `b4ca30c`
Referensi utama: [googlestudentambassador.id](https://googlestudentambassador.id/)
Status: **implementasi utama selesai; verifikasi visual dan fungsional berjalan.**

## 1. Hasil yang dituju dan batas pekerjaan

Mengubah seluruh bahasa visual repo agar selaras dengan website referensi: hero gradasi biru ke hitam, halaman dominan hitam, Google Sans Flex, judul putih berukuran besar, navbar mengambang berbentuk pil, kartu gelap, ilustrasi Google/Gemini, dan ritme ruang yang lega.

**Arahan tambahan pengguna menjadi prioritas khusus untuk galeri:** foto ditampilkan sebagai **polaroid yang digantung di depan background kotak-kotak yang memudar**. Polaroid bergoyang halus ketika halaman di-scroll. Deskripsi baru muncul setelah foto diklik, jika deskripsinya tersedia.

Ini adalah perubahan menyeluruh UI, layout, palette, typography, elemen, dan motion pada website arsip yang sudah ada. Identitas kontennya tetap dokumentasi inaugurasi, bukan diubah menjadi formulir pendaftaran program. Seluruh 28 entri, media asli, perjalanan Steven, pencarian, filter, dan pembuka foto/video dipertahankan. Susunan visual dapat diubah agar mengikuti referensi.

Halaman Referral, Leaderboard, dan List GSA pada referensi turut diaudit untuk memahami sistem desain secara lengkap. Repo tidak memiliki fitur/data tersebut; implementasi utama menggunakan pola visualnya dan menautkan ke halaman resmi yang relevan, tanpa membuat sistem referral atau menyalin database peserta.

Prioritas keputusan: **arahan polaroid pengguna > tampilan referensi yang diamati > kebiasaan desain umum**. Bagian galeri sengaja menjadi adaptasi khusus, sementara bagian lain mengikuti referensi sedekat mungkin dengan kebutuhan konten repo.

## 2. Metode dan cakupan inspeksi

Audit menggunakan browser nyata, screenshot, DOM, computed styles, pemeriksaan stylesheet, dan pembacaan source repo. Angka di bawah merupakan hasil pengukuran pada viewport yang disebutkan, bukan dugaan dari warna logo Google.

| Area | Pemeriksaan yang dilakukan |
| --- | --- |
| Halaman utama referensi | Hero, navbar, kriteria, benefit/tier, rewind, strip foto, persyaratan, timeline, FAQ, akhir halaman |
| Halaman pendukung | `/referral`, `/leaderboard`, `/listgsa`; tabel diperiksa setelah loading selesai |
| Desktop | Screenshot penuh dan per bagian pada 1440 × 1000 |
| Laptop/tablet | Hero pada 1366 × 768 dan 1024 × 768 |
| Mobile | Halaman utama dan halaman pendukung pada 390 × 844, termasuk menu mobile |
| Interaksi referensi | Menu, tombol indikator tier, FAQ terbuka, tombol play video, konten tabel yang sudah dimuat |
| Repo lokal | Preview melalui HTTP, screenshot desktop/mobile, galeri, lightbox, pencarian kosong, filter video, ArrowRight, Escape |
| Source repo | Seluruh struktur HTML, stylesheet, renderer galeri, filter/search, lightbox, audio, confetti, data, dan konfigurasi hosting |

Temuan diberi pemisahan yang jelas: **hasil inspeksi** adalah perilaku/style yang benar-benar terlihat; **rencana** adalah spesifikasi yang akan dibangun. Referensi dapat berubah setelah tanggal audit. Screenshot halaman panjang dipakai untuk urutan bagian; detail diperiksa lagi melalui screenshot viewport agar tidak bergantung pada gambar yang diperkecil.

## 3. Audit website referensi

### 3.1 Karakter visual global

- Homepage memakai tema **gelap**, bukan putih/biru muda.
- Hero memakai `linear-gradient(rgb(49, 134, 255) 0%, rgb(0, 0, 0) 100%)`, yaitu **#3186FF ke #000000**.
- Setelah hero, background utama hitam polos. Variasi visual muncul dari foto, objek 3D, dan panel gelap.
- Teks utama putih; deskripsi putih redup/abu terang. Warna-warni Google terutama hadir di ilustrasi dan foto.
- Judul hero uppercase, rapat, terpusat, dengan objek 3D di sekitar huruf. Ada ornamen mata yang membuat komposisi terasa playful.
- Navbar berupa kapsul terang/transparan yang mengambang di atas halaman dan tetap tampak saat scroll.
- Radius mengikuti fungsi: navbar/CTA berbentuk pil; panel besar 20–24 px; media bagian dalam 16 px; badge kecil 4–8 px.
- Tidak ditemukan elemen footer konvensional pada homepage saat audit; halaman berakhir setelah FAQ dan ruang bawah yang luas.

Sumber: [homepage referensi](https://googlestudentambassador.id/).

### 3.2 Inventaris seluruh bagian homepage

| Bagian | Hasil inspeksi desktop 1440 px | Pola yang akan diambil |
| --- | --- | --- |
| Navbar | Kapsul sekitar 1000 × 55 px; logo horizontal sekitar 194 × 31 px; link biru 12 px; bayangan turun; background putih alpha 0.8 | Navbar mengambang, logo horizontal, link ringkas, hamburger mobile |
| Hero | Tinggi 1000 px pada viewport setinggi 1000 px; padding atas 150 px; blok judul sekitar 556 px; headline 80/80 px; subtitle 32 px; body 24 px; CTA pil 123 × 40 px | Komposisi terpusat besar, hero biru-hitam, headline putih, ornamen seperlunya |
| Kriteria | Lima kartu dalam susunan 3 + 2, kelompok selebar sekitar 700 px; gap 30 px; kartu sekitar 213 × 260 px | Lima chapter sebagai kartu visual, bukan lima kotak statistik kecil |
| Kartu kriteria | Padding 16 px; radius 20 px; border 2 px; gambar latar biru sekitar 177 × 109 px dan objek transparan di atasnya | Pola image-first, label singkat, panel gelap |
| Benefit program | Heading terpusat, deskripsi, lalu area 1200 px: indikator kiri sekitar 284 px dan kartu kanan 840 px | Area chapter/story dengan navigasi ringkas dan panel cerita besar |
| Benefit/tier | Empat tingkat: ambassador, Rising Star, Achiever, Trailblazer; kartu kanan sticky/bertumpuk, sekitar 840 × 416 px; teks di kiri dan visual di kanan | Pola panel cerita dan highlight; isi tetap dokumentasi repo |
| Rewind | Heading besar; thumbnail video sekitar 434 × 244 px; tombol play putih bulat | Satu video unggulan dengan player saat diminta |
| Strip foto | Foto berbingkai putih tebal, sudut sangat membulat, sedikit miring, bergeser horizontal | Inspirasi fisik kertas/foto; diadaptasi menjadi galeri polaroid gantung sesuai arahan pengguna |
| Heading persyaratan | Headline uppercase besar bertumpuk dengan objek 3D dan mata | Penutup/story statement dengan foto/ornamen, sesuai konten inaugurasi |
| Persyaratan | Dua panel bertumpuk; lebar 750 px; background #1F1F1F; radius 24 px; padding 24 px; body 16 px | Panel ringkasan cerita/konteks yang mudah dibaca |
| Timeline | Heading terpusat dan dua panel 750 px; daftar aktivitas dan tiga bagian proses; badge abu kecil | Urutan perjalanan lima chapter, bukan menyalin jadwal rekrutmen |
| FAQ | 20 pertanyaan; container sekitar 800 px, #202124, radius 20 px; row dengan ikon plus kiri, divider tipis; jawaban muncul setelah klik | Accordion untuk informasi penggunaan arsip, bukan menyalin seluruh FAQ pendaftaran |
| Akhir halaman | Background hitam; ruang bawah besar, sekitar 200 px padding section FAQ | Footer arsip yang minimal dengan kredit yang sudah ada |

Pengukuran layout dapat berubah selama scroll karena posisi sticky dan animasi. Angka tersebut menjadi acuan proporsi, bukan alasan mengunci semua elemen ke ukuran absolut.

### 3.3 Halaman lain pada referensi

| Halaman | Temuan | Relevansi terhadap redesign |
| --- | --- | --- |
| [Referral](https://googlestudentambassador.id/referral) | Hero biru-hitam, judul uppercase, objek megafon/gantungan kunci, CTA Detail; empat panel berisi ketentuan, hadiah, cara ikut, dan timeline | Pola hero dan panel informasi konsisten dengan homepage |
| [Leaderboard](https://googlestudentambassador.id/leaderboard) | Background biru-hitam; judul 32 px; tabel gelap sekitar 800 px, 20 baris; kolom No, Nama, Referral Terpakai; header #232326, cell #161618; teks header 12 px dan isi 14 px; padding cell 10 × 12 px | Acuan tabel gelap jika suatu saat ada data arsip; tidak diperlukan untuk galeri sekarang |
| [List GSA](https://googlestudentambassador.id/listgsa) | **Pengecualian tema:** halaman #F2F2F2 dengan judul hitam; tabel sekitar 984 px, 2000 baris saat audit; kolom GSA ID, Nama Lengkap, Universitas; font Inter 14 px; tidak ditemukan input pencarian pada state yang diperiksa | Dicatat sebagai pengecualian pada situs referensi; bukan dasar mengganti homepage arsip menjadi terang |

Loading pada halaman tabel adalah state sementara, bukan tampilan akhir. Data dan struktur tabel sudah diverifikasi setelah barisnya muncul.

### 3.4 Perilaku mobile dan masalah referensi yang tidak perlu ditiru

- Stylesheet referensi memiliki breakpoint **≤809.98 px**, **810–1199.98 px**, dan desktop mulai **1200 px**.
- Pada 390 px, navbar tertutup sekitar **320 × 55 px**, ditempatkan dekat atas dengan margin sekitar 16 px; logo di kiri dan hamburger di kanan.
- Bagian konten umumnya memakai padding horizontal 24 px dan berubah menjadi satu kolom.
- Kartu kriteria menjadi susunan vertikal; heading benefit turun ke 36 px; body dan panel menyesuaikan lebar layar.
- Hero mobile yang diamati masih memakai ukuran headline **80 px** dalam container sempit. Kata terpotong ke beberapa baris dan bertumpuk dengan subtitle/body. Ini adalah masalah layout referensi yang harus diperbaiki pada hasil implementasi.
- Menu mobile terbuka pernah meluas ke luar viewport sehingga link sulit dijangkau. Hasil implementasi harus memiliki panel selebar viewport yang aman dan semua link terjangkau.
- CTA Detail homepage mengarah ke `/googlestudentambassador#kriteria`, sedangkan homepage yang diaudit berada di `/`. Anchor navigasi lain juga memakai beberapa ID yang berbeda dari nama layer. Hasil implementasi wajib memvalidasi target anchor yang benar pada repo.
- Halaman List GSA menampung tabel yang lebih lebar daripada layar di dalam area scroll; jangan membiarkan hal itu menjadi overflow seluruh halaman.

## 4. Audit repo saat ini

### 4.1 Struktur dan teknologi

Repo merupakan website statis dengan HTML, CSS, dan JavaScript biasa. Tidak ada `package.json` atau framework aplikasi. Tailwind dimuat dari CDN dan dikonfigurasi inline di `index.html`.

| File | Tanggung jawab | Dampak redesign |
| --- | --- | --- |
| `index.html` | Announcement bar, header, hero, search, metrik, chapter cards, galeri, highlight Steven, lightbox, footer; config Tailwind | Susun ulang section dan markup; ganti utility warna lama; tambah markup gantungan dan panel galeri |
| `assets/css/style.css` | Import font, token Gemini, background radial, glass panels, gradient text, hover, lightbox, animasi audio | Ganti fondasi visual, typography, layout, polaroid, fading grid, responsive, reduced motion |
| `assets/js/app.js` | Renderer chips dan kartu, filter/search, lightbox, audio, confetti, klik chapter | Ganti template gallery menjadi polaroid; hilangkan class warna hardcoded; tambah motion/focus management |
| `assets/js/data.js` | 28 entri media dan 10 prompt pencarian | Pertahankan data, tambah metadata presentasi hanya jika diperlukan |
| `assets/images/` | Foto, poster, thumbnail, logo G; ada pasangan WebP/JPEG | Reuse media yang tersedia; jangan mengganti foto dokumentasi dengan stok |
| `assets/videos/` | 9 file video MP4 | Pertahankan; diputar saat pengguna membuka/memilih video |
| `vercel.json` | Clean URL dan cache media immutable | Tidak memerlukan perubahan routing untuk redesign satu halaman |
| `README.md` | Deskripsi tema dan fitur saat ini | Perbarui dokumentasi setelah implementasi selesai |

### 4.2 Perbedaan dan hal yang harus diperbaiki

| Aspek | Kondisi sekarang | Target |
| --- | --- | --- |
| Tema | Putih, sky/cyan, radial aurora tetap di background | Hitam, hero biru-hitam, panel gelap |
| Palette | `--bg-primary: #FFFFFF`, `--text-primary: #0F172A`, aksen cyan/indigo; token CSS dan config Tailwind tidak sepenuhnya sama | Token warna terpusat berdasarkan hasil inspeksi |
| Font | Plus Jakarta Sans untuk body, Outfit untuk heading, Space Grotesk untuk kode | Google Sans Flex utama, Inter untuk bagian yang memang memerlukannya |
| Header | Announcement penuh, header sticky selebar layar, logo G dalam kotak, tombol audio/confetti dominan | Navbar pil mengambang; kontrol tambahan pindah ke area utilitas arsip |
| Hero | Headline dua baris, teks gradient, deskripsi panjang, search/chips, empat metrik | Headline putih besar dan fokus; search serta metrik dipindah ke bawah hero |
| Chapter | Lima kartu kecil bernomor, tanpa foto utama | Lima kartu bergambar dan area cerita dengan proporsi referensi |
| Galeri | Grid kartu putih dengan banyak badge, lokasi overlay, deskripsi, tag, link | **Polaroid gantung; background grid fading; deskripsi tersembunyi sampai klik** |
| Lightbox | Panel putih, media di tengah gelap; Escape dan panah sudah berfungsi | Panel gelap konsisten dengan referensi, metadata terbaca, fokus keyboard dikelola |
| Statistik | Label menampilkan 10 video | Data aktual: **19 image + 9 video = 28 entri**; hitung dari data, bukan angka hardcoded |
| Kategori | Lima chapter lokasi + kategori bonus `candidate` | Semua enam kategori data tetap ada, termasuk konten bonus |
| Aksesibilitas | Kartu dibuat sebagai `div` klik; lightbox belum memiliki role dialog; kontrol ikon belum seluruhnya punya nama | Kontrol semantik, focus-visible, nama tombol, fokus modal, navigasi keyboard |
| Motion | Aurora pulse, sparkle float, hover naik, typewriter, confetti | Motion seperlunya; polaroid goyang karena scroll, bukan semua elemen berdenyut |
| Footer | Panel sky dan kredit Steven | Kredit tetap ada dalam footer hitam minimal |

Fungsi yang diverifikasi sebelum perubahan: galeri awal 28 entri; ArrowRight mengubah lightbox dari `1 / 28` ke `2 / 28`; Escape menutup modal; pencarian tanpa hasil menampilkan empty state; pindah ke filter video mengosongkan query dan menghasilkan 9 kartu video.

## 5. Design tokens yang akan digunakan

### 5.1 Color palette

| Token/usulan nama | Nilai | Sumber/peran |
| --- | --- | --- |
| `--color-page` | `#000000` | Background homepage referensi |
| `--color-hero-start` | `#3186FF` | Ujung atas hero yang terukur |
| `--color-hero-end` | `#000000` | Ujung bawah hero |
| `--color-surface` | `#202124` | Accordion/panel gelap |
| `--color-surface-muted` | `#1F1F1F` | Panel persyaratan/timeline |
| `--color-surface-raised` | `#262626` | Bingkai luar panel benefit |
| `--color-criteria` | `rgba(99,99,99,.45)` | Kartu kriteria; menghasilkan abu gelap di atas hitam |
| `--color-border-criteria` | `rgba(89,89,89,.5)` | Border kartu kriteria 2 px |
| `--color-text` | `#FFFFFF` | Heading/body utama |
| `--color-text-secondary` | `rgba(255,255,255,.9)` | Body utama redup |
| `--color-text-muted` | `#EDEDED` | Deskripsi kartu |
| `--color-link` | `#0099FF` | Link navbar yang terukur |
| `--color-nav` | `rgba(255,255,255,.8)` | Navbar desktop |
| `--color-cta` | `rgba(138,138,138,.2)` | CTA Detail di hero |
| `--color-badge` | `rgba(255,255,255,.27)` | Kotak nomor/badge kecil |
| `--color-paper` | `#FFFFFF` | **Usulan galeri:** kertas polaroid, mengikuti bingkai putih foto referensi |
| `--color-paper-text` | `#202124` | **Usulan galeri:** label pendek pada bagian putih |
| `--color-grid` | `rgba(255,255,255,.06)` | **Usulan galeri:** garis kotak yang samar |
| `--color-string` | `rgba(255,255,255,.28)` | **Usulan galeri:** tali gantungan |

Warna tambahan yang terukur pada halaman tabel: **#161618**, **#232326**, **#E6E6E6**, **#F5F5F5**, dan **#F2F2F2**. Warna tabel terang hanya berlaku pada halaman List GSA referensi. Merah/kuning/hijau Google dipertahankan pada logo, ilustrasi, dan confetti sebagai aksen aset.

Gunakan token semantik tersebut untuk seluruh komponen. Mengganti stylesheet saja tidak cukup: utility `bg-white`, `text-slate-*`, `border-sky-*`, dan class yang dirangkai JavaScript juga harus ditangani agar tidak ada komponen tema lama yang tertinggal.

### 5.2 Tipografi

| Elemen | Referensi desktop yang terukur | Rencana responsive |
| --- | --- | --- |
| Hero headline | Google Sans Flex, 80 px / 80 px, 600, tracking -3.8 px, uppercase | Desktop 64–80 px; mobile sekitar 32–40 px; ukuran final diuji agar kata tidak pecah dan CTA tetap terlihat |
| Hero tagline | Google Sans Flex, 32 px / 38.4 px, 500 | Mobile 20–24 px |
| Hero body | Google Sans Flex, 24 px / 28.8 px, 400; max-width sekitar 600 px | Mobile 16–18 px |
| Section heading | Google Sans Flex, 46 px / 50.6 px, 500; heading kriteria 50/60 px | Tablet sekitar 36 px, mobile 28–32 px |
| Panel heading | Google Sans Flex, 24 px / 32 px, 500 | Mobile 20–22 px |
| Body panjang | Google Sans Flex, 16 px; line-height 25.6–30 px | Minimal 16 px untuk deskripsi utama modal/panel |
| Judul kartu kriteria | Inter, 16 px / 19.2 px, 700 | Sama atau 16–18 px sesuai ruang |
| Deskripsi kartu kriteria | Google Sans Flex, 13 px / 18.2 px | Jangan dipakai untuk paragraf utama galeri/modal |
| FAQ | Inter, 16 px / 24 px, 600 | 16 px; wrap normal |
| Navbar desktop | Google Sans Flex, 12 px / 24 px, 500 | Menu mobile 16 px atau lebih dengan target sentuh cukup |
| Caption polaroid | **Usulan:** Google Sans Flex, 13–14 px | Satu label pendek opsional; tidak menambah font handwriting baru |

Font utama diverifikasi dari computed style dan font yang benar-benar dimuat. Sumber referensi menggunakan font Google Sans Flex dari `fonts.gstatic.com`; satu heading benefit menggunakan Google Sans 500. Saat implementasi, ambil font dari distribusi resminya, gunakan weight yang diperlukan dan `font-display: swap`, lalu periksa layout setelah font selesai dimuat. Hapus tiga family lama bila tidak lagi digunakan.

### 5.3 Spacing, ukuran, dan lapisan

- Container besar: **1200 px**; navbar desktop **1000 px**; panel baca **750–800 px**; kelompok kartu kriteria sekitar **700 px**.
- Section gap/padding: rujukan **80–120 px** pada desktop; target mobile sekitar **64–88 px** dengan penyesuaian khusus hero.
- Gutter: desktop 32–64 px, mobile 20–24 px.
- Radius: panel 24 px, kartu 20 px, media 16 px, badge 4–8 px, pil 999 px.
- Polaroid memakai sudut kertas hampir siku, sekitar 2–4 px; ini pengecualian yang disengaja agar terlihat seperti foto cetak, bukan kartu aplikasi.
- Navbar shadow mengacu pada `0 10px 30px rgba(0,0,0,.32)`.
- Z-index rencana: background 0, konten 1, polaroid hover 2 dalam section, navbar 30, menu 40, lightbox 50, confetti 60. Hindari nilai `99999` tanpa kebutuhan.

## 6. Susunan halaman hasil redesign

Urutan yang akan diterapkan:

1. **Navbar pil mengambang**: identitas GSA, anchor perjalanan, rewind, galeri, cerita, dan informasi penggunaan arsip.
2. **Hero biru ke hitam**: judul besar GSA 2026 Batch 2; konteks inaugurasi tetap jelas; tagline singkat dan satu CTA menuju perjalanan/galeri.
3. **Ringkasan arsip**: angka aktual dari data dan konteks acara secara ringkas, di luar hero.
4. **Lima kartu chapter**: foto representatif tiap lokasi dengan pola kartu kriteria referensi.
5. **Cerita perjalanan**: indikator chapter di kiri dan panel besar di kanan; foto dan cerita dari data yang sudah ada.
6. **Rewind**: satu video unggulan; gunakan video lokal yang sesuai, bukan otomatis mengganti dengan video rekrutmen resmi.
7. **Galeri polaroid gantung**: latar grid fading, search/filter, foto/video dengan deskripsi saat dibuka.
8. **Candidate Journey dan prestasi Steven**: panel gelap, poster asli, teks yang sudah ada, kredit dan ID tetap tersedia.
9. **Informasi arsip/FAQ ringkas**: cara membuka foto/video, filter dan pencarian, jika dibutuhkan untuk menggantikan paragraf instruksi yang tersebar.
10. **Footer minimal**: kredit Steven dan tautan sumber/referensi yang relevan.

Judul dan copy pendek dapat disesuaikan agar muat dalam komposisi. Narasi lengkap dipindah ke panel cerita/modal, bukan dihapus. Link/ID yang sudah dipakai JavaScript tetap dipertahankan atau dimigrasikan serentak dengan seluruh pemanggilnya.

## 7. Spesifikasi khusus galeri polaroid gantung

Bagian ini adalah arahan eksplisit pengguna dan menjadi komponen pembeda utama hasil redesign.

### 7.1 Background kotak-kotak yang fading

- Dasar section tetap hitam, menyatu dengan homepage.
- Buat grid kotak dari dua `linear-gradient` tipis. Ukuran awal kotak **48–64 px desktop** dan **32–40 px mobile**.
- Garis grid memakai putih ber-opacity rendah, sekitar **4–8%**; bukan kotak solid yang mengalahkan foto.
- Fade grid menggunakan mask gradient: paling terbaca di tengah area galeri, memudar ke kiri/kanan serta awal/akhir section.
- Mask hanya mengenai layer grid; foto, caption, filter, dan tombol tidak ikut memudar.
- Layer dekoratif `pointer-events: none` dan tidak masuk urutan fokus/screen reader.
- Jika mask tidak didukung, tampilkan grid tipis biasa. Galeri tetap dapat digunakan.

### 7.2 Struktur foto yang benar-benar terasa digantung

- Tiap item memiliki titik gantung kecil, tali vertikal tipis, penjepit/pin, dan bingkai polaroid.
- Titik gantung diletakkan pada/di dekat perpotongan grid. Tali berakhir di tengah sisi atas foto sehingga ada hubungan visual dengan background.
- Panjang awal tali **32–64 px**; variasi antaritem terbatas agar terlihat natural tanpa bertabrakan.
- Polaroid memiliki kertas putih, padding sekitar **10–14 px** pada atas/samping, dan bagian bawah lebih tebal sekitar **32–44 px**.
- Ukuran awal foto cetak sekitar **260–320 px** lebar; area foto mendekati persegi. Crop thumbnail diperiksa satu per satu agar wajah/momen penting tidak terpotong.
- Foto potret/landscape asli tetap terlihat utuh saat dibuka di lightbox melalui `object-fit: contain`.
- Kemiringan dasar berbeda secara terukur per item, sekitar **-3° sampai +3°**; gunakan pola deterministik dari urutan/ID, bukan random baru setiap render.
- Variasi tinggi antaritem sekitar **12–24 px**, dengan ruang tambahan untuk tali dan rotasi. Tidak menggunakan posisi absolut seluruh galeri.
- Desktop: tiga kolom yang lega. Tablet: dua kolom. Mobile: satu kolom terpusat agar detail foto tetap terbaca.
- Tata letak mempertahankan urutan data dan urutan fokus yang masuk akal.

### 7.3 Isi polaroid sebelum diklik

- Wajah depan mengutamakan foto. Satu label pendek seperti judul singkat/tanggal boleh berada di bagian kertas bawah bila membantu pengenalan.
- **Tidak menampilkan paragraf deskripsi, daftar tag, lokasi panjang, atau tombol Lihat Detail di setiap polaroid.**
- Video menggunakan poster yang sudah ada, ditambah ikon play kecil yang jelas. Preview grid tidak autoplay.
- Judul lengkap tetap menjadi accessible name untuk kontrol pembuka, meskipun caption visual dipersingkat.
- Hover/focus boleh menaikkan foto sedikit dan membuat bingkai lebih tegas; tidak membalik kartu untuk menampilkan deskripsi.

### 7.4 Goyangan saat scroll

- Titik putar berada di **atas-tengah gantungan**, sehingga foto berayun seperti benda yang ditahan tali, bukan berputar dari pusat gambar.
- Pisahkan wrapper: `polaroid-anchor` untuk layout, `polaroid-swing` untuk ayunan, `polaroid-paper` untuk hover/focus. Transform tidak saling menimpa.
- Rencana utama memakai **CSS scroll-driven animation** yang menghubungkan progress scroll/view dengan rotasi kecil. Amplitudo tambahan sekitar **1–2.5°**, offset vertikal maksimal beberapa piksel.
- Fase ayunan antaritem sedikit berbeda. Tidak ada gerakan ekstrem, parallax besar, atau loop terus-menerus saat pengguna diam.
- Saat scroll berhenti, progress animasi berhenti. Ayunan berbasis progress ini bukan simulasi fisika kecepatan scroll; tidak menambah physics engine hanya untuk efek tersebut.
- Periksa `@supports (animation-timeline: view())`. Bila tidak tersedia, gunakan `IntersectionObserver` untuk ayunan pendek saat item masuk viewport, lalu kembali ke kemiringan dasar.
- Fallback masuk-viewport sekitar **500–800 ms**, mereda secara halus. Observer dibersihkan saat daftar galeri dirender ulang.
- `prefers-reduced-motion: reduce`: hapus goyangan, transisi perpindahan, dan auto-motion; tetap tampilkan komposisi polaroid statis yang dapat diklik.
- Motion hanya memengaruhi `transform`/`opacity`, tidak menghitung ulang ukuran grid pada setiap frame.

CSS scroll-driven animation merupakan peningkatan bertahap, sebab dukungannya belum merata di seluruh browser menurut [dokumentasi MDN animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline). Konsep timeline mengikuti [CSS Scroll-driven Animations](https://drafts.csswg.org/scroll-animations-1/), yang masih merupakan spesifikasi dalam pengembangan.

### 7.5 Perilaku ketika polaroid diklik

1. Buka viewer/lightbox yang sudah ada dengan tampilan gelap baru.
2. Tampilkan foto utuh atau video dengan kontrol playback.
3. Tampilkan judul, lokasi/tanggal yang tersedia, serta **deskripsi hanya jika nilainya ada dan tidak kosong**.
4. Jika deskripsi tidak tersedia, sembunyikan seluruh area deskripsi beserta jaraknya; jangan tampilkan placeholder atau tulisan Deskripsi tidak tersedia.
5. Navigasi sebelumnya/berikutnya mengikuti hasil filter saat itu, bukan seluruh dataset tanpa konteks.
6. Escape, tombol tutup, dan klik backdrop menutup viewer; fokus kembali ke polaroid pembuka. Panah keyboard tetap berfungsi.
7. Saat berpindah item, perbarui deskripsi secara kondisional supaya deskripsi item sebelumnya tidak tertinggal pada item yang kosong.

### 7.6 Search, filter, dan state galeri

- Pencarian dan prompt chips dipindah ke area galeri, menggunakan panel gelap dan border halus.
- Filter tetap mempertahankan kategori yang sudah ada; bonus `candidate` tetap dapat ditemukan.
- Filter aktif memakai aksen biru yang sama dengan sistem referensi; filter lain netral dan terbaca.
- Ganti class hardcoded di `applyFilterAndSearch()` dengan state class/atribut seperti `.is-active` atau `aria-pressed` agar styling tidak tersebar di JavaScript.
- Hitungan total/video di label dan statistik dihasilkan dari `MEMORIES_DATA`.
- State yang dirancang: semua item, satu kategori, video saja, pencarian aktif, nol hasil, media gagal dimuat, dan fokus keyboard.
- Reset filter mengembalikan koleksi tanpa menggandakan observer/motion handler.
- Grid/tali tidak ikut menjadi hasil pencarian; hanya polaroid konten yang berubah.

## 8. Rencana perubahan komponen lainnya

| Komponen | Perubahan konkret |
| --- | --- |
| Announcement bar | Pindahkan kredit/ID ke footer atau area cerita agar navbar dan hero memiliki komposisi seperti referensi |
| Logo/header | Susun lockup horizontal dengan proporsi referensi; gunakan aset GSA yang benar ketika tersedia; jangan mengandalkan logo G dalam kotak sebagai satu-satunya identitas |
| Navbar desktop | Maksimum sekitar 1000 px; posisi mengambang; kapsul terang; link singkat satu baris; jarak aman terhadap headline |
| Menu mobile | Tombol semantik dengan `aria-expanded`; panel tetap di dalam viewport; seluruh link terlihat/dapat di-scroll; tutup melalui Escape atau setelah memilih anchor |
| Hero | Ganti gradient text menjadi putih; hapus radial aurora global; background gradasi satu arah biru-hitam; pertahankan konteks inaugurasi |
| Ornamen hero | Gunakan objek visual berkualitas dengan posisi yang tidak menabrak teks; dekorasi `aria-hidden`; versi mobile lebih sedikit dan lebih kecil |
| Metrik | Pindahkan keluar hero; data aktual 28 media/9 video/lima chapter utama; jangan membuat angka dekoratif baru |
| Chapter cards | Foto asli sebagai visual; panel gelap, 3+2 pada desktop, satu kolom mobile; klik tetap memfilter/menavigasi ke galeri |
| Panel cerita | Pakai proporsi indikator kiri + foto/teks kanan seperti benefit; sticky hanya di desktop ketika ruang cukup; mobile susunan normal |
| Rewind | Player atas permintaan dengan poster; video lokal dipilih dari konten yang ada; stop saat viewer ditutup |
| Highlight Steven | Poster asli tetap ada, panel menjadi gelap, typography disamakan, badge disederhanakan |
| FAQ/informasi | Gunakan pola accordion referensi; pilih `<details>/<summary>` bila cukup; isi berdasarkan fitur arsip, bukan syarat pendaftaran yang tidak terkait |
| Lightbox | Surface #202124/#1F1F1F, teks putih, tombol netral, panel detail bersyarat, media utuh; pastikan area detail dapat di-scroll pada layar pendek |
| Audio | Pertahankan opt-in, default off; pindah ke utilitas yang tidak mengganggu navbar; tambahkan state tombol yang terbaca |
| Confetti | Pertahankan sebagai aksi pengguna; warna Google, lapisan wajar, hormati reduced motion |
| Footer | Hitam, kredit Steven dan ID tetap tersedia, teks netral terang; logo/link tidak mengulang semua elemen hero |
| Favicon/metadata | Favicon yang ada tetap valid; title dan description tetap menjelaskan arsip inaugurasi; siapkan OG image dari foto yang sudah ada jika diperlukan |

## 9. Inventaris aset referensi dan strategi pemakaian

URL berikut ditemukan langsung pada DOM referensi. Daftar ini adalah catatan sumber aset, bukan bukti bahwa file sudah disalin ke repo.

| Aset | Sumber yang diamati | Pemakaian yang direncanakan |
| --- | --- | --- |
| Logo horizontal GSA | [Logo GSA](https://framerusercontent.com/images/P29GU6bUvi5ZzRaTWA2HGUQdI.png) | Acuan lockup header; pilih aset resmi yang sesuai untuk implementasi |
| Lampu/objek hero | [Objek lampu](https://framerusercontent.com/images/7B3uIdbq5RZt7UorPrJphW32s.png) | Ornamen hero |
| Kurung/sparkle hero | [Objek kurung](https://framerusercontent.com/images/Grg1qOpV5LyoFECyqSQvxT80z70.png) | Ornamen hero |
| Background kartu biru | [Background kartu](https://framerusercontent.com/images/9LFbWFgOKBzVLIGqwLQuHDb51RM.png) | Acuan bidang biru dalam kartu chapter |
| Objek AI | [Objek AI](https://framerusercontent.com/images/9YUDrlZTvUSlcv27EiiTsAsKwA.png) | Acuan gaya objek 3D |
| Gembok kreatif | [Gembok](https://framerusercontent.com/images/RE7kHNN2k9es1O1CkSs3g3upGRM.png) | Acuan bahasa ilustrasi |
| Megafon | [Megafon](https://framerusercontent.com/images/G9mlvEwYYSyq4UnHpLgUEnKa3gc.png) | Acuan bahasa ilustrasi |
| Sparkle | [Sparkle](https://framerusercontent.com/images/qLftIOEBRNGOvEjlrhbre6E9D4.png) | Dekorasi terbatas |
| Gantungan kunci | [Gantungan kunci](https://framerusercontent.com/images/NazwEDYRwHUMB8CZOqfYJU4mTBI.png) | Acuan bahasa ilustrasi |
| Background visual benefit | [Background benefit](https://framerusercontent.com/images/lgfV0YX4DB5VprXIdc3HZYijfZw.png) | Acuan panel visual, bukan background seluruh halaman |
| Video rewind referensi | [Video GSA](https://www.youtube.com/watch?v=ROV3PGU8RJc) | Acuan interaksi thumbnail/play; isi utama repo tetap video lokal |

Prioritaskan foto, poster, dan video yang sudah ada. Gantungan, grid, bingkai kertas, dan shadow dibuat dengan CSS sehingga tidak memerlukan gambar baru atau library visual tambahan. Untuk aset baru yang benar-benar dipakai, simpan versi teroptimasi dengan nama jelas, catat sumbernya, dan tetapkan width/height agar layout stabil. Font memakai sumber/distribusi resmi, bukan font placeholder dari Framer.

## 10. Rencana teknis per file

### `index.html`

- Ubah root/body dari kelas tema terang menjadi token tema target.
- Rapikan konfigurasi warna inline agar tidak bertentangan dengan token CSS.
- Ganti header, komposisi hero, dan urutan section sesuai bagian 6.
- Pertahankan ID penting: `gallerySection`, `galleryGrid`, `geminiSearchInput`, `promptChips`, `aiResponseBox`, `aiResponseText`, dan seluruh ID kontrol lightbox/audio/confetti, kecuali seluruh referensinya dimigrasi bersama.
- Pertahankan `.filter-btn`, `data-filter`, `.chapter-timeline-card`, dan `data-category` agar alur yang ada tetap bekerja.
- Tambah struktur/kelas semantik untuk navbar, background galeri, gantungan, dan viewer.
- Pastikan satu H1 yang logis; urutan H2/H3 mengikuti section. Tidak meniru H6 hero referensi hanya karena ukuran visualnya besar.

### `assets/css/style.css`

- Ganti import font dan fondasi warna.
- Ganti glass biru muda, aurora fixed, gradient text, scrollbar, dan warna hover lama.
- Definisikan komponen: navbar, hero, chapter, story-panel, search/filter, polaroid, fading-grid, viewer, accordion, footer.
- Pisahkan transform swing dari transform hover.
- Tambah responsive sesuai breakpoint referensi dengan penyesuaian layar kecil.
- Tambah `prefers-reduced-motion`, `focus-visible`, fallback mask/timeline, dan aturan touch.
- Letakkan dekorasi di section galeri, bukan overlay fixed seluruh situs.

### `assets/js/app.js`

- `renderGallery()`: hasilkan polaroid/gantungan dan kontrol pembuka semantik, tanpa deskripsi pada kartu depan.
- `applyFilterAndSearch()`: pertahankan logika kategori/query; styling aktif menggunakan class/atribut semantik.
- `initPromptChips()` / `showAiResponse()`: sesuaikan tampilan dan lokasi; tetap jelaskan sebagai pencarian/simulasi lokal, bukan menambah API AI.
- `openLightbox()`: tampilkan media dan metadata; deskripsi kondisional; perbarui state kosong saat pindah item.
- `closeLightbox()`: hentikan video, pulihkan scroll/fokus, bersihkan state yang perlu dibersihkan.
- `prevMedia()` / `nextMedia()`: tetap memakai `currentFilteredList`.
- Tambah inisialisasi ayunan fallback yang kecil dan dapat dibersihkan setelah rerender galeri.
- Hitung statistik dari data; pertahankan audio/confetti dan perbaiki class tema yang masih disuntikkan JS.
- Semua teks dari input/data ditempatkan sebagai text node bila tidak membutuhkan HTML, agar template UI tidak mencampur input pengguna dengan markup.

### `assets/js/data.js`, aset, dan dokumentasi

- Pertahankan ID, src, fallbackSrc, poster, type, category, chapter, title, location, date, tags, dan narasi yang ada.
- `description` diperlakukan sebagai opsional oleh UI meskipun entri yang sekarang memilikinya.
- Tambah field presentasi seperti focal point atau pilihan highlight hanya jika diperlukan setelah memeriksa crop aktual.
- Update README setelah UI selesai. Tidak melakukan migrasi framework, routing, backend, database, atau pipeline build hanya untuk redesign ini.

## 11. Responsive dan aksesibilitas

| Rentang | Rencana |
| --- | --- |
| ≥1200 px | Navbar desktop; hero besar; chapter 3+2; panel cerita dua kolom; polaroid tiga kolom |
| 810–1199 px | Navbar beralih ke menu ringkas bila link tidak muat; panel cerita disederhanakan; polaroid dua kolom |
| ≤809 px | Hamburger; section satu kolom; padding 20–24 px; hero memakai ukuran mobile yang aman; polaroid satu kolom |
| 320–390 px | Tidak memecah kata AMBASSADOR; label pendek; filter dapat di-scroll horizontal di dalam area sendiri; foto dan gantungan tidak keluar layar |
| Layar pendek/zoom | Hero boleh bertambah tinggi secara natural; viewer memiliki area scroll; CTA dan tombol tutup tetap dapat dijangkau |

- Uji minimum di 320, 390, 768, 810, 1024, 1366, dan 1440 px; jangan hanya menguji tiga breakpoint nominal.
- Gunakan `min-height` yang aman untuk viewport mobile, bukan tinggi hero tetap yang memotong teks.
- Rotasi polaroid tidak boleh menutupi tetangga, membuat scrollbar horizontal, atau mengubah urutan baca.
- Target sentuh tombol/menu minimal sekitar 44 × 44 px walaupun ikon/teks visual lebih kecil.
- Polaroid dapat dibuka dengan Tab lalu Enter/Space. Focus ring terlihat di atas kertas putih maupun background hitam.
- Viewer memiliki nama yang jelas, semantik dialog, fokus awal, penahanan fokus di dalam modal, Escape, dan pengembalian fokus.
- Kontrol ikon memiliki accessible label; dekorasi tali/pin/grid diabaikan screen reader.
- Untuk teks normal targetkan kontras minimal 4.5:1; elemen besar/komponen relevan diperiksa sesuai kebutuhannya.
- Reduced motion harus diuji pada menu, hero, polaroid, typewriter, confetti, dan smooth scrolling.
- Ketika media gagal dimuat, sediakan status dan aksi yang tetap bisa dipakai; bukan tile kosong.

## 12. Urutan implementasi dan hasil tiap tahap

### Tahap 0: Audit dan spesifikasi

- [x] Inspeksi visual homepage referensi dan ketiga halaman pendukung.
- [x] Ukur palette, font, komponen, breakpoint, dan interaksi utama.
- [x] Jalankan serta periksa repo lokal dan data aktualnya.
- [x] Masukkan arahan galeri polaroid gantung ke spesifikasi.
- [x] Tulis PLAN.md.

### Tahap 1: Fondasi visual dan kerangka halaman (P0)

- [x] Terapkan token warna/font/spacing/radius baru.
- [x] Hapus background aurora dan styling terang yang bertabrakan.
- [x] Susun ulang section tanpa menghapus media/narasi.
- [x] Bangun navbar desktop/mobile dan hero baru.

Hasil: silhouette halaman, warna, tipografi, dan hero sudah selaras dengan referensi pada desktop serta mobile.

### Tahap 2: Galeri polaroid gantung (P0)

- [x] Ganti renderer kartu menjadi polaroid dengan titik gantung, tali, dan penjepit.
- [x] Tambahkan background kotak fading di belakangnya.
- [x] Tata 3/2/1 kolom dan variasi kemiringan yang stabil.
- [x] Pindahkan search/filter ke area galeri dan hitung angka media secara dinamis.
- [x] Implementasikan ayunan terkait scroll, fallback, dan reduced motion.
- [x] Sembunyikan deskripsi pada sisi depan; tampilkan secara kondisional di viewer.

Hasil: konsep visual yang diminta pengguna sudah dapat dipakai dengan seluruh data galeri.

### Tahap 3: Viewer dan komponen cerita (P0/P1)

- [x] Restyle viewer ke tema gelap dan lengkapi fokus/keyboard.
- [x] Bangun chapter cards, panel cerita, dan rewind memakai foto/video asli.
- [x] Restyle highlight Steven, utilitas audio/confetti, serta footer.
- [x] Tambahkan informasi penggunaan dalam accordion jika dibutuhkan, tanpa menduplikasi narasi.

Hasil: seluruh section dan state interaktif memakai bahasa visual yang konsisten.

### Tahap 4: Penyelarasan visual dan verifikasi (P0)

- [ ] Cocokkan screenshot referensi dan hasil pada viewport yang sama.
- [ ] Periksa crop foto, skala ornamen, panjang tali, fade grid, amplitudo ayunan, dan jarak antarpolaroid.
- [ ] Periksa semua filter/search/viewer serta perilaku keyboard dan reduced motion.
- [ ] Periksa media gagal, data tanpa deskripsi, dan query tanpa hasil.
- [ ] Periksa seluruh halaman hingga footer agar tidak ada class tema lama yang tertinggal.
- [ ] Update README dan ringkas hasil verifikasi yang benar-benar dijalankan.

Hasil: perubahan siap ditinjau dengan bukti desktop/mobile dan catatan keterbatasan yang nyata.

## 13. Kriteria selesai dan skenario pengecekan

### Keselarasan visual

- [ ] Homepage didominasi hitam dengan hero #3186FF ke hitam, bukan background sky/aurora.
- [ ] Google Sans Flex dan hierarchy heading/body sesuai spesifikasi.
- [ ] Navbar kapsul, panel gelap, spacing, radius, serta penempatan ilustrasi terasa satu sistem dengan referensi.
- [ ] Semua section sudah ditinjau, termasuk empty state, viewer, filter aktif, menu terbuka, dan footer.
- [ ] Bagian galeri mengikuti arahan polaroid secara jelas: kertas putih, gantungan terlihat, background kotak fading, ayunan kecil saat scroll.

### Data dan interaksi

- [ ] Semua **28 entri** tetap dapat ditemukan, termasuk kategori bonus.
- [ ] Filter video menghasilkan **9 video** pada baseline data sekarang; angka UI mengikuti data.
- [ ] Klik chapter memfilter kategori yang benar; perpindahan tab menghapus query sesuai perilaku yang sudah ada.
- [ ] Pencarian kosong, tanpa hasil, dan reset bekerja tanpa meninggalkan duplikat listener/observer.
- [ ] Sebelum diklik tidak ada paragraf deskripsi di polaroid.
- [ ] Setelah diklik, item dengan deskripsi menampilkannya; item tanpa deskripsi tidak menyisakan panel/jarak kosong.
- [ ] Next/prev tidak membawa deskripsi item sebelumnya ke item yang kosong.
- [ ] Foto potret/landscape terlihat utuh di viewer; video dapat diputar/dihentikan dan berhenti saat ditutup.
- [ ] Escape, ArrowLeft/Right, close/backdrop, fokus modal, dan pengembalian fokus bekerja.

### Responsive, motion, dan kualitas teknis

- [ ] Tidak ada teks bertumpuk atau overflow halaman pada 320–1440 px.
- [ ] Hero dan menu mobile memperbaiki masalah yang ditemukan pada referensi.
- [ ] Polaroid tidak bertabrakan saat berayun, hover, focus, dan rerender filter.
- [ ] Reduced motion menghasilkan galeri statis yang tetap rapi dan dapat dioperasikan.
- [ ] Browser tanpa animation-timeline tetap memiliki galeri berfungsi melalui fallback.
- [ ] Grid dekoratif tidak memudarkan foto dan tidak menghalangi klik.
- [ ] Tidak ada console error/media path rusak yang diperkenalkan perubahan.
- [ ] Gambar mempunyai ruang/aspect ratio yang dipesan; media bawah halaman lazy-loaded; video tidak seluruhnya dimuat pada awal kunjungan.
- [ ] Periksa Lighthouse setelah implementasi; target acuan LCP <2.5 s, CLS <0.1, INP <200 ms. Nilai tersebut adalah target, belum hasil pengukuran redesign.

Validasi memakai browser dan pengecekan kecil yang relevan. Tidak menambahkan framework test atau dependency animasi besar hanya untuk perubahan visual ini.

## 14. Keputusan implementasi yang sudah ditetapkan

1. Pertahankan HTML/CSS/JavaScript statis dan alur deploy saat ini.
2. Gunakan referensi aktual sebagai sumber warna/layout, dengan pengecualian galeri polaroid sesuai arahan pengguna.
3. Pertahankan data dan fungsi arsip; adaptasikan panel recruitment menjadi panel cerita yang relevan.
4. Pertahankan seluruh media asli; hasil crop thumbnail diverifikasi secara visual.
5. Gunakan CSS untuk kertas, tali, pin sederhana, grid fading, dan motion utama; JavaScript kecil untuk fallback dan state viewer.
6. Deskripsi hanya berada dalam detail setelah interaksi, dan sepenuhnya opsional.
7. Ikuti identitas visual referensi sambil memperbaiki masalah mobile yang terbukti saat audit.
8. Implementasi dilanjutkan atas instruksi pengguna. Setiap tahap memperbarui dokumen ini dan dibuatkan commit lokal. **Jangan push atau deploy.**

## 15. Catatan implementasi

### 31 Oktober 2026: fondasi aset

- [x] Simpan logo horizontal dan tiga ornamen referensi di `assets/brand/` beserta sumbernya.
- [x] Siapkan Google Sans Flex dan Inter sebagai WOFF2 Latin lokal, tanpa font CDN saat runtime.
- [x] Verifikasi file font memakai signature WOFF2 dan seluruh unduhan aset berhasil.
- Berikutnya: bangun halaman gelap dan galeri polaroid, lalu validasi melalui browser.


### 31 Oktober 2026: halaman dan galeri terhubung

- [x] Terapkan tema biru-hitam, navbar pil, hero, chapter, panel cerita, rewind, highlight Steven, FAQ, dan footer.
- [x] Ganti kartu menjadi polaroid gantung dengan tali, penjepit, grid fading, dan ayunan scroll.
- [x] Hubungkan seluruh 28 media, enam kategori, pencarian/prompt, serta statistik dinamis (19 foto, 9 video).
- [x] Gunakan native dialog untuk viewer gelap dan deskripsi kondisional; pertahankan panah, Escape, audio opt-in, dan confetti.
- [x] Hilangkan dependency Tailwind CDN; font dan aset tampilan dilayani lokal.
- [x] Pemeriksaan awal: syntax JavaScript valid, halaman termuat tanpa console error, kedua font termuat, 28 polaroid dirender, desktop tidak overflow.
- [x] Preview tersedia di http://localhost:8000 untuk dipantau pengguna.
- Berikutnya: uji seluruh interaksi, viewport, reduced motion, fallback, dan perbaiki temuan sebelum commit verifikasi akhir.
