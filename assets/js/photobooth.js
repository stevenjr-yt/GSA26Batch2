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

  // Template Definitions (Enhanced with Lighting & Real Web Assets)
  const templates = [
    {
      id: "lead-innovate",
      name: "Vanity Studio Lights 💡",
      tagline: "Lampu Bohlam Studio & GSA Official",
      badgeColor: "#FBBC04",
      draw: drawTemplateVanityStudio,
    },
    {
      id: "inauguration-night",
      name: "Inauguration Stage Lights ✨",
      tagline: "Lampu Sorot Panggung MGP Space",
      badgeColor: "#FFD700",
      draw: drawTemplateStageLights,
    },
    {
      id: "gemini-future",
      name: "Neon Google & Gemini Glow ⚡",
      tagline: "Lampu Neon 4-Warna & AI Sparkle",
      badgeColor: "#00E5FF",
      draw: drawTemplateNeonGemini,
    },
    {
      id: "all-assets-3d",
      name: "3D Iconic Assets Mania 🚀",
      tagline: "Hero Bulb, Code, Sparkle & Logo",
      badgeColor: "#4285F4",
      draw: drawTemplate3DAssetsMania,
    },
    {
      id: "retro-photobooth",
      name: "Retro K-Photobooth Strip 📸",
      tagline: "Bohlam Hangat & Kenangan Batch 2",
      badgeColor: "#EA4335",
      draw: drawTemplateRetroStrip,
    },
    {
      id: "vip-pass",
      name: "Hologram VIP Delegate Pass 🪪",
      tagline: "Efek Kilau Lampu All-Access",
      badgeColor: "#34A853",
      draw: drawTemplateVipPassHolo,
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
        "pb-template-card" +
        (index === currentTemplateIndex ? " is-active" : "");
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

    const centerX = windowRect
      ? windowRect.x + windowRect.width / 2 + photoState.panX
      : CANVAS_SIZE / 2 + photoState.panX;
    const centerY = windowRect
      ? windowRect.y + windowRect.height / 2 + photoState.panY
      : CANVAS_SIZE / 2 + photoState.panY;

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

  // ================= LIGHTING EFFECT HELPERS =================

  // Realistic illuminated photobooth vanity bulb
  function drawVanityBulb(x, y, radius = 10, isLit = true) {
    ctx.save();
    if (isLit) {
      // 1. Warm diffuse ambient glow
      const glow = ctx.createRadialGradient(
        x,
        y,
        radius * 0.4,
        x,
        y,
        radius * 3.6,
      );
      glow.addColorStop(0, "rgba(255, 240, 160, 0.95)");
      glow.addColorStop(0.35, "rgba(255, 205, 75, 0.45)");
      glow.addColorStop(0.7, "rgba(255, 175, 50, 0.15)");
      glow.addColorStop(1, "rgba(255, 175, 50, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 3.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Bulb socket base
    ctx.fillStyle = "#181a20";
    ctx.beginPath();
    ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Pearlescent bulb glass gradient
    const bulbGrad = ctx.createRadialGradient(
      x - radius * 0.3,
      y - radius * 0.3,
      radius * 0.1,
      x,
      y,
      radius,
    );
    if (isLit) {
      bulbGrad.addColorStop(0, "#FFFFFF");
      bulbGrad.addColorStop(0.3, "#FFFBE6");
      bulbGrad.addColorStop(0.7, "#FFD666");
      bulbGrad.addColorStop(1, "#FF9C1A");
    } else {
      bulbGrad.addColorStop(0, "#aaaaaa");
      bulbGrad.addColorStop(1, "#333333");
    }
    ctx.fillStyle = bulbGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // 4. White hot core highlight
    if (isLit) {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(
        x - radius * 0.28,
        y - radius * 0.28,
        radius * 0.32,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw perimeter of vanity bulbs around a rectangle
  function drawVanityPerimeter(x, y, w, h, countX = 14, countY = 14) {
    const stepX = w / (countX - 1);
    const stepY = h / (countY - 1);

    // Top & Bottom edges
    for (let i = 0; i < countX; i++) {
      drawVanityBulb(x + i * stepX, y, 10, true);
      drawVanityBulb(x + i * stepX, y + h, 10, true);
    }
    // Left & Right edges (excluding corners already drawn)
    for (let j = 1; j < countY - 1; j++) {
      drawVanityBulb(x, y + j * stepY, 10, true);
      drawVanityBulb(x + w, y + j * stepY, 10, true);
    }
  }

  // Draw stage spotlight light beams
  function drawStageSpotlights(w, h) {
    ctx.save();
    const beams = [
      {
        sourceX: w * 0.18,
        targetX: w * 0.38,
        color: "rgba(66, 133, 244, 0.22)",
      },
      {
        sourceX: w * 0.5,
        targetX: w * 0.5,
        color: "rgba(255, 230, 120, 0.26)",
      },
      {
        sourceX: w * 0.82,
        targetX: w * 0.62,
        color: "rgba(234, 67, 53, 0.22)",
      },
    ];

    beams.forEach((beam) => {
      const grad = ctx.createLinearGradient(beam.sourceX, 0, beam.targetX, h);
      grad.addColorStop(0, beam.color);
      grad.addColorStop(0.7, "rgba(255, 255, 255, 0.05)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(beam.sourceX - 25, 0);
      ctx.lineTo(beam.sourceX + 25, 0);
      ctx.lineTo(beam.targetX + 280, h);
      ctx.lineTo(beam.targetX - 280, h);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  // Draw glowing neon tube line
  function drawNeonTube(x1, y1, x2, y2, color, blur = 20, thick = 6) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.lineWidth = thick;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // White electric core
    ctx.strokeStyle = "#FFFFFF";
    ctx.shadowBlur = 4;
    ctx.lineWidth = thick * 0.35;
    ctx.stroke();
    ctx.restore();
  }

  // Helper: Draw text with shadow/glow
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

  // Draw 3D Asset with circular glowing halo
  function drawAssetWithGlow(img, x, y, size, glowColor = "rgba(255,215,0,0.5)") {
    if (!img) return;
    ctx.save();
    const halo = ctx.createRadialGradient(
      x + size / 2,
      y + size / 2,
      size * 0.1,
      x + size / 2,
      y + size / 2,
      size * 0.75,
    );
    halo.addColorStop(0, glowColor);
    halo.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size * 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  }

  // ================= TEMPLATE 1: VANITY STUDIO LIGHTS (BOHLAM MENYALA) =================
  function drawTemplateVanityStudio() {
    const pad = 64;
    const photoWindow = {
      x: pad + 16,
      y: 125,
      width: CANVAS_SIZE - (pad + 16) * 2,
      height: CANVAS_SIZE - 315,
      radius: 18,
    };

    // Deep studio charcoal backdrop
    ctx.fillStyle = "#101115";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw user photo
    drawUserPhoto(photoWindow);

    // Inner gold bevel around photo window
    ctx.save();
    ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(
      photoWindow.x - 2,
      photoWindow.y - 2,
      photoWindow.width + 4,
      photoWindow.height + 4,
      photoWindow.radius,
    );
    ctx.stroke();
    ctx.restore();

    // PERIMETER VANITY BULB LIGHTS (Lampu Bohlam Studio Menyala)
    drawVanityPerimeter(pad - 12, 36, CANVAS_SIZE - (pad - 12) * 2, CANVAS_SIZE - 72, 16, 16);

    // Top Header: Sleek dark glass with GSA Wordmark & Google G Logo
    const headerW = CANVAS_SIZE - (pad + 24) * 2;
    drawPill(
      pad + 24,
      50,
      headerW,
      64,
      "rgba(18, 19, 24, 0.94)",
      "rgba(255, 215, 0, 0.35)",
      2,
    );

    // Google G Logo (Left)
    if (assets.gLogo) {
      ctx.drawImage(assets.gLogo, pad + 38, 56, 50, 50);
    }

    // GSA Wordmark (Center)
    if (assets.gsaWordmark) {
      const wmW = 340;
      const wmAspect = assets.gsaWordmark.width / assets.gsaWordmark.height;
      const wmH = wmW / wmAspect;
      ctx.drawImage(
        assets.gsaWordmark,
        (CANVAS_SIZE - wmW) / 2,
        50 + (64 - wmH) / 2,
        wmW,
        wmH,
      );
    }

    // 3D Hero Bulb Asset (Right with bright warm rays)
    if (assets.heroBulb) {
      drawAssetWithGlow(
        assets.heroBulb,
        CANVAS_SIZE - pad - 96,
        42,
        74,
        "rgba(255, 215, 0, 0.6)",
      );
    }

    // Bottom Banner: Lead Innovate Inspire Plaque
    const botY = CANVAS_SIZE - 176;
    drawPill(
      pad + 20,
      botY,
      CANVAS_SIZE - (pad + 20) * 2,
      126,
      "rgba(15, 17, 23, 0.96)",
      "rgba(255, 255, 255, 0.2)",
      2,
    );

    // 4-Color glowing accent bar on bottom banner
    drawGoogleStripe(pad + 40, botY, CANVAS_SIZE - (pad + 20) * 2 - 40, 5);

    // Main Slogan
    drawGlowText(
      "LEAD  •  INNOVATE  •  INSPIRE",
      CANVAS_SIZE / 2,
      botY + 44,
      'bold 36px "Google Sans Flex", sans-serif',
      "#FFFFFF",
      "center",
      "rgba(255, 215, 0, 0.7)",
      14,
    );

    // Subtitle
    drawGlowText(
      "GOOGLE STUDENT AMBASSADOR  •  2026 BATCH 2 INAUGURATION",
      CANVAS_SIZE / 2,
      botY + 86,
      '600 18px "Google Sans Flex", sans-serif',
      "#E2E8F0",
    );
  }

  // ================= TEMPLATE 2: INAUGURATION STAGE LIGHTS (PANGGUNG & LAMPU SOROT) =================
  function drawTemplateStageLights() {
    const pad = 54;
    const photoWindow = {
      x: pad,
      y: 110,
      width: CANVAS_SIZE - pad * 2,
      height: CANVAS_SIZE - 295,
      radius: 16,
    };

    // Midnight auditorium atmosphere
    ctx.fillStyle = "#080c14";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw user photo
    drawUserPhoto(photoWindow);

    // REAL STAGE LIGHT BEAMS (Lampu Sorot Panggung MGP Space)
    drawStageSpotlights(CANVAS_SIZE, CANVAS_SIZE);

    // Golden Varsity piping frame
    ctx.save();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 6;
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.roundRect(
      photoWindow.x - 2,
      photoWindow.y - 2,
      photoWindow.width + 4,
      photoWindow.height + 4,
      20,
    );
    ctx.stroke();

    // Secondary varsity white border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.roundRect(
      photoWindow.x - 10,
      photoWindow.y - 10,
      photoWindow.width + 20,
      photoWindow.height + 20,
      24,
    );
    ctx.stroke();
    ctx.restore();

    // Top Header: Stage Marquee
    drawPill(
      (CANVAS_SIZE - 560) / 2,
      30,
      560,
      58,
      "rgba(8, 12, 20, 0.95)",
      "#FFD700",
      2,
    );

    drawGlowText(
      "★  OFFICIALLY INAUGURATED  ★",
      CANVAS_SIZE / 2,
      58,
      'bold 24px "Google Sans Flex", sans-serif',
      "#FFD700",
      "center",
      "#FFD700",
      12,
    );

    // 3D Gemini Sparkle (Top-Right)
    if (assets.geminiSparkle) {
      drawAssetWithGlow(
        assets.geminiSparkle,
        CANVAS_SIZE - pad - 72,
        22,
        74,
        "rgba(255, 215, 0, 0.7)",
      );
    }

    // Google G Logo (Top-Left)
    if (assets.gLogo) {
      drawAssetWithGlow(
        assets.gLogo,
        pad + 8,
        28,
        60,
        "rgba(66, 133, 244, 0.6)",
      );
    }

    // Bottom Stage Plaque
    const plaqueY = CANVAS_SIZE - 170;
    drawPill(
      pad,
      plaqueY,
      CANVAS_SIZE - pad * 2,
      132,
      "rgba(10, 14, 24, 0.96)",
      "rgba(255, 215, 0, 0.5)",
      2.5,
    );

    // GSA Wordmark inside bottom plaque
    if (assets.gsaWordmark) {
      const wmW = 280;
      const wmAspect = assets.gsaWordmark.width / assets.gsaWordmark.height;
      const wmH = wmW / wmAspect;
      ctx.drawImage(
        assets.gsaWordmark,
        (CANVAS_SIZE - wmW) / 2,
        plaqueY + 12,
        wmW,
        wmH,
      );
    }

    drawGlowText(
      "GSA 2026 BATCH 2 DELEGATE",
      CANVAS_SIZE / 2,
      plaqueY + 68,
      'bold 34px "Google Sans Flex", sans-serif',
      "#FFFFFF",
      "center",
      "#FFD700",
      10,
    );

    drawGlowText(
      "MGP SPACE, JAKARTA  •  FROM CAMPUS TO COMMUNITY LEADERS",
      CANVAS_SIZE / 2,
      plaqueY + 104,
      '600 17px "Google Sans Flex", sans-serif',
      "#E2E8F0",
    );
  }

  // ================= TEMPLATE 3: NEON GOOGLE & GEMINI GLOW (LAMPU NEON 4-WARNA) =================
  function drawTemplateNeonGemini() {
    const pad = 52;
    const photoWindow = {
      x: pad,
      y: 115,
      width: CANVAS_SIZE - pad * 2,
      height: CANVAS_SIZE - 295,
      radius: 20,
    };

    // Dark cyber aesthetic
    ctx.fillStyle = "#07080d";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    drawUserPhoto(photoWindow);

    // REAL NEON TUBES (4 Google Colors Glowing around the photo)
    const pw = photoWindow;
    // Top border: Neon Blue
    drawNeonTube(pw.x, pw.y, pw.x + pw.width, pw.y, "#4285F4", 22, 6);
    // Right border: Neon Red
    drawNeonTube(
      pw.x + pw.width,
      pw.y,
      pw.x + pw.width,
      pw.y + pw.height,
      "#EA4335",
      22,
      6,
    );
    // Bottom border: Neon Yellow
    drawNeonTube(
      pw.x + pw.width,
      pw.y + pw.height,
      pw.x,
      pw.y + pw.height,
      "#FBBC04",
      22,
      6,
    );
    // Left border: Neon Green
    drawNeonTube(pw.x, pw.y + pw.height, pw.x, pw.y, "#34A853", 22, 6);

    // Top Header: Neon Pill
    drawPill(
      pad,
      32,
      CANVAS_SIZE - pad * 2,
      64,
      "rgba(10, 12, 20, 0.92)",
      "#8E75FF",
      2,
    );

    // GSA Wordmark (Left/Center)
    if (assets.gsaWordmark) {
      const wmW = 300;
      const wmAspect = assets.gsaWordmark.width / assets.gsaWordmark.height;
      const wmH = wmW / wmAspect;
      ctx.drawImage(
        assets.gsaWordmark,
        pad + 28,
        32 + (64 - wmH) / 2,
        wmW,
        wmH,
      );
    }

    drawGlowText(
      "⚡ BATCH 2 • AI & TECH",
      CANVAS_SIZE - pad - 170,
      64,
      'bold 20px "Google Sans Flex", sans-serif',
      "#00E5FF",
      "center",
      "#00E5FF",
      12,
    );

    // Big 3D Gemini Sparkle Asset (Top-Right Glowing)
    if (assets.geminiSparkle) {
      drawAssetWithGlow(
        assets.geminiSparkle,
        CANVAS_SIZE - pad - 72,
        18,
        88,
        "rgba(142, 117, 255, 0.75)",
      );
    }

    // Bottom Neon Panel
    const botY = CANVAS_SIZE - 165;
    drawPill(
      pad,
      botY,
      CANVAS_SIZE - pad * 2,
      125,
      "rgba(8, 10, 16, 0.95)",
      "#00E5FF",
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
      16,
    );

    drawGlowText(
      "EMPOWERING CAMPUS COMMUNITIES THROUGH TECHNOLOGY",
      CANVAS_SIZE / 2,
      botY + 84,
      '600 18px "Google Sans Flex", sans-serif',
      "#D0D8E8",
    );
  }

  // ================= TEMPLATE 4: 3D ICONIC ASSETS MANIA (SEMUA ASET ASLI WEB) =================
  function drawTemplate3DAssetsMania() {
    const pad = 58;
    const photoWindow = {
      x: pad,
      y: 120,
      width: CANVAS_SIZE - pad * 2,
      height: CANVAS_SIZE - 305,
      radius: 24,
    };

    // Dark sleek background
    ctx.fillStyle = "#12141c";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    drawUserPhoto(photoWindow);

    // Multi-color rounded outline
    ctx.save();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 5;
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

    // Top Header: Center GSA Wordmark
    drawPill(
      (CANVAS_SIZE - 540) / 2,
      30,
      540,
      68,
      "rgba(18, 20, 28, 0.95)",
      "rgba(255, 255, 255, 0.2)",
      2,
    );

    if (assets.gsaWordmark) {
      const wmW = 340;
      const wmAspect = assets.gsaWordmark.width / assets.gsaWordmark.height;
      const wmH = wmW / wmAspect;
      ctx.drawImage(
        assets.gsaWordmark,
        (CANVAS_SIZE - wmW) / 2,
        30 + (68 - wmH) / 2,
        wmW,
        wmH,
      );
    }

    // 1. 3D HERO BULB (Lampu Bohlam Ide) - Top Left
    if (assets.heroBulb) {
      drawAssetWithGlow(
        assets.heroBulb,
        pad - 25,
        18,
        96,
        "rgba(255, 200, 50, 0.75)",
      );
    }

    // 2. 3D GEMINI SPARKLE (Bintang AI Sparkle) - Top Right
    if (assets.geminiSparkle) {
      drawAssetWithGlow(
        assets.geminiSparkle,
        CANVAS_SIZE - pad - 75,
        18,
        96,
        "rgba(142, 117, 255, 0.75)",
      );
    }

    // 3. 3D HERO CODE (Laptop & Code Brackets) - Bottom Right Corner
    if (assets.heroCode) {
      drawAssetWithGlow(
        assets.heroCode,
        CANVAS_SIZE - pad - 80,
        photoWindow.y + photoWindow.height - 55,
        105,
        "rgba(66, 133, 244, 0.65)",
      );
    }

    // 4. GOOGLE G LOGO - Bottom Left Corner
    if (assets.gLogo) {
      drawAssetWithGlow(
        assets.gLogo,
        pad - 15,
        photoWindow.y + photoWindow.height - 50,
        80,
        "rgba(52, 168, 83, 0.55)",
      );
    }

    // Bottom Banner: Slogan & Squad 2026
    const botY = CANVAS_SIZE - 165;
    drawPill(
      pad,
      botY,
      CANVAS_SIZE - pad * 2,
      125,
      "#196ac9",
      "#FFFFFF",
      2.5,
    );

    drawGlowText(
      "LEAD • INNOVATE • EMPOWER",
      CANVAS_SIZE / 2,
      botY + 40,
      'bold 36px "Google Sans Flex", sans-serif',
      "#FFFFFF",
      "center",
      "rgba(0, 0, 0, 0.5)",
      8,
    );

    drawGlowText(
      "#GSASQUAD2026  •  FROM CAMPUS TO COMMUNITY LEADERS",
      CANVAS_SIZE / 2,
      botY + 84,
      '600 18px "Google Sans Flex", sans-serif',
      "#E8F0FE",
    );
  }

  // ================= TEMPLATE 5: RETRO K-PHOTOBOOTH STRIP (BOHLAM HANGAT) =================
  function drawTemplateRetroStrip() {
    // Warm vintage photo paper
    ctx.fillStyle = "#FAF8F5";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const pad = 64;
    const photoWindow = {
      x: pad,
      y: 110,
      width: CANVAS_SIZE - pad * 2,
      height: CANVAS_SIZE - 315,
      radius: 10,
    };

    drawUserPhoto(photoWindow);

    // Retro clean border
    ctx.strokeStyle = "#202124";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      photoWindow.x,
      photoWindow.y,
      photoWindow.width,
      photoWindow.height,
    );

    // Warm Fairy Lights across top border
    const bulbCount = 12;
    const bulbStep = (CANVAS_SIZE - pad * 2) / (bulbCount - 1);
    for (let i = 0; i < bulbCount; i++) {
      drawVanityBulb(pad + i * bulbStep, 40, 7, true);
    }

    // Top Header: GSA Wordmark & Google G
    if (assets.gsaWordmark) {
      const wmW = 300;
      const wmAspect = assets.gsaWordmark.width / assets.gsaWordmark.height;
      const wmH = wmW / wmAspect;
      ctx.drawImage(
        assets.gsaWordmark,
        (CANVAS_SIZE - wmW) / 2,
        60,
        wmW,
        wmH,
      );
    }

    if (assets.gLogo) {
      ctx.drawImage(assets.gLogo, pad + 15, 60, 36, 36);
    }

    // 3D Hero Bulb Sticker on Corner
    if (assets.heroBulb) {
      ctx.drawImage(
        assets.heroBulb,
        CANVAS_SIZE - pad - 60,
        50,
        56,
        56,
      );
    }

    // Bottom Handwritten style area
    const botY = CANVAS_SIZE - 175;

    drawGlowText(
      "GSA 26 Batch 2 Memories ✨",
      CANVAS_SIZE / 2,
      botY + 36,
      'bold 38px "Google Sans Flex", sans-serif',
      "#1F1F1F",
    );

    drawGlowText(
      "02 • 11 • 2026  |  LEAD • INNOVATE • INSPIRE",
      CANVAS_SIZE / 2,
      botY + 80,
      '600 20px "Google Sans Flex", sans-serif',
      "#5F6368",
    );

    // Barcode detail bottom right
    const barcodeX = CANVAS_SIZE - pad - 130;
    const barcodeY = botY + 104;
    ctx.fillStyle = "#202124";
    for (let i = 0; i < 30; i++) {
      const barW = i % 3 === 0 ? 3 : 1.5;
      ctx.fillRect(barcodeX + i * 4, barcodeY, barW, 18);
    }
  }

  // ================= TEMPLATE 6: HOLOGRAM VIP DELEGATE PASS =================
  function drawTemplateVipPassHolo() {
    ctx.fillStyle = "#0c0e14";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const pad = 58;
    const photoWindow = {
      x: pad,
      y: 120,
      width: CANVAS_SIZE - pad * 2,
      height: CANVAS_SIZE - 325,
      radius: 16,
    };

    drawUserPhoto(photoWindow);

    // Shimmering Hologram border around photo
    const holoGrad = ctx.createLinearGradient(
      pad,
      120,
      CANVAS_SIZE - pad,
      CANVAS_SIZE - 200,
    );
    holoGrad.addColorStop(0, "#4285F4");
    holoGrad.addColorStop(0.33, "#EA4335");
    holoGrad.addColorStop(0.66, "#FBBC04");
    holoGrad.addColorStop(1, "#34A853");

    ctx.save();
    ctx.strokeStyle = holoGrad;
    ctx.lineWidth = 5;
    ctx.shadowColor = "#4285F4";
    ctx.shadowBlur = 12;
    ctx.strokeRect(
      photoWindow.x,
      photoWindow.y,
      photoWindow.width,
      photoWindow.height,
    );
    ctx.restore();

    // Lanyard punch hole
    drawPill(CANVAS_SIZE / 2 - 50, 16, 100, 14, "#000000", "#4285F4", 2);

    // Top Header: Pass Credentials with GSA Wordmark
    if (assets.gsaWordmark) {
      const wmW = 320;
      const wmAspect = assets.gsaWordmark.width / assets.gsaWordmark.height;
      const wmH = wmW / wmAspect;
      ctx.drawImage(
        assets.gsaWordmark,
        (CANVAS_SIZE - wmW) / 2,
        42,
        wmW,
        wmH,
      );
    }

    drawGlowText(
      "ALL-ACCESS DELEGATE PASS  •  BATCH 2",
      CANVAS_SIZE / 2,
      94,
      'bold 18px "Google Sans Flex", sans-serif',
      "#8AB4F8",
    );

    // Google G Logo (Top Left)
    if (assets.gLogo) {
      ctx.drawImage(assets.gLogo, pad + 10, 42, 48, 48);
    }

    // 3D Gemini Sparkle (Top Right)
    if (assets.geminiSparkle) {
      drawAssetWithGlow(
        assets.geminiSparkle,
        CANVAS_SIZE - pad - 60,
        34,
        64,
        "rgba(66, 133, 244, 0.6)",
      );
    }

    // Bottom Credentials Plaque
    const botY = CANVAS_SIZE - 175;
    drawPill(
      pad,
      botY,
      CANVAS_SIZE - pad * 2,
      135,
      "rgba(14, 17, 26, 0.96)",
      "#4285F4",
      2,
    );

    // Shimmering Hologram strip
    ctx.fillStyle = holoGrad;
    ctx.fillRect(pad + 20, botY + 12, CANVAS_SIZE - pad * 2 - 40, 4);

    drawGlowText(
      "LEAD  •  COLLABORATE  •  INNOVATE",
      CANVAS_SIZE / 2,
      botY + 50,
      'bold 34px "Google Sans Flex", sans-serif',
      "#FFFFFF",
      "center",
      "#4285F4",
      10,
    );

    drawGlowText(
      "OFFICIAL CREDENTIAL: GSA-2026-B2-IDN  |  MGP SPACE JAKARTA",
      CANVAS_SIZE / 2,
      botY + 92,
      '600 17px "Google Sans Flex", sans-serif',
      "#9AA0A6",
    );
  }

  // Placeholder when no photo loaded yet
  function drawPlaceholder() {
    ctx.fillStyle = "#12141a";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw vanity bulbs on placeholder
    drawVanityPerimeter(36, 36, CANVAS_SIZE - 72, CANVAS_SIZE - 72, 14, 14);

    if (assets.gsaWordmark) {
      const wmAspect = assets.gsaWordmark.width / assets.gsaWordmark.height;
      const wmW = 440;
      const wmH = wmW / wmAspect;
      ctx.drawImage(
        assets.gsaWordmark,
        (CANVAS_SIZE - wmW) / 2,
        330,
        wmW,
        wmH,
      );
    }

    // 3D Assets on placeholder
    if (assets.heroBulb) {
      drawAssetWithGlow(
        assets.heroBulb,
        CANVAS_SIZE / 2 - 170,
        180,
        110,
        "rgba(255, 215, 0, 0.6)",
      );
    }
    if (assets.geminiSparkle) {
      drawAssetWithGlow(
        assets.geminiSparkle,
        CANVAS_SIZE / 2 + 60,
        180,
        110,
        "rgba(142, 117, 255, 0.6)",
      );
    }

    drawGlowText(
      "Virtual Photobooth & Twibbon",
      CANVAS_SIZE / 2,
      440,
      'bold 40px "Google Sans Flex", sans-serif',
      "#FFFFFF",
      "center",
      "rgba(66, 133, 244, 0.8)",
      16,
    );

    drawGlowText(
      "Buka Kamera atau Upload Foto untuk Memulai 📸",
      CANVAS_SIZE / 2,
      505,
      '24px "Google Sans Flex", sans-serif',
      "#9AA0A6",
    );

    drawGlowText(
      "LEAD  •  INNOVATE  •  INSPIRE",
      CANVAS_SIZE / 2,
      610,
      'bold 30px "Google Sans Flex", sans-serif',
      "#FFD700",
      "center",
      "#FFD700",
      12,
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
      drawTemplateVanityStudio();
    }
  }

  // Set user image from Image source
  function loadUserPhoto(img) {
    userImage = img;
    photoState.panX = 0;
    photoState.panY = 0;
    photoState.scale = 1.0;
    photoState.rotation = 0;
    photoState.flipH = false;

    if ($("pbZoomRange")) $("pbZoomRange").value = 1.0;
    if ($("pbZoomVal")) $("pbZoomVal").textContent = "100%";
    if ($("pbRotateRange")) $("pbRotateRange").value = 0;
    if ($("pbRotateVal")) $("pbRotateVal").textContent = "0°";

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
        "Gagal mengakses kamera. Pastikan izin kamera telah diberikan di browser, atau gunakan tombol 'Upload Foto'.",
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

        if (flashLayer) {
          flashLayer.classList.remove("is-flashing");
          void flashLayer.offsetWidth;
          flashLayer.classList.add("is-flashing");
        }

        setTimeout(() => {
          const capCanvas = document.createElement("canvas");
          capCanvas.width = cameraVideo.videoWidth || 1080;
          capCanvas.height = cameraVideo.videoHeight || 1080;
          const capCtx = capCanvas.getContext("2d");

          if (currentFacingMode === "user") {
            capCtx.translate(capCanvas.width, 0);
            capCtx.scale(-1, 1);
          }
          capCtx.drawImage(
            cameraVideo,
            0,
            0,
            capCanvas.width,
            capCanvas.height,
          );

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

  $("pbOpenCamBtn")?.addEventListener("click", openCamera);
  $("pbCloseCamBtn")?.addEventListener("click", closeCamera);
  $("pbCancelCamBtn")?.addEventListener("click", closeCamera);
  $("pbShutterBtn")?.addEventListener("click", takeSnapshotWithCountdown);

  $("pbSwitchCamBtn")?.addEventListener("click", () => {
    currentFacingMode =
      currentFacingMode === "user" ? "environment" : "user";
    openCamera();
  });

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

  // Toast Notification
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
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
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
