/**
 * Google Student Ambassador (GSA) Inauguration 2026 Batch 2
 * Interactive Web Application Logic (Light Theme: White & Light Blue)
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const galleryGrid = document.getElementById("galleryGrid");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const geminiSearchInput = document.getElementById("geminiSearchInput");
  const promptChipsContainer = document.getElementById("promptChips");
  const aiResponseBox = document.getElementById("aiResponseBox");
  const aiResponseText = document.getElementById("aiResponseText");
  const audioToggleBtn = document.getElementById("audioToggleBtn");
  const audioIndicator = document.getElementById("audioIndicator");
  const triggerConfettiBtn = document.getElementById("triggerConfettiBtn");
  
  // Lightbox Elements
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const lightboxMediaContainer = document.getElementById("lightboxMediaContainer");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxLocation = document.getElementById("lightboxLocation");
  const lightboxBadge = document.getElementById("lightboxBadge");
  const lightboxDate = document.getElementById("lightboxDate");
  const lightboxDescription = document.getElementById("lightboxDescription");
  const lightboxTags = document.getElementById("lightboxTags");
  const lightboxCounter = document.getElementById("lightboxCounter");

  // State
  let currentFilter = "all";
  let searchQuery = "";
  let currentFilteredList = [...MEMORIES_DATA];
  let currentActiveIndex = 0;
  let isAudioPlaying = false;
  let audioCtx = null;
  let synthGain = null;
  let synthOscillators = [];

  // ================= 1. RENDER PROMPT CHIPS =================
  function initPromptChips() {
    if (!promptChipsContainer) return;
    promptChipsContainer.innerHTML = "";

    GEMINI_QUICK_PROMPTS.forEach(chip => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "px-3.5 py-1.5 rounded-full text-xs md:text-sm font-medium glass-pill text-sky-800 hover:text-sky-950 hover:border-sky-400 hover:bg-sky-100 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm";
      btn.innerHTML = `
        <svg class="w-3.5 h-3.5 text-sky-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <span>${chip.text}</span>
      `;
      btn.addEventListener("click", () => {
        if (geminiSearchInput) {
          geminiSearchInput.value = chip.text;
        }
        showAiResponse(chip.response, chip.query);
        applyFilterAndSearch(currentFilter, chip.query);
      });
      promptChipsContainer.appendChild(btn);
    });
  }

  // ================= 2. AI RESPONSE SIMULATION =================
  let typingTimer = null;
  function showAiResponse(text, filterTerm = "") {
    if (!aiResponseBox || !aiResponseText) return;

    aiResponseBox.classList.remove("hidden");
    aiResponseText.innerHTML = "";
    
    // Clear any pending typing
    if (typingTimer) clearInterval(typingTimer);

    let charIndex = 0;
    typingTimer = setInterval(() => {
      if (charIndex < text.length) {
        aiResponseText.textContent += text.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(typingTimer);
      }
    }, 18);

    aiResponseBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // ================= 3. RENDER GALLERY ITEMS (White & Light Blue) =================
  function renderGallery(items) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = "";

    if (items.length === 0) {
      galleryGrid.innerHTML = `
        <div class="col-span-full py-16 text-center glass-panel rounded-3xl p-8 border border-sky-200">
          <div class="inline-flex p-4 rounded-full bg-sky-100 text-sky-600 mb-4 shadow-sm">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-2 font-heading">Tidak Menemukan Kenangan</h3>
          <p class="text-slate-600 text-sm max-w-md mx-auto">Coba cari kata kunci lain seperti "confetti", "ramen", "cermin", "google", atau "uno".</p>
          <button id="resetSearchBtn" class="mt-4 px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition shadow-md shadow-sky-500/20">
            Tampilkan Semua Kenangan
          </button>
        </div>
      `;
      const resetBtn = document.getElementById("resetSearchBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          if (geminiSearchInput) geminiSearchInput.value = "";
          searchQuery = "";
          if (aiResponseBox) aiResponseBox.classList.add("hidden");
          applyFilterAndSearch("all", "");
        });
      }
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "memory-card glass-panel rounded-2xl sm:rounded-3xl overflow-hidden border border-sky-200/90 group cursor-pointer flex flex-col bg-white/90";
      card.setAttribute("data-id", item.id);
      
      const isVideo = item.type === "video";
      const mediaThumb = isVideo ? (item.poster || "assets/images/steven-stage-inauguration.webp") : item.src;
      const mediaFallback = isVideo ? "" : (item.fallbackSrc || "");

      card.innerHTML = `
        <div class="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
          <picture>
            <source srcset="${mediaThumb}" type="image/webp">
            <img src="${mediaFallback || mediaThumb}" 
                 alt="${item.title}" 
                 loading="lazy" 
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out">
          </picture>

          <!-- Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent"></div>

          <!-- Type Badge -->
          <div class="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${isVideo ? 'bg-indigo-600 text-white shadow-sm' : 'bg-sky-600 text-white shadow-sm'}">
            ${isVideo ? `
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Video</span>
            ` : `
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <span>Foto</span>
            `}
          </div>

          <!-- Highlight Badge -->
          <div class="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md bg-white/95 text-sky-800 border border-sky-300 shadow-sm">
            ${item.badge}
          </div>

          ${isVideo ? `
            <!-- Video Play Button Centered -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="play-badge w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/40">
                <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
          ` : ''}

          <!-- Location overlay bottom left -->
          <div class="absolute bottom-2.5 left-3 right-3 flex items-center gap-1.5 text-xs text-white truncate font-medium drop-shadow-md">
            <svg class="w-3.5 h-3.5 text-sky-300 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span class="truncate">${item.location}</span>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between bg-white/95">
          <div>
            <div class="text-[11px] uppercase tracking-wider text-sky-700 font-bold mb-1">
              Chapter ${item.chapter}: ${item.chapterName}
            </div>
            <h3 class="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1 mb-2 font-heading">
              ${item.title}
            </h3>
            <p class="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-3">
              ${item.description}
            </p>
          </div>

          <div class="pt-3 border-t border-sky-100 flex items-center justify-between">
            <div class="flex flex-wrap gap-1">
              ${item.tags.slice(0, 2).map(tag => `<span class="px-2 py-0.5 rounded-full text-[10px] bg-sky-50 text-sky-700 border border-sky-200 font-medium">#${tag}</span>`).join('')}
            </div>
            <span class="text-xs text-sky-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Lihat Detail
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        openLightbox(index);
      });

      galleryGrid.appendChild(card);
    });
  }

  // ================= 4. FILTERING & SEARCH =================
  function applyFilterAndSearch(filter = currentFilter, query = searchQuery) {
    currentFilter = filter;
    searchQuery = query.toLowerCase().trim();

    currentFilteredList = MEMORIES_DATA.filter(item => {
      const matchesCategory = 
        filter === "all" ? true :
        filter === "videos" ? item.type === "video" :
        item.category === filter;

      const matchesQuery = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery) ||
        item.location.toLowerCase().includes(searchQuery) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery)) ||
        item.chapterName.toLowerCase().includes(searchQuery);

      return matchesCategory && matchesQuery;
    });

    // Update active filter button styling (White & Light Blue)
    filterButtons.forEach(btn => {
      if (btn.getAttribute("data-filter") === filter) {
        btn.classList.add("bg-sky-600", "text-white", "shadow-md", "shadow-sky-500/25", "font-bold");
        btn.classList.remove("text-slate-700", "glass-pill", "bg-white");
      } else {
        btn.classList.remove("bg-sky-600", "text-white", "shadow-md", "shadow-sky-500/25", "font-bold");
        btn.classList.add("text-slate-700", "glass-pill");
      }
    });

    renderGallery(currentFilteredList);
  }

  // Filter Buttons Click
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetFilter = btn.getAttribute("data-filter");
      applyFilterAndSearch(targetFilter, searchQuery);
    });
  });

  // Search Input Handler
  if (geminiSearchInput) {
    geminiSearchInput.addEventListener("input", (e) => {
      const val = e.target.value;
      searchQuery = val;
      
      const matchedPrompt = GEMINI_QUICK_PROMPTS.find(p => val.toLowerCase().includes(p.query));
      if (matchedPrompt && val.length > 2) {
        showAiResponse(matchedPrompt.response, val);
      } else if (val.trim() === "" && aiResponseBox) {
        aiResponseBox.classList.add("hidden");
      }

      applyFilterAndSearch(currentFilter, val);
    });
  }

  // ================= 5. LIGHTBOX MODAL (White & Light Blue) =================
  function openLightbox(index) {
    if (!currentFilteredList[index]) return;
    currentActiveIndex = index;
    const item = currentFilteredList[index];

    if (!lightboxModal) return;

    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxLocation) lightboxLocation.textContent = item.location;
    if (lightboxBadge) lightboxBadge.textContent = item.badge;
    if (lightboxDate) lightboxDate.textContent = item.date;
    if (lightboxDescription) lightboxDescription.textContent = item.description;
    if (lightboxCounter) lightboxCounter.textContent = `${index + 1} / ${currentFilteredList.length}`;

    if (lightboxTags) {
      lightboxTags.innerHTML = item.tags.map(t => `<span class="px-2.5 py-1 rounded-full text-xs bg-sky-100 text-sky-800 border border-sky-200 font-medium">#${t}</span>`).join(" ");
    }

    if (lightboxMediaContainer) {
      lightboxMediaContainer.innerHTML = "";
      if (item.type === "video") {
        const video = document.createElement("video");
        video.src = item.src;
        video.poster = item.poster || "";
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.className = "max-h-[68vh] max-w-full rounded-2xl object-contain shadow-2xl mx-auto";
        lightboxMediaContainer.appendChild(video);
      } else {
        const picture = document.createElement("picture");
        picture.innerHTML = `
          <source srcset="${item.src}" type="image/webp">
          <img src="${item.fallbackSrc || item.src}" alt="${item.title}" class="max-h-[68vh] max-w-full rounded-2xl object-contain shadow-2xl mx-auto">
        `;
        lightboxMediaContainer.appendChild(picture);
      }
    }

    lightboxModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove("active");
    document.body.style.overflow = "";

    if (lightboxMediaContainer) {
      const vid = lightboxMediaContainer.querySelector("video");
      if (vid) {
        vid.pause();
        vid.src = "";
      }
    }
  }

  function prevMedia() {
    if (currentFilteredList.length <= 1) return;
    currentActiveIndex = (currentActiveIndex - 1 + currentFilteredList.length) % currentFilteredList.length;
    openLightbox(currentActiveIndex);
  }

  function nextMedia() {
    if (currentFilteredList.length <= 1) return;
    currentActiveIndex = (currentActiveIndex + 1) % currentFilteredList.length;
    openLightbox(currentActiveIndex);
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", prevMedia);
  if (lightboxNext) lightboxNext.addEventListener("click", nextMedia);

  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal || e.target.classList.contains("lightbox-backdrop")) {
        closeLightbox();
      }
    });
  }

  window.addEventListener("keydown", (e) => {
    if (!lightboxModal.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") prevMedia();
    if (e.key === "ArrowRight") nextMedia();
  });

  // ================= 6. AMBIENT GEMINI SYNTH =================
  function toggleAmbientAudio() {
    if (isAudioPlaying) {
      stopAmbientSynth();
    } else {
      startAmbientSynth();
    }
  }

  function startAmbientSynth() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === "suspended") audioCtx.resume();

      synthGain = audioCtx.createGain();
      synthGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      synthGain.gain.exponentialRampToValueAtTime(0.07, audioCtx.currentTime + 3);
      synthGain.connect(audioCtx.destination);

      const freqs = [261.63, 392.00, 587.33, 659.25, 987.77];
      synthOscillators = [];

      freqs.forEach(freq => {
        const osc = audioCtx.createOscillator();
        const subGain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(0.2 + Math.random() * 0.3, audioCtx.currentTime);
        lfoGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(subGain.gain);

        subGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.connect(subGain);
        subGain.connect(synthGain);

        osc.start();
        lfo.start();
        synthOscillators.push(osc, lfo);
      });

      isAudioPlaying = true;
      if (audioIndicator) audioIndicator.classList.remove("audio-paused");
      if (audioToggleBtn) {
        const textSpan = audioToggleBtn.querySelector(".audio-text");
        if (textSpan) textSpan.textContent = "Gemini Sound: On";
        audioToggleBtn.classList.add("border-sky-400", "bg-sky-100");
      }
    } catch (err) {
      console.warn("Web Audio not supported", err);
    }
  }

  function stopAmbientSynth() {
    if (synthGain && audioCtx) {
      synthGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);
      setTimeout(() => {
        synthOscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch (e) {}
        });
        synthOscillators = [];
      }, 1600);
    }
    isAudioPlaying = false;
    if (audioIndicator) audioIndicator.classList.add("audio-paused");
    if (audioToggleBtn) {
      const textSpan = audioToggleBtn.querySelector(".audio-text");
      if (textSpan) textSpan.textContent = "Gemini Sound: Off";
      audioToggleBtn.classList.remove("border-sky-400", "bg-sky-100");
    }
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", toggleAmbientAudio);
  }

  // ================= 7. PURE CANVAS CONFETTI CELEBRATION =================
  function fireConfetti() {
    const canvas = document.createElement("canvas");
    canvas.id = "confettiCanvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const colors = ["#0284c7", "#38bdf8", "#EA4335", "#FBBC05", "#34A853", "#6366f1", "#0284c7"];
    const particles = [];
    const count = 150;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 450,
        y: height * 0.35 + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 15,
        vy: -Math.random() * 12 - 4,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let start = performance.now();
    function animate(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28;
        p.rotation += p.rSpeed;
        p.opacity = Math.max(0, 1 - (elapsed / 4500));

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (elapsed < 4500) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(animate);
  }

  if (triggerConfettiBtn) {
    triggerConfettiBtn.addEventListener("click", fireConfetti);
  }

  // ================= 8. CHAPTER TIMELINE CLICK =================
  const chapterCards = document.querySelectorAll(".chapter-timeline-card");
  chapterCards.forEach(card => {
    card.addEventListener("click", () => {
      const targetCategory = card.getAttribute("data-category");
      if (targetCategory) {
        applyFilterAndSearch(targetCategory, "");
      }
      const gallerySec = document.getElementById("gallerySection");
      if (gallerySec) {
        gallerySec.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Initial Boot
  initPromptChips();
  applyFilterAndSearch("all", "");
});
