/**
 * Data Lengkap Kenangan Google Student Ambassador (GSA) Inauguration 2026 Batch 2
 * Dokumentasi Lengkap & Interpretasi Lokasi Kegiatan
 */

const MEMORIES_DATA = [
  // ================= CHAPTER 1: THE COMMUTE & DEPARTURE =================
  {
    id: "mrt-commute",
    title: "Commute Pagi Menuju Venue via MRT Jakarta",
    chapter: 1,
    chapterName: "The Journey Begins",
    category: "commute",
    type: "image",
    src: "assets/images/mrt-jakarta-commute.webp",
    fallbackSrc: "assets/images/mrt-jakarta-commute.jpg",
    location: "Gerbong MRT Jakarta (Rute Bundaran HI - Lebak Bulus)",
    date: "Oktober 2026",
    badge: "Commute Vibe",
    description: "Pagi yang penuh antusiasme! Berdesak-desakan di dalam gerbong MRT Jakarta bersama para delegasi. Semua membawa energi membara menuju momen inagurasi resmi Google Student Ambassador 2026.",
    tags: ["MRT Jakarta", "Commute", "Morning Rush", "Perjalanan"]
  },
  {
    id: "mrt-vlog",
    title: "Vlog Ceria di Dalam MRT Jakarta",
    chapter: 1,
    chapterName: "The Journey Begins",
    category: "commute",
    type: "video",
    src: "assets/videos/mrt-commute-vlog.mp4",
    poster: "assets/images/video-thumbs/mrt-commute-vlog.webp",
    location: "MRT Jakarta Jalur Layang",
    date: "Oktober 2026",
    badge: "Video Vlog",
    description: "Momen seru Steven dan teman-teman melambaikan tangan menyapa kamera di tengah ramainya gerbong MRT Jakarta. Senyum lebar sebelum resmi dilantik!",
    tags: ["Vlog", "MRT", "Delegates", "Squad"]
  },
  {
    id: "mrt-platform",
    title: "Squad Gathering di Peron Stasiun MRT",
    chapter: 1,
    chapterName: "The Journey Begins",
    category: "commute",
    type: "video",
    src: "assets/videos/mrt-station-squad.mp4",
    poster: "assets/images/video-thumbs/mrt-station-squad.webp",
    location: "Peron Stasiun MRT Jakarta",
    date: "Oktober 2026",
    badge: "Quick Snippet",
    description: "Detik-detik menunggu kedatangan kereta MRT di bawah atap melengkung stasiun layang. Obrolan hangat dan tawa mencairkan suasana pagi.",
    tags: ["MRT Station", "Gathering", "Transit"]
  },

  // ================= CHAPTER 2: THE INAUGURATION AT MGP SPACE =================
  {
    id: "gp-space-queue",
    title: "Antrean Kedatangan di MGP Space",
    chapter: 2,
    chapterName: "The Inauguration Ceremony",
    category: "inauguration",
    type: "video",
    src: "assets/videos/gp-space-arrival-queue.mp4",
    poster: "assets/images/video-thumbs/gp-space-arrival-queue.webp",
    location: "MGP Space, Jakarta",
    date: "Oktober 2026",
    badge: "Arrival",
    description: "Antrean rapi seluruh mahasiswa bertalenta dari berbagai kampus di Indonesia saat memasuki venue inagurasi MGP Space. Lambaian tangan ramah ke arah kamera menyambut hari bersejarah.",
    tags: ["MGP Space", "Arrival", "Queue", "Ambassadors"]
  },
  {
    id: "gp-space-almamater",
    title: "Bangga Membawa Almamater Kampus",
    chapter: 2,
    chapterName: "The Inauguration Ceremony",
    category: "inauguration",
    type: "image",
    src: "assets/images/gp-space-almamater-welcome.webp",
    fallbackSrc: "assets/images/gp-space-almamater-welcome.jpg",
    location: "Photobooth Entrance MGP Space, Jakarta",
    date: "Oktober 2026",
    badge: "Almamater Pride",
    description: "Foto bersama seluruh delegasi Google Student Ambassador 2026 Batch 2 mengenakan jas almamater universitas masing-masing di depan gate bertuliskan 'Google Student Ambassador Inauguration Event 2026'. Keberagaman talenta pemuda Indonesia!",
    tags: ["Jas Almamater", "MGP Space", "Bhinneka", "Batch 2"]
  },
  {
    id: "steven-stage",
    title: "Steven Erlinto di Panggung Utama Inagurasi",
    chapter: 2,
    chapterName: "The Inauguration Ceremony",
    category: "inauguration",
    type: "image",
    src: "assets/images/steven-stage-inauguration.webp",
    fallbackSrc: "assets/images/steven-stage-inauguration.jpg",
    location: "Main Stage Auditorium MGP Space",
    date: "Oktober 2026",
    badge: "Official Induction",
    description: "Steven Erlinto berpose bangga di atas panggung utama dengan latar belakang megah LED 'Selamat Datang Google Student Ambassador 2026 Inauguration Batch 2' bertabur lambang bintang Gemini dan logo Google.",
    tags: ["Steven Erlinto", "Main Stage", "Google Varsity", "Gemini"]
  },
  {
    id: "confetti-grand",
    title: "Momen Puncak: Hujan Confetti Inagurasi!",
    chapter: 2,
    chapterName: "The Inauguration Ceremony",
    category: "inauguration",
    type: "video",
    src: "assets/videos/grand-confetti-drop-celebration.mp4",
    poster: "assets/images/video-thumbs/grand-confetti-drop-celebration.webp",
    location: "Auditorium MGP Space",
    date: "Oktober 2026",
    badge: "Epic Highlight",
    description: "Klimaks pelantikan! Dentuman confetti berhamburan penuh warna menghujani seluruh auditorium. Sorak sorai ratusan GSA Batch 2 mengenakan varsity jacket merayakan awal perjalanan sebagai pemimpin AI masa depan.",
    tags: ["Confetti Drop", "Celebration", "Inauguration", "Highlight"]
  },
  {
    id: "auditorium-group-1",
    title: "Squad Selfie di Tengah Auditorium",
    chapter: 2,
    chapterName: "The Inauguration Ceremony",
    category: "inauguration",
    type: "image",
    src: "assets/images/auditorium-varsity-group-1.webp",
    fallbackSrc: "assets/images/auditorium-varsity-group-1.jpg",
    location: "Auditorium Hall MGP Space",
    date: "Oktober 2026",
    badge: "Varsity Squad",
    description: "Foto selfie bersama teman-teman seperjuangan dengan jaket varsity navy-putih kebanggaan berlogo Google 'G' warna-warni. Di belakang terlihat dekorasi panggung dan meja banquet prasmanan.",
    tags: ["Squad Selfie", "Varsity Jacket", "Hall", "TeamGoogle"]
  },
  {
    id: "auditorium-badges",
    title: "Show Your Badge of Honor!",
    chapter: 2,
    chapterName: "The Inauguration Ceremony",
    category: "inauguration",
    type: "image",
    src: "assets/images/auditorium-varsity-badges.webp",
    fallbackSrc: "assets/images/auditorium-varsity-badges.jpg",
    location: "Auditorium Hall MGP Space",
    date: "Oktober 2026",
    badge: "GSA ID Badge",
    description: "Semua memamerkan ID Card lanyard resmi Google Student Ambassador 2026 Batch 2 ke arah kamera dengan senyum bangga dan pose victory!",
    tags: ["ID Card", "Lanyard", "Batch 2", "Pride"]
  },
  {
    id: "auditorium-group-2",
    title: "Pose Candid & Kebersamaan Tak Tergantikan",
    chapter: 2,
    chapterName: "The Inauguration Ceremony",
    category: "inauguration",
    type: "image",
    src: "assets/images/auditorium-varsity-group-2.webp",
    fallbackSrc: "assets/images/auditorium-varsity-group-2.jpg",
    location: "Auditorium Hall MGP Space",
    date: "Oktober 2026",
    badge: "Candid Vibes",
    description: "Tawa lepas dan chemistry antar anggota yang makin erat. Menjadi bagian dari ekosistem Google AI bukan hanya soal teknologi, tapi persahabatan seumur hidup.",
    tags: ["Friendship", "Smiles", "Varsity", "Team"]
  },
  {
    id: "stage-countdown",
    title: "Suasana Sorak Penonton & Hitung Mundur",
    chapter: 2,
    chapterName: "The Inauguration Ceremony",
    category: "inauguration",
    type: "video",
    src: "assets/videos/stage-countdown-moment.mp4",
    poster: "assets/images/video-thumbs/stage-countdown-moment.webp",
    location: "Auditorium MGP Space",
    date: "Oktober 2026",
    badge: "Crowd Energy",
    description: "Antusiasme penonton di bangku auditorium mengangkat ponsel mereka merekam panggung utama saat seremoni peresmian berlangsung.",
    tags: ["Audience", "Excitement", "Stage Recording"]
  },
  {
    id: "auditorium-cheers",
    title: "Tepuk Tangan & Gemuruh Inagurasi",
    chapter: 2,
    chapterName: "The Inauguration Ceremony",
    category: "inauguration",
    type: "video",
    src: "assets/videos/auditorium-hall-cheers.mp4",
    poster: "assets/images/video-thumbs/auditorium-hall-cheers.webp",
    location: "Auditorium MGP Space",
    date: "Oktober 2026",
    badge: "Hall Atmosphere",
    description: "Riuh gemuruh tepuk tangan dan tawa bahagia dari para duta mahasiswa se-Indonesia yang saling menyemangati.",
    tags: ["Cheers", "Auditorium", "Atmosphere"]
  },
  {
    id: "kopi-papa-mojo",
    title: "Chit-chat Santai di Food Truck Papa Mojo",
    chapter: 2,
    chapterName: "The Inauguration Ceremony",
    category: "inauguration",
    type: "video",
    src: "assets/videos/kopi-papa-mojo-interview.mp4",
    poster: "assets/images/video-thumbs/kopi-papa-mojo-interview.webp",
    location: "Outdoor Courtyard Kopi Papa Mojo",
    date: "Oktober 2026",
    badge: "Coffee Break",
    description: "Interviu santai dan ngobrol akrab bersama sesama ambassador di depan food truck orange 'Kopi Papa Mojo' sambil menikmati udara luar venue.",
    tags: ["Kopi Papa Mojo", "Coffee Break", "Interview", "Chill"]
  },

  // ================= CHAPTER 3: GOOGLE INDONESIA OFFICE TOUR =================
  {
    id: "google-office-wall",
    title: "Dinding 3D Logo Google & Sentuhan Tradisional",
    chapter: 3,
    chapterName: "Google HQ Office Tour",
    category: "google-hq",
    type: "image",
    src: "assets/images/google-office-logo-wall.webp",
    fallbackSrc: "assets/images/google-office-logo-wall.jpg",
    location: "Google Indonesia HQ (Pacific Century Place, SCBD)",
    date: "Oktober 2026",
    badge: "Iconic Wall",
    description: "Dinding batu artistik dengan logo Google 3D yang disusun dari ribuan bunga dan ornamen batik khas nusantara di kantor pusat Google Indonesia.",
    tags: ["Google Indonesia", "SCBD", "Google Logo", "Batik 3D"]
  },
  {
    id: "steven-google-office",
    title: "Steven Erlinto di Kantor Google Indonesia",
    chapter: 3,
    chapterName: "Google HQ Office Tour",
    category: "google-hq",
    type: "image",
    src: "assets/images/steven-google-office-wall.webp",
    fallbackSrc: "assets/images/steven-google-office-wall.jpg",
    location: "Lobby Google Indonesia & Bangkit Showcase",
    date: "Oktober 2026",
    badge: "Dream Come True",
    description: "Steven Erlinto berdiri bangga di depan lambang Google Indonesia dan instalasi program 'Bangkit'. Langkah nyata dari impian kampus hingga melangkah di kantor raksasa teknologi dunia.",
    tags: ["Steven Erlinto", "Google Office", "Bangkit", "Inspiration"]
  },
  {
    id: "google-gbike",
    title: "Ikonik Google G-Bike & Mural Benang Pantai",
    chapter: 3,
    chapterName: "Google HQ Office Tour",
    category: "google-hq",
    type: "image",
    src: "assets/images/google-office-gbike.webp",
    fallbackSrc: "assets/images/google-office-gbike.jpg",
    location: "Google Indonesia Workspace SCBD",
    date: "Oktober 2026",
    badge: "Office Art",
    description: "Sepeda warna-warni khas Google (kuning, merah, hijau, biru) yang terparkir cantik di depan mural rajutan tali bermotif peselancar pantai dan matahari terbenam nusantara.",
    tags: ["Google Bike", "G-Bike", "Mural", "Artwork"]
  },
  {
    id: "google-hallway-walk",
    title: "Menyusuri Lorong Payung Tradisional Google",
    chapter: 3,
    chapterName: "Google HQ Office Tour",
    category: "google-hq",
    type: "video",
    src: "assets/videos/google-office-hallway-walk.mp4",
    poster: "assets/images/video-thumbs/google-office-hallway-walk.webp",
    location: "Lorong Google Indonesia HQ",
    date: "Oktober 2026",
    badge: "Office Walkthrough",
    description: "Video saat barisan GSA Batch 2 mengenakan jaket varsity menyusuri lorong kantor Google yang dihiasi gantungan payung tradisional warna kuning dan oranye yang estetik.",
    tags: ["Office Tour", "Lorong", "Payung Bali", "Ambassadors"]
  },
  {
    id: "google-microkitchen",
    title: "Tour Microkitchen & Pantry Google Indonesia",
    chapter: 3,
    chapterName: "Google HQ Office Tour",
    category: "google-hq",
    type: "image",
    src: "assets/images/google-office-microkitchen-tour.webp",
    fallbackSrc: "assets/images/google-office-microkitchen-tour.jpg",
    location: "Google Indonesia Microkitchen Area",
    date: "Oktober 2026",
    badge: "Microkitchen Tour",
    description: "Para ambassador berkumpul menyimak pemaparan tim Google di area pantry/microkitchen yang hangat dengan lampu gantung rotan dan aneka snack & kopi gratis khas budaya kerja Google.",
    tags: ["Microkitchen", "Pantry", "Google Culture", "Tour"]
  },

  // ================= CHAPTER 4: CULINARY & LITTLE TOKYO BLOK M =================
  {
    id: "blok-m-mirror",
    title: "Iconic Convex Mirror Selfie di Blok M",
    chapter: 4,
    chapterName: "Culinary & Blok M Hangout",
    category: "hangout",
    type: "image",
    src: "assets/images/blok-m-convex-mirror-selfie.webp",
    fallbackSrc: "assets/images/blok-m-convex-mirror-selfie.jpg",
    location: "Kawasan Little Tokyo Melawai, Blok M",
    date: "Oktober 2026",
    badge: "Must-Have Shot",
    description: "Momen wajib anak muda Jakarta! Berfoto beramai-ramai lewat cermin cembung jalan bertabur stiker 'Aman Yakiniku BBQ', 'Wagyu Ramen Blok M', dan mural Gunung Fuji. Vibes perkotaan yang estetik abis!",
    tags: ["Blok M", "Mirror Selfie", "Little Tokyo", "Melawai"]
  },
  {
    id: "ippudo-ramen",
    title: "Semangkuk Hangat Ramen IPPUDO Jakarta",
    chapter: 4,
    chapterName: "Culinary & Blok M Hangout",
    category: "hangout",
    type: "image",
    src: "assets/images/ippudo-ramen-lunch.webp",
    fallbackSrc: "assets/images/ippudo-ramen-lunch.jpg",
    location: "IPPUDO Ramen Jakarta",
    date: "Oktober 2026",
    badge: "Foodie Heaven",
    description: "Dua mangkok merah menyala berisi ramen autentik Akamaru Shinaji berkuah tonkotsu gurih dengan tamago lembut, irisan chashu lezat, nori garing, dan saus pedas aromatik.",
    tags: ["IPPUDO", "Ramen", "Kuliner", "Foodie"]
  },
  {
    id: "korean-ramen-pot",
    title: "Panci Emas Ramyeon Korea Bersama Sahabat",
    chapter: 4,
    chapterName: "Culinary & Blok M Hangout",
    category: "hangout",
    type: "image",
    src: "assets/images/korean-ramen-feast.webp",
    fallbackSrc: "assets/images/korean-ramen-feast.jpg",
    location: "Restoran Korea / Pocha Blok M",
    date: "Oktober 2026",
    badge: "Korean Food",
    description: "Menikmati mie ramyeon Korea panas langsung dari panci kuning tradisional (yang-eun naembi). Asyik berbagi cerita sambil makan siang bareng.",
    tags: ["Ramyeon", "Korean Resto", "Panci Kuning", "Lunch"]
  },
  {
    id: "korean-resto-squad",
    title: "Full Squad Feast: Senyum Kenyang & Bahagia",
    chapter: 4,
    chapterName: "Culinary & Blok M Hangout",
    category: "hangout",
    type: "image",
    src: "assets/images/korean-resto-full-squad.webp",
    fallbackSrc: "assets/images/korean-resto-full-squad.jpg",
    location: "Korean Resto Dining Room",
    date: "Oktober 2026",
    badge: "Squad Dinner",
    description: "Semua anggota duduk melingkar memadati meja restoran berornamen kayu tradisional. Momen di mana persahabatan terbentuk melampaui batas daerah asal kampus masing-masing.",
    tags: ["Squad Goals", "Dinner", "Togetherness", "Family"]
  },

  // ================= CHAPTER 5: NIGHT ADVENTURES & HOTEL MEMORIES =================
  {
    id: "rumah-hantu-1",
    title: "Uji Nyali di Rumah Hantu Jeruk Purut",
    chapter: 5,
    chapterName: "Night Thrills & Hotel Shenanigans",
    category: "nightlife",
    type: "image",
    src: "assets/images/rumah-hantu-jeruk-purut-1.webp",
    fallbackSrc: "assets/images/rumah-hantu-jeruk-purut-1.jpg",
    location: "Wahana Rumah Hantu Jeruk Purut",
    date: "Oktober 2026",
    badge: "Spooky Night",
    description: "Malam makin larut, saatnya uji adrenalin! Para cowok GSA menantang rasa takut di wahana horor legenda urban Jakarta 'Rumah Hantu Jeruk Purut' di bawah sorotan lampu merah menyeramkan.",
    tags: ["Rumah Hantu", "Jeruk Purut", "Adrenalin", "Horor"]
  },
  {
    id: "rumah-hantu-2",
    title: "Pose Kocak Anti Takut Pasca Jeritan",
    chapter: 5,
    chapterName: "Night Thrills & Hotel Shenanigans",
    category: "nightlife",
    type: "image",
    src: "assets/images/rumah-hantu-jeruk-purut-2.webp",
    fallbackSrc: "assets/images/rumah-hantu-jeruk-purut-2.jpg",
    location: "Gerbang Keluar Rumah Hantu Jeruk Purut",
    date: "Oktober 2026",
    badge: "Laugh Out Loud",
    description: "Pose konyol penuh kemenangan setelah berhasil selamat keluar dari wahana hantu tanpa pingsan. Wajah tegang bercampur tawa terbahak-bahak!",
    tags: ["Funny", "Poses", "Survivor", "Squad"]
  },
  {
    id: "midnight-parking",
    title: "Nongkrong Malam di Area Parkiran",
    chapter: 5,
    chapterName: "Night Thrills & Hotel Shenanigans",
    category: "nightlife",
    type: "video",
    src: "assets/videos/midnight-parking-hangout.mp4",
    poster: "assets/images/video-thumbs/midnight-parking-hangout.webp",
    location: "Parkiran Luar / Street Jakarta",
    date: "Oktober 2026",
    badge: "Night Owl",
    description: "Angin malam Jakarta menemani obrolan santai di samping deretan motor parkir. Momen-momen tanpa rencana yang justru paling membekas di ingatan.",
    tags: ["Night Walk", "Parkiran", "Hangout", "Midnight"]
  },
  {
    id: "hotel-uno-qris",
    title: "Turnamen UNO Tengah Malam & Taruhan Rp 30.000",
    chapter: 5,
    chapterName: "Night Thrills & Hotel Shenanigans",
    category: "nightlife",
    type: "image",
    src: "assets/images/hotel-uno-qris-night.webp",
    fallbackSrc: "assets/images/hotel-uno-qris-night.jpg",
    location: "Kamar Hotel Delegasi (Pukul 23:24 WIB)",
    date: "Oktober 2026",
    badge: "Legendary Game",
    description: "Pukul 23:24 malam di kamar hotel! Kartu UNO bertebaran di atas kasur putih lengkap dengan bukti transfer QRIS / e-wallet Rp 30.000 untuk sang juara. Rivalitas persahabatan paling sengit sepanjang malam!",
    tags: ["UNO", "Kamar Hotel", "QRIS Rp30rb", "23:24 WIB"]
  },

  // ================= SPECIAL: THE CANDIDATE JOURNEY & ACHIEVEMENTS =================
  {
    id: "steven-champion",
    title: "Prestasi Nasional: Juara 2 Cyber Security",
    chapter: 0,
    chapterName: "The Candidate Journey",
    category: "candidate",
    type: "image",
    src: "assets/images/steven-cyber-champion.webp",
    fallbackSrc: "assets/images/steven-cyber-champion.jpg",
    location: "Kompetisi Nasional Cyber Security",
    date: "2026",
    badge: "Champion",
    description: "Steven Erlinto dengan medali perak dan piala Juara 2 Nasional Cyber Security (hadiah Rp 3.000.000). Membawa kebanggaan almamater dan representasi duta teknologi Google.",
    tags: ["Juara 2", "Cyber Security", "Steven Erlinto", "Prestasi"]
  },
  {
    id: "candidate-poster",
    title: "The Genesis: Steven Erlinto GSA Candidate Poster",
    chapter: 0,
    chapterName: "The Candidate Journey",
    category: "candidate",
    type: "image",
    src: "assets/images/gsa-candidate-poster.webp",
    fallbackSrc: "assets/images/gsa-candidate-poster.jpg",
    location: "Poster Kampanye Resmi",
    date: "Awal Seleksi 2026",
    badge: "Origin Story",
    description: "'Ready to Become Your Next AI Leader' — Poster awal perjuangan Steven Erlinto saat mendaftar menjadi kandidat Google Student Ambassador Batch 2, yang kini telah resmi terwujud menjadi kenyataan!",
    tags: ["Steven Erlinto", "AI Leader", "Origin", "Poster"]
  }
];

