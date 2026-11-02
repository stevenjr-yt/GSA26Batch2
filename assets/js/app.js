/* Buildless memories archive. All media and stories live in data.js. */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const icon = (name) =>
    `<svg class="icon" aria-hidden="true"><use href="#icon-${name}"/></svg>`;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const scrollTo = (id) =>
    $(id).scrollIntoView({
      behavior: reducedMotion.matches ? "instant" : "smooth",
      block: "start",
    });
  const chapters = [
    {
      category: "commute",
      title: "Transit & Commute",
      place: "MRT Jakarta",
      caption: "Berangkat bersama, cerita dimulai.",
      cover: "mrt-commute",
      description:
        "Pagi di gerbong dan peron MRT. Membawa almamater, antusiasme, dan semangat yang sama menuju hari inaugurasi.",
    },
    {
      category: "inauguration",
      title: "The Inauguration",
      place: "MGP Space, Jakarta",
      caption: "Satu panggung. Satu keluarga baru.",
      cover: "gp-space-almamater",
      description:
        "Dari antrean masuk sampai hujan confetti. Varsity jacket, panggung utama, dan momen ketika kita resmi menjadi bagian dari keluarga GSA.",
    },
    {
      category: "google-hq",
      title: "Inside Google HQ",
      place: "Pacific Century Place, SCBD",
      caption: "Melangkah ke tempat penuh inspirasi.",
      cover: "google-office-wall",
      description:
        "Logo Google dengan sentuhan batik, G-Bike yang ikonik, dan lorong payung tradisional. Melihat lebih dekat tempat ide-ide besar bertumbuh.",
    },
    {
      category: "hangout",
      title: "A Little Blok M",
      place: "Little Tokyo & kuliner",
      caption: "Makan bareng, ketawa lebih lama.",
      cover: "blok-m-mirror",
      description:
        "Cermin cembung Melawai, semangkuk ramen hangat, dan satu meja penuh teman. Bagian perjalanan yang membuat kita semakin dekat.",
    },
    {
      category: "nightlife",
      title: "The After Hours",
      place: "Jeruk Purut & hotel",
      caption: "Hari berakhir. Keseruan belum.",
      cover: "hotel-uno-qris",
      description:
        "Uji nyali di Rumah Hantu Jeruk Purut, obrolan malam, dan turnamen UNO di kamar hotel. Momen kecil yang justru paling membekas.",
    },
  ];
  let allMemories = [...MEMORIES_DATA];
  let currentFilter = "all";
  let searchQuery = "";
  let filteredItems = [...allMemories];
  let viewerItems = filteredItems;
  let activeIndex = 0;
  let returnFocus = null;
  let stopPhysics = () => {};
  const modal = $("lightboxModal");
  const search = $("geminiSearchInput");
  const filters = [...document.querySelectorAll(".filter-btn")];

  function updateCounts() {
    const videos = allMemories.filter((item) => item.type === "video").length;
    $("memoryCount").textContent = allMemories.length;
    $("videoCount").textContent = videos;
    document
      .querySelectorAll("[data-total]")
      .forEach((e) => (e.textContent = allMemories.length));
    document
      .querySelectorAll("[data-videos]")
      .forEach((e) => (e.textContent = videos));
    $("communityCount").textContent = allMemories.filter(
      (item) => item.category === "community",
    ).length;
  }
  updateCounts();
  window.addEventListener("moments:loaded", (event) => {
    const incoming = event.detail.items;
    const existing = allMemories.filter(
      (item) => item.category === "community",
    );
    const shared = [
      ...new Map(
        [...incoming, ...existing].map((item) => [item.id, item]),
      ).values(),
    ];
    allMemories = [...MEMORIES_DATA, ...shared];
    updateCounts();
    if (event.detail.selectCommunity) {
      search.value = "";
      $("aiResponseBox").hidden = true;
      applyFilterAndSearch("community", "");
      scrollTo("gallerySection");
    } else applyFilterAndSearch();
  });

  function setMenu(open, restoreFocus = false) {
    document.querySelector(".navbar").classList.toggle("menu-open", open);
    $("menuToggle").setAttribute("aria-expanded", String(open));
    $("menuToggle").setAttribute(
      "aria-label",
      open ? "Tutup menu" : "Buka menu",
    );
    if (restoreFocus) $("menuToggle").focus();
  }
  $("menuToggle").addEventListener("click", () =>
    setMenu($("menuToggle").getAttribute("aria-expanded") !== "true"),
  );
  $("navLinks").addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar")) setMenu(false);
  });
  matchMedia("(min-width: 810px)").addEventListener("change", () =>
    setMenu(false),
  );

  function attachImageFallback(img, fallback, errorHost) {
    img.addEventListener("error", () => {
      if (fallback && !img.dataset.retried) {
        img.dataset.retried = "true";
        img.src = fallback;
      } else if (errorHost) errorHost();
    });
  }

  function showChapter(index) {
    const chapter = chapters[index];
    const item = allMemories.find((item) => item.id === chapter.cover);
    document.querySelectorAll(".story-tab").forEach((button, i) => {
      button.classList.toggle("is-active", i === index);
      button.setAttribute("aria-pressed", String(i === index));
    });
    $("storyPanel").innerHTML =
      `<div class="story-copy"><p class="eyebrow">Chapter ${String(index + 1).padStart(2, "0")} · ${escape(chapter.place)}</p><h3>${escape(chapter.title)}</h3><p>${escape(chapter.description)}</p><button type="button" class="detail-link">Buka chapter ${icon("arrow")}</button></div><img class="story-image" src="${escape(item.src)}" alt="${escape(item.title)}" width="600" height="600" loading="lazy">`;
    $("storyPanel")
      .querySelector("button")
      .addEventListener("click", () => selectCategory(chapter.category));
    attachImageFallback($("storyPanel").querySelector("img"), item.fallbackSrc);
  }
  chapters.forEach((chapter, index) => {
    const item = allMemories.find((item) => item.id === chapter.cover);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "chapter-card chapter-timeline-card";
    card.dataset.category = chapter.category;
    card.innerHTML = `<span class="chapter-photo"><img src="${escape(item.src)}" alt="" width="320" height="200" loading="lazy"></span><h3>${escape(chapter.title)}</h3><p>${escape(chapter.caption)}</p><span class="chapter-number">${String(index + 1).padStart(2, "0")} · ${escape(chapter.place)}</span>`;
    card.addEventListener("click", () => selectCategory(chapter.category));
    attachImageFallback(card.querySelector("img"), item.fallbackSrc);
    $("chapterGrid").append(card);
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "story-tab";
    tab.setAttribute("aria-pressed", "false");
    tab.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span>${escape(chapter.title)}`;
    tab.addEventListener("click", () => showChapter(index));
    $("storyNav").append(tab);
  });
  showChapter(1);

  // A damped angular spring: scroll velocity adds an impulse, momentum settles at rest.
  // Only visible cards participate, with one shared frame loop and one passive listener.
  function initPolaroidPhysics() {
    stopPhysics();
    if (reducedMotion.matches) return;
    const states = [...document.querySelectorAll(".polaroid-anchor")].map(
      (anchor, i) => ({
        anchor,
        swing: anchor.querySelector(".polaroid-swing"),
        angle: 0,
        velocity: 0,
        visible: false,
        response: 0.8 + (i % 5) * 0.1,
        direction: i % 2 ? -1 : 1,
      }),
    );
    const byAnchor = new Map(states.map((state) => [state.anchor, state]));
    let frameId = 0;
    let previousFrame = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));
    function animate(now) {
      const dt = Math.min((now - previousFrame) / 1000 || 1 / 60, 0.032);
      previousFrame = now;
      let moving = false;
      for (const state of states) {
        if (!state.visible) continue;
        state.velocity += (-28 * state.angle - 2.8 * state.velocity) * dt;
        state.angle += state.velocity * dt;
        if (Math.abs(state.angle) > 9) {
          state.angle = clamp(state.angle, 9);
          state.velocity *= -0.25;
        }
        if (Math.abs(state.angle) < 0.012 && Math.abs(state.velocity) < 0.04) {
          state.angle = 0;
          state.velocity = 0;
        } else moving = true;
        state.swing.style.setProperty("--sway", `${state.angle.toFixed(3)}deg`);
      }
      frameId = moving ? requestAnimationFrame(animate) : 0;
    }
    function wake() {
      if (!frameId) {
        previousFrame = performance.now();
        frameId = requestAnimationFrame(animate);
      }
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const state = byAnchor.get(entry.target);
          state.visible = entry.isIntersecting;
          if (!state.visible) {
            state.angle = state.velocity = 0;
            state.swing.style.removeProperty("--sway");
          }
        }
      },
      { rootMargin: "100px 0px" },
    );
    states.forEach((state) => observer.observe(state.anchor));
    function onScroll() {
      const now = performance.now();
      const dy = window.scrollY - lastScrollY;
      const dt = Math.max((now - lastScrollTime) / 1000, 1 / 120);
      lastScrollY = window.scrollY;
      lastScrollTime = now;
      if (Math.abs(dy) < 0.2 || modal.open) return;
      const speed = dy / dt;
      const impulse = clamp(speed * 0.018, 65) * Math.min(dt * 15, 1);
      for (const state of states) {
        if (state.visible)
          state.velocity = clamp(
            state.velocity + impulse * state.response * state.direction,
            95,
          );
      }
      wake();
    }
    function onPointerOver(event) {
      const anchor = event.target.closest(".polaroid-anchor");
      if (!anchor || anchor.contains(event.relatedTarget)) return;
      const state = byAnchor.get(anchor);
      if (state?.visible && event.pointerType === "mouse") {
        state.velocity += 7 * state.direction;
        wake();
      }
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    $("galleryGrid").addEventListener("pointerover", onPointerOver);
    stopPhysics = () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      document.removeEventListener("scroll", onScroll);
      $("galleryGrid").removeEventListener("pointerover", onPointerOver);
      states.forEach((state) => state.swing.style.removeProperty("--sway"));
    };
  }
  reducedMotion.addEventListener("change", initPolaroidPhysics);

  function renderGallery() {
    stopPhysics();
    const grid = $("galleryGrid");
    grid.replaceChildren();
    const active = currentFilter !== "all" || Boolean(searchQuery);
    $("clearSearchFilterBtn").hidden = !active;
    $("galleryStatus").textContent =
      `${filteredItems.length} ${active ? "kenangan ditemukan" : "kenangan untuk dibuka kembali"}`;
    if (!filteredItems.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML =
        '<h3>Belum ketemu?</h3><p>Coba kata lain, atau buka kembali semua kenangan.</p><button type="button">Tampilkan semua kenangan</button>';
      empty.querySelector("button").addEventListener("click", resetFilters);
      grid.append(empty);
      return;
    }
    filteredItems.forEach((item, index) => {
      const originalIndex = allMemories.indexOf(item);
      const frame = document.createElement("div");
      frame.className =
        "polaroid-anchor" + (item.source === "gdrive" ? " drive-polaroid" : "");
      frame.style.setProperty(
        "--tilt",
        `${[-2.4, 1.8, -1.3, 2.6, -1.7, 1.1][originalIndex % 6]}deg`,
      );
      frame.style.setProperty(
        "--offset",
        `${[0, 22, 8, 14, 0, 24][originalIndex % 6]}px`,
      );
      frame.style.setProperty(
        "--string-length",
        `${[64, 80, 56, 72, 64][originalIndex % 5]}px`,
      );
      const media = item.type === "video" ? item.poster : item.src;
      const button = document.createElement("button");
      button.className = "polaroid-paper memory-card";
      button.type = "button";
      button.dataset.id = item.id;
      button.setAttribute(
        "aria-label",
        `Buka ${item.type === "video" ? "video" : "foto"}: ${item.title}`,
      );
      button.innerHTML = `<span class="polaroid-image"><img src="${escape(media)}" alt="" width="400" height="400" loading="lazy" decoding="async">${item.type === "video" ? `<span class="polaroid-play">${icon("play")}</span>` : ""}</span><span class="polaroid-caption"><span>${escape(item.badge || item.title)}</span><span class="polaroid-index">${String(originalIndex + 1).padStart(2, "0")} / ${allMemories.length}</span></span>`;
      button.addEventListener("click", () =>
        openLightbox(index, filteredItems, button),
      );
      attachImageFallback(
        button.querySelector("img"),
        item.type === "video"
          ? item.poster?.replace(/\.webp$/, ".jpg")
          : item.fallbackSrc,
        () => {
          button.classList.add("image-failed");
          button.querySelector("img").hidden = true;
        },
      );
      const string = document.createElement("span");
      string.className = "polaroid-string";
      string.setAttribute("aria-hidden", "true");
      const swing = document.createElement("div");
      swing.className = "polaroid-swing";
      swing.append(button);
      frame.append(string, swing);
      grid.append(frame);
    });
    initPolaroidPhysics();
  }

  function applyFilterAndSearch(filter = currentFilter, query = search.value) {
    currentFilter = filter;
    searchQuery = query.toLowerCase().trim();
    filteredItems = allMemories.filter((item) => {
      const categoryMatches =
        filter === "all" ||
        (filter === "videos"
          ? item.type === "video"
          : item.category === filter);
      const text = [
        item.title,
        item.description,
        item.location,
        item.chapterName,
        ...(item.tags || []),
      ]
        .join(" ")
        .toLowerCase();
      return categoryMatches && (!searchQuery || text.includes(searchQuery));
    });
    filters.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderGallery();
  }
  function resetFilters() {
    search.value = "";
    $("aiResponseBox").hidden = true;
    applyFilterAndSearch("all", "");
  }
  function selectCategory(category) {
    resetFilters();
    applyFilterAndSearch(category, "");
    scrollTo("gallerySection");
  }
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      search.value = "";
      $("aiResponseBox").hidden = true;
      applyFilterAndSearch(button.dataset.filter, "");
    }),
  );
  $("clearSearchFilterBtn").addEventListener("click", resetFilters);
  search.addEventListener("input", () => {
    $("aiResponseBox").hidden = true;
    applyFilterAndSearch();
  });
  GEMINI_QUICK_PROMPTS.forEach((prompt) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "prompt-chip";
    button.textContent = prompt.text
      .replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, "")
      .trim();
    button.addEventListener("click", () => {
      search.value = prompt.query;
      $("aiResponseText").textContent = prompt.response;
      $("aiResponseBox").hidden = false;
      applyFilterAndSearch("all", prompt.query);
    });
    $("promptChips").append(button);
  });

  function mediaError() {
    $("lightboxMediaContainer").innerHTML =
      '<p class="media-error" role="status">Media belum dapat dimuat. Coba buka kembali kenangan ini.</p>';
  }
  function renderViewer() {
    const item = viewerItems[activeIndex];
    const download = $("downloadMomentLink");
    const filename =
      (item.title.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 80) || "gsa-moment") +
      (item.type === "video" ? ".mp4" : ".webp");
    download.removeAttribute("target");
    download.removeAttribute("rel");
    download.href = item.src;
    download.download = filename;
    download.textContent = item.type === "video" ? "Unduh video" : "Unduh foto";
    $("downloadStatus").textContent = "";
    download.onclick = async (event) => {
      if (new URL(item.src, location.href).origin === location.origin) return;
      event.preventDefault();
      if (download.getAttribute("aria-busy") === "true") return;
      download.setAttribute("aria-busy", "true");
      $("downloadStatus").textContent = "Menyiapkan unduhan…";
      try {
        const response = await fetch(item.src, { credentials: "omit" });
        if (!response.ok) throw new Error("download");
        const url = URL.createObjectURL(await response.blob());
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        $("downloadStatus").textContent = "Unduhan siap.";
      } catch {
        $("downloadStatus").textContent = "Unduhan belum berhasil. Coba lagi.";
      } finally {
        download.removeAttribute("aria-busy");
      }
    };

    if (item.source === "gdrive") {
      download.href = item.driveUrl;
      download.removeAttribute("download");
      download.target = "_blank";
      download.rel = "noopener noreferrer";
      download.textContent = "Buka / unduh di Drive";
      download.onclick = null;
      $("downloadStatus").textContent =
        "Pemutaran dan unduhan mengikuti izin Google Drive pemilik video.";
    }
    $("lightboxTitle").textContent = item.title;
    $("lightboxLocation").textContent = item.location || "";
    $("lightboxLocation").hidden = !item.location;
    $("lightboxBadge").textContent =
      item.badge || (item.type === "video" ? "Video" : "Foto");
    $("lightboxCounter").textContent =
      `${activeIndex + 1} / ${viewerItems.length}`;
    $("lightboxDate").textContent = item.date || "";
    const description =
      typeof item.description === "string" ? item.description.trim() : "";
    $("lightboxDescription").textContent = description;
    $("lightboxDescription").hidden = !description;
    $("lightboxTags").replaceChildren();
    (item.tags || []).forEach((tag) => {
      const span = document.createElement("span");
      span.textContent = `#${tag}`;
      $("lightboxTags").append(span);
    });
    $("lightboxTags").hidden = !item.tags?.length;
    $("lightboxPrev").disabled = $("lightboxNext").disabled =
      viewerItems.length < 2;
    const container = $("lightboxMediaContainer");
    container.querySelector("video")?.pause();
    container.replaceChildren();
    if (item.source === "gdrive") {
      const iframe = document.createElement("iframe");
      iframe.src = item.src;
      iframe.title = item.title;
      iframe.allow = "autoplay; fullscreen";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      container.append(iframe);
    } else if (item.type === "video") {
      const video = document.createElement("video");
      video.src = item.src;
      video.poster = item.poster || "";
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("aria-label", item.title);
      video.addEventListener("error", mediaError);
      container.append(video);
      video.play().catch(() => {
        /* Native controls remain available when autoplay is blocked. */
      });
    } else {
      const image = document.createElement("img");
      image.alt = item.title;
      attachImageFallback(image, item.fallbackSrc, mediaError);
      image.src = item.src;
      container.append(image);
    }
  }
  function openLightbox(
    index,
    list = filteredItems,
    trigger = document.activeElement,
  ) {
    if (!list[index]) return;
    viewerItems = list;
    activeIndex = index;
    returnFocus = trigger;
    renderViewer();
    modal.showModal();
    modal.scrollTop = 0;
    document.body.classList.add("modal-open");
    $("lightboxClose").focus({ preventScroll: true });
  }
  function closeLightbox() {
    if (modal.open) modal.close();
  }
  function stepViewer(direction) {
    activeIndex =
      (activeIndex + direction + viewerItems.length) % viewerItems.length;
    renderViewer();
  }
  $("lightboxClose").addEventListener("click", closeLightbox);
  $("lightboxPrev").addEventListener("click", () => stepViewer(-1));
  $("lightboxNext").addEventListener("click", () => stepViewer(1));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      const b = modal.getBoundingClientRect();
      if (
        e.clientX < b.left ||
        e.clientX > b.right ||
        e.clientY < b.top ||
        e.clientY > b.bottom
      )
        closeLightbox();
    }
  });
  modal.addEventListener("close", () => {
    const video = $("lightboxMediaContainer").querySelector("video");
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    $("lightboxMediaContainer").replaceChildren();
    document.body.classList.remove("modal-open");
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  });
  document.addEventListener("keydown", (e) => {
    if (modal.open) {
      if (e.target.closest("video")) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        stepViewer(e.key === "ArrowLeft" ? -1 : 1);
      }
      return;
    }
    if (
      e.key === "Escape" &&
      $("menuToggle").getAttribute("aria-expanded") === "true"
    )
      setMenu(false, true);
    if (
      e.key === "/" &&
      !e.target.matches("input,textarea,[contenteditable]")
    ) {
      e.preventDefault();
      search.focus();
    }
  });
  $("rewindPlay").addEventListener("click", () =>
    openLightbox(
      allMemories.findIndex((item) => item.id === "confetti-grand"),
      allMemories,
      $("rewindPlay"),
    ),
  );

  // Background Music: Nadhif Basalamah - Kota Ini Tak Sama Tanpamu
  const bgAudio = new Audio("assets/audio/kota-ini-tak-sama-tanpamu.mp3");
  bgAudio.loop = true;
  bgAudio.preload = "auto";
  bgAudio.volume = 0.55;

  let userExplicitlyToggled = false;

  function updateAudioUI(isPlaying) {
    const btn = $("audioToggleBtn");
    const indicator = $("audioIndicator");
    const textLabel = document.querySelector(".audio-text");
    if (btn) btn.setAttribute("aria-pressed", String(isPlaying));
    if (indicator) indicator.classList.toggle("audio-paused", !isPlaying);
    if (textLabel) textLabel.textContent = isPlaying ? "Lagu: On" : "Lagu: Off";
  }

  async function togglePlayAudio() {
    userExplicitlyToggled = true;
    if (!bgAudio.paused) {
      bgAudio.pause();
      updateAudioUI(false);
    } else {
      try {
        await bgAudio.play();
        updateAudioUI(true);
      } catch (err) {
        console.warn("Audio play prevented:", err);
      }
    }
  }

  $("audioToggleBtn").addEventListener("click", togglePlayAudio);

  // Attempt auto-playback on open; if modern browser blocks it, start on first tap/click
  bgAudio.play()
    .then(() => updateAudioUI(true))
    .catch(() => {
      const startOnFirstGesture = () => {
        if (!userExplicitlyToggled && bgAudio.paused) {
          bgAudio.play()
            .then(() => updateAudioUI(true))
            .catch(() => {});
        }
      };
      window.addEventListener("click", startOnFirstGesture, { once: true, passive: true });
      window.addEventListener("touchstart", startOnFirstGesture, { once: true, passive: true });
      window.addEventListener("keydown", startOnFirstGesture, { once: true, passive: true });
    });
  $("triggerConfettiBtn").addEventListener("click", () => {
    if (reducedMotion.matches || $("confettiCanvas")) return;
    const canvas = document.createElement("canvas");
    canvas.id = "confettiCanvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    document.body.append(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      return;
    }
    const colors = ["#3186ff", "#ea4335", "#fbbc05", "#34a853"];
    const particles = Array.from({ length: 100 }, (_, i) => ({
      x: innerWidth / 2,
      y: innerHeight * 0.55,
      vx: (Math.random() - 0.5) * 15,
      vy: -Math.random() * 14 - 3,
      size: Math.random() * 6 + 4,
      color: colors[i % 4],
      rotation: Math.random() * 6,
    }));
    const start = performance.now();
    function frame(now) {
      if (reducedMotion.matches || now - start > 3500) {
        canvas.remove();
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.rotation += 0.06;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, 1 - (now - start) / 3500);
        ctx.fillStyle = p.color;
        ctx.fillRect(0, 0, p.size, p.size * 0.6);
        ctx.restore();
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
  applyFilterAndSearch("all", "");
});
