/* GSA 2026 Batch 2 - Virtual Photobooth & Twibbon Generator */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const canvas = $("pbCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const CANVAS_SIZE = 1080;
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  // State
  let userImage = null; // HTMLImageElement
  let currentTemplateIndex = 0;
  let activeFilter = "normal";
  let currentStream = null;
  let currentFacingMode = "user"; // "user" or "environment"
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };

  const photoState = {
    panX: 0,
    panY: 0,
    scale: 1.0,
    rotation: 0, // in degrees
    flipH: false,
  };

  // Preload GSA Brand Assets
  const assets = {
    gLogo: null,
    gsaWordmark: null,
    geminiSparkle: null,
    heroBulb: null,
    heroCode: null,
  };

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function preloadAssets() {
    const [gLogo, gsaWordmark, geminiSparkle, heroBulb, heroCode] =
      await Promise.all([
        loadImage("assets/images/google-g-logo.png"),
        loadImage("assets/brand/gsa-wordmark.png"),
        loadImage("assets/brand/gemini-sparkle.png"),
        loadImage("assets/brand/hero-bulb.png"),
        loadImage("assets/brand/hero-code.png"),
      ]);
    assets.gLogo = gLogo;
    assets.gsaWordmark = gsaWordmark;
    assets.geminiSparkle = geminiSparkle;
    assets.heroBulb = heroBulb;
    assets.heroCode = heroCode;
    renderCanvas();
  }
  preloadAssets();

  // Template Definitions
  const templates = [
    {
      id: "lead-innovate",
      name: "Lead, Innovate & Inspire",
      tagline: "Official Classic Ambassador",
      badgeColor: "#4285F4",
      draw: drawTemplateLeadInnovate,
    },
    {
      id: "inauguration-night",
      name: "MGP Space Inauguration",
      tagline: "Varsity & Golden Night",
      badgeColor: "#FBBC04",
      draw: drawTemplateInauguration,
    },
    {
      id: "gemini-future",
      name: "Lead The Future (Gemini)",
      tagline: "Cyber AI & Tech Edition",
      badgeColor: "#8E75FF",
      draw: drawTemplateGeminiFuture,
    },
    {
      id: "retro-photobooth",
      name: "Retro 4-Cut Photobooth",
      tagline: "K-Photobooth Nostalgia",
      badgeColor: "#EA4335",
      draw: drawTemplateRetro,
    },
    {
      id: "sticker-mania",
      name: "Playful Sticker Mania",
      tagline: "GSA Squad 2026 Vibes",
      badgeColor: "#34A853",
      draw: drawTemplateStickerMania,
    },
    {
      id: "vip-pass",
      name: "Official Delegate Pass",
      tagline: "All-Access Tech Conference",
      badgeColor: "#4285F4",
      draw: drawTemplateVipPass,
    },
  ];

  // Initialize Template List UI
  function initTemplateList() {
    const container = $("pbTemplateList");
    if (!container) return;
    container.replaceChildren();

    templates.forEach((tpl, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className =
        "pb-template-card" + (index === currentTemplateIndex ? " is-active" : "");
      card.dataset.index = index;
      card.innerHTML = `
        <div class="pb-tpl-preview pb-tpl-preview-${tpl.id}">
          <span class="pb-tpl-dot" style="background:${tpl.badgeColor}"></span>
        </div>
        <div class="pb-tpl-info">
          <h4>${tpl.name}</h4>
          <p>${tpl.tagline}</p>
        </div>
      `;
      card.addEventListener("click", () => {
        currentTemplateIndex = index;
        document
          .querySelectorAll(".pb-template-card")
          .forEach((c, i) => c.classList.toggle("is-active", i === index));
        renderCanvas();
      });
      container.append(card);
    });
  }
  initTemplateList();

  // Color Filter definitions
  function applyPhotoFilter(context) {
    switch (activeFilter) {
      case "vibrant":
        context.filter = "saturate(1.4) contrast(1.12) brightness(1.04)";
        break;
      case "warm":
        context.filter =
          "sepia(0.28) saturate(1.25) hue-rotate(-8deg) brightness(1.05)";
        break;
      case "bw":
        context.filter = "grayscale(1) contrast(1.3) brightness(0.96)";
        break;
      case "cyber":
        context.filter =
          "contrast(1.2) hue-rotate(180deg) saturate(1.25) brightness(1.02)";
        break;
      default:
        context.filter = "none";
    }
  }

  // Draw user image onto canvas transformed
  function drawUserPhoto(windowRect = null) {
    if (!userImage) return;

    ctx.save();
    if (windowRect) {
      ctx.beginPath();
      if (windowRect.radius) {
        ctx.roundRect(
          windowRect.x,
          windowRect.y,
          windowRect.width,
          windowRect.height,
          windowRect.radius,
        );
      } else {
        ctx.rect(
          windowRect.x,
          windowRect.y,
          windowRect.width,
          windowRect.height,
        );
      }
      ctx.clip();
    }

    // Target center is either window center or canvas center
    const centerX = windowRect
      ? windowRect.x + windowRect.width / 2 + photoState.panX
      : CANVAS_SIZE / 2 + photoState.panX;
    const centerY = windowRect
      ? windowRect.y + windowRect.height / 2 + photoState.panY
      : CANVAS_SIZE / 2 + photoState.panY;

    // Calculate aspect fill
    const targetW = windowRect ? windowRect.width : CANVAS_SIZE;
    const targetH = windowRect ? windowRect.height : CANVAS_SIZE;
    const imgAspect = userImage.width / userImage.height;
    const targetAspect = targetW / targetH;

    let baseW, baseH;
    if (imgAspect > targetAspect) {
      baseH = targetH;
      baseW = targetH * imgAspect;
    } else {
      baseW = targetW;
      baseH = targetW / imgAspect;
    }

    const drawW = baseW * photoState.scale;
    const drawH = baseH * photoState.scale;

    ctx.translate(centerX, centerY);
    ctx.rotate((photoState.rotation * Math.PI) / 180);
    if (photoState.flipH) {
      ctx.scale(-1, 1);
    }

    applyPhotoFilter(ctx);
    ctx.drawImage(userImage, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.filter = "none";
    ctx.restore();
  }

  // Helper: Draw helper text with shadow/glow
  function drawGlowText(
    text,
    x,
    y,
    font,
    color,
    align = "center",
    glowColor = null,
    glowBlur = 0,
  ) {
    ctx.save();
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    if (glowColor && glowBlur) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = glowBlur;
    }
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // Helper: Draw rounded pill
  function drawPill(x, y, w, h, fill, stroke = null, strokeWidth = 1) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, h / 2);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Helper: Draw Google 4-color stripe
  function drawGoogleStripe(x, y, w, h) {
    const segmentW = w / 4;
    const colors = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];
    colors.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(x + i * segmentW, y, segmentW, h);
    });
  }

  // ================= TEMPLATE 1: LEAD, INNOVATE & INSPIRE =================
  function drawTemplateLeadInnovate() {
    const framePadding = 48;
    const topBarHeight = 130;
    const bottomBarHeight = 180;

    // Window for photo
    const photoWindow = {
      x: framePadding,
      y: topBarHeight + 20,
      width: CANVAS_SIZE - framePadding * 2,
      height: CANVAS_SIZE - topBarHeight - bottomBarHeight - 10,
      radius: 24,
    };

    // Draw user photo in window
    ctx.fillStyle = "#161719";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawUserPhoto(photoWindow);

    // Inner shadow & subtle frame border
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(
      photoWindow.x,
      photoWindow.y,
      photoWindow.width,
      photoWindow.height,
      photoWindow.radius,
    );
    ctx.stroke();
    ctx.restore();

    // 4-color Outer Accent Border
    const borderThick = 12;
    drawGoogleStripe(0, 0, CANVAS_SIZE, borderThick);
    drawGoogleStripe(0, CANVAS_SIZE - borderThick, CANVAS_SIZE, borderThick);

    // Top Header Bar
    drawPill(
      framePadding,
      28,
      CANVAS_SIZE - framePadding * 2,
      86,
      "rgba(24, 25, 28, 0.94)",
      "rgba(255, 255, 255, 0.15)",
      2,
    );

    // GSA Wordmark / Title in Header
    if (assets.gsaWordmark) {
      const wmAspect = assets.gsaWordmark.width / assets.gsaWordmark.height;
      const wmW = 320;
      const wmH = wmW / wmAspect;
      ctx.drawImage(
        assets.gsaWordmark,
        (CANVAS_SIZE - wmW) / 2,
        28 + (86 - wmH) / 2 - 2,
        wmW,
        wmH,
      );
    } else {
      drawGlowText(
        "Google Student Ambassador",
        CANVAS_SIZE / 2,
        64,
        'bold 28px "Google Sans Flex", sans-serif',
        "#FFFFFF",
      );
    }

    // Google 'G' Logo Top-Right
    if (assets.gLogo) {
      ctx.drawImage(assets.gLogo, CANVAS_SIZE - framePadding - 72, 38, 56, 56);
    }

    // Official Badge Pill Top-Left
    drawPill(
      framePadding + 20,
      44,
      140,
      38,
      "rgba(66, 133, 244, 0.25)",
      "#4285F4",
      1.5,
    );
    drawGlowText(
      "★ BATCH 2",
      framePadding + 90,
      63,
      'bold 16px "Google Sans Flex", sans-serif',
      "#8ab4f8",
    );

    // Bottom Banner Area
    const bottomY = CANVAS_SIZE - bottomBarHeight + 10;
    drawPill(
      framePadding,
      bottomY,
      CANVAS_SIZE - framePadding * 2,
      126,
      "rgba(20, 21, 24, 0.95)",
      "rgba(255, 255, 255, 0.2)",
      2,
    );

    // Decorative 4-color stripe on top of bottom banner
    drawGoogleStripe(framePadding + 40, bottomY, CANVAS_SIZE - framePadding * 2 - 80, 4);

    // Main Slogan
    drawGlowText(
      "LEAD  •  INNOVATE  •  INSPIRE",
      CANVAS_SIZE / 2,
      bottomY + 44,
      'bold 34px "Google Sans Flex", sans-serif',
      "#FFFFFF",
      "center",
      "rgba(66, 133, 244, 0.6)",
      10,
    );

    // Subtitle
    drawGlowText(
      "GOOGLE STUDENT AMBASSADOR INDONESIA  •  2026 INAUGURATION",
      CANVAS_SIZE / 2,
      bottomY + 84,
      '600 17px "Google Sans Flex", sans-serif',
      "#9aa0a6",
    );
  }

  // ================= TEMPLATE 2: INAUGURATION NIGHT MGP SPACE =================
  function drawTemplateInauguration() {
    const pad = 56;
    const photoWindow = {
      x: pad,
      y: 110,
      width: CANVAS_SIZE - pad * 2,
      height: CANVAS_SIZE - 310,
      radius: 18,
    };

    // Deep Midnight Varsity Background
    ctx.fillStyle = "#0c1017";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    drawUserPhoto(photoWindow);

    // Double Varsity Frame Outline (Gold & White)
    ctx.save();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(
      photoWindow.x - 4,
      photoWindow.y - 4,
      photoWindow.width + 8,
      photoWindow.height + 8,
      22,
    );
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(
      photoWindow.x - 12,
      photoWindow.y - 12,
      photoWindow.width + 24,
      photoWindow.height + 24,
      26,
    );
    ctx.stroke();
    ctx.restore();

    // Top Header Banner
    drawPill(
      (CANVAS_SIZE - 460) / 2,
      36,
      460,
      54,
      "rgba(12, 16, 23, 0.92)",
      "#FFD700",
      2,
    );
    drawGlowText(
      "★  OFFICIALLY INAUGURATED  ★",
      CANVAS_SIZE / 2,
      63,
      'bold 20px "Google Sans Flex", sans-serif',
      "#FFD700",
      "center",
      "#FFD700",
      8,
    );

    // Confetti / Sparkle accents around corners
    ctx.fillStyle = "#FFD700";
    [[75, 45], [CANVAS_SIZE - 75, 45], [75, photoWindow.y + photoWindow.height + 25], [CANVAS_SIZE - 75, photoWindow.y + photoWindow.height + 25]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bottom Plaque
    const plaqueY = CANVAS_SIZE - 170;
    drawPill(
      pad,
      plaqueY,
      CANVAS_SIZE - pad * 2,
      128,
      "rgba(15, 20, 30, 0.96)",
      "rgba(255, 215, 0, 0.4)",
      2,
    );

    drawGlowText(
      "GSA 2026 BATCH 2 DELEGATE",
      CANVAS_SIZE / 2,
      plaqueY + 38,
      'bold 36px "Google Sans Flex", sans-serif',
      "#FFFFFF",
      "center",
      "rgba(255, 215, 0, 0.5)",
      8,
    );

    drawGlowText(
      "MGP SPACE, JAKARTA  •  FROM CAMPUS TO COMMUNITY LEADERS",
      CANVAS_SIZE / 2,
      plaqueY + 84,
      '600 18px "Google Sans Flex", sans-serif',
      "#E2E8F0",
    );
  }

  // ================= TEMPLATE 3: GEMINI AI FUTURE =================
  function drawTemplateGeminiFuture() {
    const pad = 50;
    const photoWindow = {
      x: pad,
      y: 110,
      width: CANVAS_SIZE - pad * 2,
      height: CANVAS_SIZE - 300,
      radius: 20,
    };

    // Dark cyber backdrop
    ctx.fillStyle = "#090A0F";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    drawUserPhoto(photoWindow);

    // Glowing Cyber Gradient Border
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    grad.addColorStop(0, "#4285F4");
    grad.addColorStop(0.5, "#8E75FF");
    grad.addColorStop(1, "#00E5FF");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 6;
    ctx.shadowColor = "#8E75FF";
    ctx.shadowBlur = 16;
    ctx.strokeRect(
      photoWindow.x - 2,
      photoWindow.y - 2,
      photoWindow.width + 4,
      photoWindow.height + 4,
    );
    ctx.restore();

    // Futuristic Corner HUD brackets
    const bracketSize = 36;
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 4;
    [
      [photoWindow.x - 14, photoWindow.y - 14, 1, 1],
      [photoWindow.x + photoWindow.width + 14, photoWindow.y - 14, -1, 1],
      [photoWindow.x - 14, photoWindow.y + photoWindow.height + 14, 1, -1],
      [
        photoWindow.x + photoWindow.width + 14,
        photoWindow.y + photoWindow.height + 14,
        -1,
        -1,
      ],
    ].forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * bracketSize);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * bracketSize, y);
      ctx.stroke();
    });

    // Top Header Bar
    drawPill(
      pad,
      32,
      CANVAS_SIZE - pad * 2,
      64,
      "rgba(14, 16, 26, 0.9)",
      "rgba(142, 117, 255, 0.4)",
      2,
    );

    drawGlowText(
      "⚡ GOOGLE STUDENT AMBASSADOR  •  BATCH 2",
      CANVAS_SIZE / 2 - 30,
      64,
      'bold 22px "Google Sans Flex", sans-serif',
      "#FFFFFF",
      "center",
      "#8E75FF",
      8,
    );

    // Gemini Sparkle Asset Top-Right
    if (assets.geminiSparkle) {
      ctx.drawImage(
        assets.geminiSparkle,
        CANVAS_SIZE - pad - 68,
        34,
        56,
        56,
      );
    }

    // Bottom Futuristic Pill
    const botY = CANVAS_SIZE - 165;
    drawPill(
      pad,
      botY,
      CANVAS_SIZE - pad * 2,
      126,
      "rgba(10, 12, 20, 0.95)",
      "rgba(0, 229, 255, 0.35)",
      2,
    );

    drawGlowText(
      "LEAD THE FUTURE WITH AI & INNOVATION",
      CANVAS_SIZE / 2,
      botY + 40,
      'bold 34px "Google Sans Flex", sans-serif',
      "#00E5FF",
      "center",
      "#00E5FF",
      12,
    );

    drawGlowText(
      "EMPOWERING CAMPUS COMMUNITIES THROUGH TECHNOLOGY",
      CANVAS_SIZE / 2,
      botY + 84,
      '600 17px "Google Sans Flex", sans-serif',
      "#B0B8C4",
    );
  }

  // ================= TEMPLATE 4: RETRO 4-CUT PHOTOBOOTH =================
  function drawTemplateRetro() {
    // Cream vintage photo paper
    ctx.fillStyle = "#FAF8F5";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const pad = 64;
    const photoWindow = {
      x: pad,
      y: 110,
      width: CANVAS_SIZE - pad * 2,
      height: CANVAS_SIZE - 320,
      radius: 8,
    };

    // Draw user photo
    ctx.fillStyle = "#E8E4DF";
    ctx.fillRect(
      photoWindow.x,
      photoWindow.y,
      photoWindow.width,
      photoWindow.height,
    );
    drawUserPhoto(photoWindow);

    // Retro border line
    ctx.strokeStyle = "#3C4043";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      photoWindow.x,
      photoWindow.y,
      photoWindow.width,
      photoWindow.height,
    );

    // Top Header: 4 Google Color dots
    const dotColors = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];
    dotColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pad + 18 + i * 26, 62, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    drawGlowText(
      "GSA PHOTOBOOTH  •  JAKARTA 2026",
      CANVAS_SIZE / 2 + 30,
      63,
      'bold 22px "Google Sans Flex", sans-serif',
      "#202124",
    );

    // Lightbulb Sticker Top Right
    if (assets.heroBulb) {
      ctx.drawImage(
        assets.heroBulb,
        CANVAS_SIZE - pad - 65,
        34,
        56,
        56,
      );
    }

    // Bottom Handwritten style area
    const botY = CANVAS_SIZE - 175;

    drawGlowText(
      "GSA 26 Batch 2 Memories ✨",
      CANVAS_SIZE / 2,
      botY + 32,
      'bold 36px "Google Sans Flex", sans-serif',
      "#1F1F1F",
    );

    drawGlowText(
      "02 • 11 • 2026  |  LEAD • INNOVATE • INSPIRE",
      CANVAS_SIZE / 2,
      botY + 76,
      '600 20px "Google Sans Flex", sans-serif',
      "#5F6368",
    );

    // Tiny Barcode graphic bottom-right
    const barcodeX = CANVAS_SIZE - pad - 120;
    const barcodeY = botY + 98;
    ctx.fillStyle = "#202124";
    for (let i = 0; i < 28; i++) {
      const barW = i % 3 === 0 ? 3 : 1.5;
      ctx.fillRect(barcodeX + i * 4, barcodeY, barW, 20);
    }
  }

  // ================= TEMPLATE 5: STICKER MANIA GSA SQUAD =================
  function drawTemplateStickerMania() {
    // Dynamic dark surface
    ctx.fillStyle = "#12141A";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const pad = 54;
    const photoWindow = {
      x: pad,
      y: 110,
      width: CANVAS_SIZE - pad * 2,
      height: CANVAS_SIZE - 280,
      radius: 28,
    };

    drawUserPhoto(photoWindow);

    // Border around photo
    ctx.save();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(
      photoWindow.x,
      photoWindow.y,
      photoWindow.width,
      photoWindow.height,
      photoWindow.radius,
    );
    ctx.stroke();
    ctx.restore();

    // STICKER 1: Google Search Bar Mockup Top-Left
    drawPill(pad + 10, 36, 420, 52, "#FFFFFF", "rgba(0,0,0,0.12)", 2);
    if (assets.gLogo) {
      ctx.drawImage(assets.gLogo, pad + 24, 46, 32, 32);
    }
    drawGlowText(
      "cara jadi leader hebat... | 🔍",
      pad + 230,
      63,
      '600 16px "Google Sans Flex", sans-serif',
      "#3C4043",
    );

    // STICKER 2: "PROUD AMBASSADOR" Badge Top-Right
    drawPill(
      CANVAS_SIZE - pad - 240,
      36,
      240,
      52,
      "#34A853",
      "#FFFFFF",
      2.5,
    );
    drawGlowText(
      "★ PROUD GSA '26",
      CANVAS_SIZE - pad - 120,
      63,
      'bold 18px "Google Sans Flex", sans-serif',
      "#FFFFFF",
    );

    // STICKER 3: Hero Code Laptop Sticker Bottom-Right
    if (assets.heroCode) {
      ctx.save();
      ctx.translate(CANVAS_SIZE - pad - 60, photoWindow.y + photoWindow.height - 30);
      ctx.rotate(0.12);
      ctx.drawImage(assets.heroCode, -50, -50, 100, 100);
      ctx.restore();
    }

    // STICKER 4: Hero Bulb Sticker Bottom-Left
    if (assets.heroBulb) {
      ctx.save();
      ctx.translate(pad + 50, photoWindow.y + photoWindow.height - 30);
      ctx.rotate(-0.14);
      ctx.drawImage(assets.heroBulb, -45, -45, 90, 90);
      ctx.restore();
    }

    // Bottom Banner
    const botY = CANVAS_SIZE - 150;
    drawPill(
      pad,
      botY,
      CANVAS_SIZE - pad * 2,
      116,
      "#EA4335",
      "#FFFFFF",
      3,
    );

    drawGlowText(
      "#GSASQUAD2026 • WE ARE INAUGURATED!",
      CANVAS_SIZE / 2,
      botY + 38,
      'bold 34px "Google Sans Flex", sans-serif',
      "#FFFFFF",
      "center",
      "rgba(0,0,0,0.4)",
      6,
    );

    drawGlowText(
      "LEAD WITH PASSION  •  INNOVATE FOR IMPACT",
      CANVAS_SIZE / 2,
      botY + 80,
      '600 18px "Google Sans Flex", sans-serif',
      "#FFF2F0",
    );
  }

  // ================= TEMPLATE 6: OFFICIAL VIP DELEGATE PASS =================
  function drawTemplateVipPass() {
    ctx.fillStyle = "#11141C";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const pad = 60;
    const photoWindow = {
      x: pad,
      y: 120,
      width: CANVAS_SIZE - pad * 2,
      height: CANVAS_SIZE - 330,
      radius: 16,
    };

    drawUserPhoto(photoWindow);

    // Photo frame border
    ctx.strokeStyle = "rgba(66, 133, 244, 0.4)";
    ctx.lineWidth = 4;
    ctx.strokeRect(
      photoWindow.x,
      photoWindow.y,
      photoWindow.width,
      photoWindow.height,
    );

    // Lanyard Cutout Slot Top Center
    drawPill(CANVAS_SIZE / 2 - 50, 16, 100, 14, "#000000", "#4285F4", 2);

    // Top Header: Pass Credentials
    drawGlowText(
      "OFFICIAL DELEGATE  •  ALL-ACCESS PASS",
      CANVAS_SIZE / 2,
      60,
      'bold 22px "Google Sans Flex", sans-serif',
      "#8AB4F8",
    );

    drawGlowText(
      "GOOGLE STUDENT AMBASSADOR INDONESIA  •  BATCH 2",
      CANVAS_SIZE / 2,
      90,
      '600 16px "Google Sans Flex", sans-serif',
      "#E8EAED",
    );

    // Bottom Credentials Pass
    const botY = CANVAS_SIZE - 180;
    drawPill(
      pad,
      botY,
      CANVAS_SIZE - pad * 2,
      140,
      "rgba(20, 24, 34, 0.96)",
      "#4285F4",
      2,
    );

    // Decorative Hologram Accent line
    const holoGrad = ctx.createLinearGradient(
      pad,
      botY,
      CANVAS_SIZE - pad,
      botY,
    );
    holoGrad.addColorStop(0, "#4285F4");
    holoGrad.addColorStop(0.33, "#EA4335");
    holoGrad.addColorStop(0.66, "#FBBC04");
    holoGrad.addColorStop(1, "#34A853");
    ctx.fillStyle = holoGrad;
    ctx.fillRect(pad + 20, botY + 12, CANVAS_SIZE - pad * 2 - 40, 4);

    drawGlowText(
      "LEAD  •  COLLABORATE  •  INNOVATE",
      CANVAS_SIZE / 2,
      botY + 52,
      'bold 32px "Google Sans Flex", sans-serif',
      "#FFFFFF",
      "center",
      "#4285F4",
      8,
    );

    drawGlowText(
      "SERIAL: GSA-2026-B2-IDN  |  VENUE: MGP SPACE JAKARTA",
      CANVAS_SIZE / 2,
      botY + 95,
      '600 16px "Google Sans Flex", sans-serif',
      "#9AA0A6",
    );
  }

  // Placeholder when no photo loaded yet
  function drawPlaceholder() {
    ctx.fillStyle = "#181A20";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 4-color stripe
    drawGoogleStripe(0, 0, CANVAS_SIZE, 12);
    drawGoogleStripe(0, CANVAS_SIZE - 12, CANVAS_SIZE, 12);

    if (assets.gsaWordmark) {
      const wmAspect = assets.gsaWordmark.width / assets.gsaWordmark.height;
      const wmW = 420;
      const wmH = wmW / wmAspect;
      ctx.drawImage(
        assets.gsaWordmark,
        (CANVAS_SIZE - wmW) / 2,
        340,
        wmW,
        wmH,
      );
    }

    drawGlowText(
      "Virtual Photobooth & Twibbon",
      CANVAS_SIZE / 2,
      440,
      'bold 38px "Google Sans Flex", sans-serif',
      "#FFFFFF",
    );

    drawGlowText(
      "Buka Kamera atau Upload Foto untuk Memulai 📸",
      CANVAS_SIZE / 2,
      500,
      '24px "Google Sans Flex", sans-serif',
      "#9AA0A6",
    );

    // Feature chips
    drawGlowText(
      "LEAD  •  INNOVATE  •  INSPIRE",
      CANVAS_SIZE / 2,
      600,
      'bold 28px "Google Sans Flex", sans-serif',
      "#4285F4",
    );
  }

  // Main Canvas Render
  function renderCanvas() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (!userImage) {
      drawPlaceholder();
      return;
    }

    const tpl = templates[currentTemplateIndex];
    if (tpl && typeof tpl.draw === "function") {
      tpl.draw();
    } else {
      drawTemplateLeadInnovate();
    }
  }

  // Set user image from Image source
  function loadUserPhoto(img) {
    userImage = img;
    // Reset transforms
    photoState.panX = 0;
    photoState.panY = 0;
    photoState.scale = 1.0;
    photoState.rotation = 0;
    photoState.flipH = false;

    // Sync sliders
    if ($("pbZoomRange")) $("pbZoomRange").value = 1.0;
    if ($("pbZoomVal")) $("pbZoomVal").textContent = "100%";
    if ($("pbRotateRange")) $("pbRotateRange").value = 0;
    if ($("pbRotateVal")) $("pbRotateVal").textContent = "0°";

    // Show workspace
    if ($("pbSourcePicker")) $("pbSourcePicker").hidden = true;
    if ($("pbWorkspace")) $("pbWorkspace").hidden = false;

    renderCanvas();
    showToast("Foto berhasil dimuat! Geser atau ubah template sesukamu ✨");
  }

  // File Upload Handler
  const fileInput = $("pbFileInput");
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("Pilih file foto JPG, PNG, atau WebP.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => loadUserPhoto(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
      // Reset input value so same file can be re-selected if needed
      fileInput.value = "";
    });
  }

  // Camera Management
  const cameraOverlay = $("pbCameraOverlay");
  const cameraVideo = $("pbCameraVideo");
  const countdownEl = $("pbCountdownDisplay");
  const flashLayer = $("pbFlashLayer");

  async function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        "Kamera tidak didukung oleh browsermu. Silakan gunakan tombol 'Upload Foto'.",
      );
      return;
    }

    try {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }

      currentStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      cameraVideo.srcObject = currentStream;
      cameraOverlay.hidden = false;
      document.body.classList.add("pb-modal-open");
    } catch (err) {
      console.error("Camera error:", err);
      alert(
        "Gagal mengakses kamera. Pastikan izin kamera telah diberikan di pengaturan browser, atau gunakan tombol 'Upload Foto'.",
      );
    }
  }

  function closeCamera() {
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      currentStream = null;
    }
    if (cameraVideo) cameraVideo.srcObject = null;
    if (cameraOverlay) cameraOverlay.hidden = true;
    document.body.classList.remove("pb-modal-open");
  }

  // Countdown & Snapshot
  function takeSnapshotWithCountdown() {
    const shutterBtn = $("pbShutterBtn");
    if (shutterBtn) shutterBtn.disabled = true;

    countdownEl.hidden = false;
    let count = 3;
    countdownEl.textContent = count;

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownEl.textContent = count;
      } else {
        clearInterval(timer);
        countdownEl.hidden = true;

        // Flash visual animation
        if (flashLayer) {
          flashLayer.classList.remove("is-flashing");
          void flashLayer.offsetWidth; // Trigger reflow
          flashLayer.classList.add("is-flashing");
        }

        // Capture from video
        setTimeout(() => {
          const capCanvas = document.createElement("canvas");
          capCanvas.width = cameraVideo.videoWidth || 1080;
          capCanvas.height = cameraVideo.videoHeight || 1080;
          const capCtx = capCanvas.getContext("2d");

          // Mirror if front camera
          if (currentFacingMode === "user") {
            capCtx.translate(capCanvas.width, 0);
            capCtx.scale(-1, 1);
          }
          capCtx.drawImage(cameraVideo, 0, 0, capCanvas.width, capCanvas.height);

          const img = new Image();
          img.onload = () => {
            closeCamera();
            if (shutterBtn) shutterBtn.disabled = false;
            loadUserPhoto(img);
          };
          img.src = capCanvas.toDataURL("image/jpeg", 0.95);
        }, 150);
      }
    }, 850);
  }

  // Camera Buttons
  $("pbOpenCamBtn")?.addEventListener("click", openCamera);
  $("pbCloseCamBtn")?.addEventListener("click", closeCamera);
  $("pbCancelCamBtn")?.addEventListener("click", closeCamera);
  $("pbShutterBtn")?.addEventListener("click", takeSnapshotWithCountdown);

  $("pbSwitchCamBtn")?.addEventListener("click", () => {
    currentFacingMode =
      currentFacingMode === "user" ? "environment" : "user";
    openCamera();
  });

  // Retake / Change photo button
  $("pbRetakeBtn")?.addEventListener("click", () => {
    if ($("pbWorkspace")) $("pbWorkspace").hidden = true;
    if ($("pbSourcePicker")) $("pbSourcePicker").hidden = false;
  });

  // Drag & Pan photo on canvas
  const container = $("pbCanvasContainer");
  if (container) {
    container.addEventListener("pointerdown", (e) => {
      if (!userImage) return;
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
      container.setPointerCapture(e.pointerId);
      container.classList.add("is-dragging");
    });

    container.addEventListener("pointermove", (e) => {
      if (!isDragging || !userImage) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      dragStart = { x: e.clientX, y: e.clientY };

      // Sensitivity factor based on display size vs canvas 1080
      const rect = canvas.getBoundingClientRect();
      const ratio = CANVAS_SIZE / (rect.width || CANVAS_SIZE);

      photoState.panX += dx * ratio;
      photoState.panY += dy * ratio;
      renderCanvas();
    });

    const stopDrag = (e) => {
      if (isDragging) {
        isDragging = false;
        container.classList.remove("is-dragging");
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {}
      }
    };

    container.addEventListener("pointerup", stopDrag);
    container.addEventListener("pointercancel", stopDrag);
  }

  // Zoom Slider
  $("pbZoomRange")?.addEventListener("input", (e) => {
    photoState.scale = parseFloat(e.target.value);
    if ($("pbZoomVal"))
      $("pbZoomVal").textContent = `${Math.round(photoState.scale * 100)}%`;
    renderCanvas();
  });

  // Rotate Slider
  $("pbRotateRange")?.addEventListener("input", (e) => {
    photoState.rotation = parseInt(e.target.value, 10);
    if ($("pbRotateVal"))
      $("pbRotateVal").textContent = `${photoState.rotation}°`;
    renderCanvas();
  });

  // Flip Horizontal
  $("pbFlipBtn")?.addEventListener("click", () => {
    photoState.flipH = !photoState.flipH;
    renderCanvas();
  });

  // Rotate 90 degrees
  $("pbRotate90Btn")?.addEventListener("click", () => {
    photoState.rotation = (photoState.rotation + 90) % 360;
    if ($("pbRotateRange")) $("pbRotateRange").value = photoState.rotation;
    if ($("pbRotateVal"))
      $("pbRotateVal").textContent = `${photoState.rotation}°`;
    renderCanvas();
  });

  // Reset Transform
  $("pbResetTransformBtn")?.addEventListener("click", () => {
    photoState.panX = 0;
    photoState.panY = 0;
    photoState.scale = 1.0;
    photoState.rotation = 0;
    photoState.flipH = false;
    if ($("pbZoomRange")) $("pbZoomRange").value = 1.0;
    if ($("pbZoomVal")) $("pbZoomVal").textContent = "100%";
    if ($("pbRotateRange")) $("pbRotateRange").value = 0;
    if ($("pbRotateVal")) $("pbRotateVal").textContent = "0°";
    renderCanvas();
  });

  // Filter Pills
  $("pbFilterPills")?.addEventListener("click", (e) => {
    const pill = e.target.closest(".pb-filter-pill");
    if (!pill) return;
    document
      .querySelectorAll(".pb-filter-pill")
      .forEach((p) => p.classList.remove("is-active"));
    pill.classList.add("is-active");
    activeFilter = pill.dataset.filter || "normal";
    renderCanvas();
  });

  // Toast Notification Helper
  let toastTimer = null;
  function showToast(message) {
    const toast = $("pbToast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => (toast.hidden = true), 300);
    }, 3200);
  }

  // Download HD PNG
  $("pbDownloadBtn")?.addEventListener("click", () => {
    if (!userImage) return;
    const link = document.createElement("a");
    const tplName = templates[currentTemplateIndex]?.id || "photobooth";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    link.download = `GSA-2026-Batch2-${tplName}-${timestamp}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
    showToast("Foto photobooth berhasil diunduh! 📸");
  });

  // Copy Image to Clipboard
  $("pbCopyBtn")?.addEventListener("click", async () => {
    if (!userImage) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        canvas.toBlob(async (blob) => {
          if (!blob) throw new Error("blob failed");
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          showToast("Foto disalin ke clipboard! Siap dipaste ke IG/WA ✨");
        }, "image/png");
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch {
      // Fallback: download instead
      $("pbDownloadBtn")?.click();
    }
  });

  // Share to Community Gallery ("Bagikan ke Momen Teman")
  $("pbShareGalleryBtn")?.addEventListener("click", () => {
    if (!userImage) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      try {
        const file = new File([blob], "gsa-photobooth-moment.png", {
          type: "image/png",
        });
        const momentInput = $("momentImage");
        if (momentInput) {
          const dt = new DataTransfer();
          dt.items.add(file);
          momentInput.files = dt.files;
          momentInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const titleInput = $("momentTitle");
        if (titleInput && !titleInput.value) {
          titleInput.value = "GSA 2026 Batch 2 Photobooth 📸";
        }

        const tagsInput = $("momentTags");
        if (tagsInput && !tagsInput.value) {
          tagsInput.value = "Photobooth, Twibbon, Inagurasi";
        }

        const descInput = $("momentDescription");
        if (descInput && !descInput.value) {
          descInput.value = "Diambil dengan GSA Virtual Photobooth ✨";
        }

        // Open upload modal
        const uploadBtn = $("uploadMomentBtn");
        if (uploadBtn) {
          uploadBtn.click();
          showToast("Membuka form bagikan ke galeri teman... 🚀");
        }
      } catch (err) {
        console.error("Share error:", err);
        $("pbDownloadBtn")?.click();
      }
    }, "image/png");
  });
});