// Interactive Prompt Chips for the Gemini Chat Bar
const GEMINI_QUICK_PROMPTS = [
  {
    text: "open top tour yuk 🚌",
    query: "tour",
    response: "Gaskeun naik bus wisata keliling Jakarta dengan atap terbuka! Angin sepoi-sepoi sambil nikmatin pemandangan gedung pencakar langit bareng squad GSA Batch 2!"
  },
  {
    text: "GI yokkk 🛍️",
    query: "gi",
    response: "Grand Indonesia selalu jadi destinasi favorit buat cuci mata, cari jajanan viral, atau sekadar keliling mall raksasa setelah lelah seharian inagurasi!"
  },
  {
    text: "PI Yokk ✨",
    query: "pi",
    response: "Plaza Indonesia vibes luxury! Nyebrang dikit dari GI, lanjut jalan santai dan foto-foto estetik bareng geng Google Ambassador!"
  },
  {
    text: "KFC atau Hokben? 🍗",
    query: "kuliner",
    response: "Perdebatan abadi anak nongkrong: crispy kulit ayam KFC yang gurih renyah atau paket bento & egg chicken roll Hokben yang legit? Apapun pilihannya, yang penting makannya bareng-bareng!"
  },
  {
    text: "Momen Hujan Confetti 🎉",
    query: "confetti",
    response: "Momen puncak seremoni inagurasi terjadi di panggung Auditorium MGP Space saat ratusan lembar confetti warna-warni ditembakkan! Sorak sorai membahana saat GSA Batch 2 resmi dilantik."
  },
  {
    text: "Di mana foto cermin cembung? 🪞",
    query: "cermin",
    response: "Foto cermin cembung diambil di kawasan Little Tokyo Melawai, Blok M! Cermin tersebut dihiasi banyak stiker ramen dan mural khas Jepang, tempat foto street selfie favorit anak muda Jakarta."
  },
  {
    text: "Kantor Google Indonesia 🏢",
    query: "google",
    response: "Delegasi mengunjungi langsung kantor pusat Google Indonesia di Pacific Century Place SCBD Jakarta! Melihat dinding logo 3D berhias batik bunga, Google G-Bike dengan mural peselancar, dan pantry microkitchen."
  },
  {
    text: "Taruhan UNO Rp 30.000 🃏",
    query: "uno",
    response: "Di kamar hotel tepat pukul 23:24 malam, para duta menggelar turnamen UNO sengit di atas kasur! Yang kalah langsung transfer via QRIS Rp 30.000 sebagai bukti pelunasan utang game!"
  },
  {
    text: "Siapa Steven Erlinto? 🎓",
    query: "steven",
    response: "Steven Erlinto adalah delegasi terpilih Google Student Ambassador 2026 Batch 2 dan Juara 2 Nasional Cyber Security dengan tagline perjuangan 'Ready to Become Your Next AI Leader'!"
  },
  {
    text: "Rumah Hantu Jeruk Purut 👻",
    query: "hantu",
    response: "Setelah inagurasi, para duta laki-laki menantang nyali mereka di wahana horor 'Rumah Hantu Jeruk Purut' di bawah sorotan lampu merah mencekam!"
  }
];
