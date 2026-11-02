// Menfess & Photo Reactions System for GSA 2026 Batch 2
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  let reactionsState = {
    counts: {},
    userReacts: {},
    reviews: {},
  };
  let currentAuthorId = null;
  let currentSavedName = localStorage.getItem("gsa_saved_name") || "";

  // ==================== 1. MENFESS SYSTEM ====================
  const menfessGrid = $("menfessGrid");
  const menfessForm = $("menfessForm");
  const menfessRecipientInput = $("menfessRecipient");
  const btnPresetAllGeneral = $("btnPresetAllGeneral");
  const menfessSenderContainer = $("menfessSenderContainer");
  const menfessSenderInput = $("menfessSender");
  const menfessStatus = $("menfessStatus");
  const menfessCountBadge = $("menfessCountBadge");

  // Pre-fill name if available
  if (menfessSenderInput && currentSavedName) {
    menfessSenderInput.value = currentSavedName;
  }

  // Preset All General button click
  if (btnPresetAllGeneral && menfessRecipientInput) {
    btnPresetAllGeneral.addEventListener("click", () => {
      menfessRecipientInput.value = "All General";
      menfessRecipientInput.focus();
    });
  }

  // Toggle sender name input visibility
  document.querySelectorAll('input[name="menfessIdentity"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "named") {
        menfessSenderContainer.hidden = false;
        menfessSenderInput.focus();
      } else {
        menfessSenderContainer.hidden = true;
      }
    });
  });

  function formatRelativeTime(isoString) {
    try {
      const date = new Date(isoString);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 60) return "Baru saja";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Hari ini";
    }
  }

  function renderMenfessCard(item) {
    const card = document.createElement("article");
    card.className = `menfess-card theme-${item.color || "blue"}`;
    card.id = `menfess-${item.id}`;

    const colorPills = {
      blue: "#3186ff",
      red: "#ea4335",
      yellow: "#fbbc04",
      green: "#34a853",
      purple: "#a855f7",
    };

    const isAdmin = item.role === "admin" || (item.senderName && item.senderName.toLowerCase() === "admin");
    const isAnon = !isAdmin && (Boolean(item.isAnonymous) || !item.senderName || item.senderName.includes("Anonim"));
    const senderDisplay = isAdmin ? "Admin" : (isAnon ? "Anonim 🕶️" : item.senderName);
    const accentColor = isAdmin ? "#fbbc04" : (colorPills[item.color] || colorPills.blue);
    const recipientDisplay = (item.recipient || "All General").trim();
    const isAllGeneral = recipientDisplay.toLowerCase().includes("all general") || recipientDisplay.toLowerCase() === "all";

    let badgeHtml = "";
    if (isAdmin) {
      badgeHtml = `<span class="menfess-badge badge-admin">Admin 🛡️</span>`;
    } else if (isAnon) {
      badgeHtml = `<span class="menfess-badge badge-anon">Secret Ambassador</span>`;
    } else {
      badgeHtml = `<span class="menfess-badge badge-named">Delegasi GSA</span>`;
    }

    const avatarSymbol = isAdmin ? "👑" : (isAnon ? "🕶️" : item.senderName.charAt(0).toUpperCase());

    card.innerHTML = `
      <div class="menfess-card-header">
        <div class="menfess-sender-info">
          <span class="menfess-avatar" style="background: ${accentColor}25; color: ${accentColor};">
            ${avatarSymbol}
          </span>
          <div>
            <strong class="menfess-sender-name">${senderDisplay}</strong>
            ${badgeHtml}
          </div>
        </div>
        <time class="menfess-time" datetime="${item.createdAt}">${formatRelativeTime(item.createdAt)}</time>
      </div>
      <div class="menfess-recipient-tag">
        <span class="recipient-label">To:</span>
        <span class="recipient-badge ${isAllGeneral ? "recipient-general" : "recipient-person"}">
          ${isAllGeneral ? "🌐 All General" : `🎯 ${escapeHtml(recipientDisplay)}`}
        </span>
      </div>
      <p class="menfess-message">${escapeHtml(item.message)}</p>
      <div class="menfess-card-footer">
        <span class="menfess-tag">#GSA2026Batch2</span>
      </div>
    `;
    return card;
  }

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function loadMenfess() {
    if (!menfessGrid) return;
    try {
      const res = await fetch("/api/menfess", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Gagal memuat menfess (Status: ${res.status})`);
      }
      const data = await res.json();
      if (data.savedName && !currentSavedName) {
        currentSavedName = data.savedName;
        localStorage.setItem("gsa_saved_name", data.savedName);
        if (menfessSenderInput) menfessSenderInput.value = data.savedName;
      }
      if (data.authorId) currentAuthorId = data.authorId;

      menfessGrid.innerHTML = "";
      if (data.items && data.items.length > 0) {
        data.items.forEach((item) => {
          menfessGrid.appendChild(renderMenfessCard(item));
        });
        if (menfessCountBadge) menfessCountBadge.textContent = `${data.items.length} pesan`;
      } else {
        menfessGrid.innerHTML = `
          <div class="menfess-empty">
            <span class="menfess-empty-icon">💌</span>
            <p>Belum ada menfess yang dikirim.</p>
            <small>Jadilah yang pertama menulis pesan atau salam kenangan untuk sesama delegasi GSA Batch 2!</small>
          </div>
        `;
        if (menfessCountBadge) menfessCountBadge.textContent = "0 pesan";
      }
    } catch (err) {
      console.warn("Failed to load menfess:", err);
      if (menfessCountBadge) menfessCountBadge.textContent = "Belum ada pesan";
    }
  }

  if (menfessForm) {
    menfessForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = $("menfessText").value.trim();
      if (!message) return;

      const recipient = (menfessRecipientInput?.value || "All General").trim() || "All General";
      const identityChoice = document.querySelector('input[name="menfessIdentity"]:checked')?.value;
      const isAnonymous = identityChoice === "anon";
      const senderName = isAnonymous ? "" : menfessSenderInput.value.trim();
      const color = document.querySelector('input[name="menfessColor"]:checked')?.value || "blue";

      const submitBtn = $("sendMenfessBtn");
      submitBtn.disabled = true;
      menfessStatus.textContent = "Mengirim menfess…";
      menfessStatus.className = "form-note";

      try {
        const res = await fetch("/api/menfess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            recipient,
            isAnonymous,
            senderName,
            color,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Gagal mengirim menfess.");
        }

        if (!isAnonymous && senderName) {
          localStorage.setItem("gsa_saved_name", senderName);
          currentSavedName = senderName;
        }

        // Prepend new card immediately
        const emptyState = menfessGrid.querySelector(".menfess-empty");
        if (emptyState) emptyState.remove();

        const newCard = renderMenfessCard(data.item);
        newCard.classList.add("animate-pop-in");
        menfessGrid.insertBefore(newCard, menfessGrid.firstChild);

        // Reset form
        $("menfessText").value = "";
        if (menfessRecipientInput) menfessRecipientInput.value = "All General";
        menfessStatus.textContent = "✅ Menfess berhasil dikirim!";
        menfessStatus.className = "form-note is-success";

        setTimeout(() => {
          menfessStatus.textContent = "";
        }, 4000);
      } catch (err) {
        menfessStatus.textContent = `❌ ${err.message}`;
        menfessStatus.className = "form-note is-error";
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // ==================== 2. PHOTO REACTIONS & REVIEWS ====================
  let activeViewerPhotoId = null;

  async function loadReactions() {
    try {
      const res = await fetch("/api/reactions", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data) {
        reactionsState = {
          counts: data.counts || {},
          userReacts: data.userReacts || {},
          reviews: data.reviews || {},
        };
        updateGalleryReactionBadges();
        if (activeViewerPhotoId) {
          renderViewerReactions(activeViewerPhotoId);
          renderViewerReviews(activeViewerPhotoId);
        }
      }
    } catch (err) {
      console.warn("Failed to load reactions:", err);
    }
  }

  function updateGalleryReactionBadges() {
    // Add reaction counters on gallery cards
    document.querySelectorAll("[data-id]").forEach((card) => {
      const photoId = card.getAttribute("data-id");
      if (!photoId) return;

      const counts = reactionsState.counts[photoId] || {};
      let total = 0;
      let topEmoji = "❤️";
      let topCount = 0;

      for (const [emoji, cnt] of Object.entries(counts)) {
        total += cnt;
        if (cnt > topCount) {
          topCount = cnt;
          topEmoji = emoji;
        }
      }

      let badge = card.querySelector(".card-reactions-badge");
      if (total > 0) {
        if (!badge) {
          badge = document.createElement("div");
          badge.className = "card-reactions-badge";
          card.appendChild(badge);
        }
        badge.innerHTML = `<span>${topEmoji}</span> <span>${total}</span>`;
      } else if (badge) {
        badge.remove();
      }
    });
  }

  const EMOJIS = ["❤️", "🔥", "🥹", "😂", "👏"];

  function renderViewerReactions(photoId) {
    const container = $("viewerReactionsContainer");
    if (!container) return;

    activeViewerPhotoId = photoId;
    const photoCounts = reactionsState.counts[photoId] || {};
    const userReact = reactionsState.userReacts[photoId] || null;

    container.innerHTML = `
      <div class="reactions-bar">
        <span class="reactions-title">Reaksi kamu:</span>
        <div class="reactions-buttons">
          ${EMOJIS.map((emoji) => {
            const count = photoCounts[emoji] || 0;
            const isActive = userReact === emoji;
            return `
              <button 
                type="button" 
                class="react-emoji-btn ${isActive ? "is-active" : ""}" 
                data-emoji="${emoji}"
                title="${isActive ? 'Klik lagi untuk membatalkan' : 'Pilih ' + emoji}"
              >
                <span class="emoji-icon">${emoji}</span>
                <span class="emoji-count">${count > 0 ? count : ""}</span>
              </button>
            `;
          }).join("")}
        </div>
      </div>
      <div class="reaction-rule-note">
        <span>🛡️ 1 IP address hanya 1 reaksi per foto</span>
      </div>
    `;

    container.querySelectorAll(".react-emoji-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const emoji = btn.getAttribute("data-emoji");
        submitReaction(photoId, emoji);
      });
    });
  }

  async function submitReaction(photoId, emoji) {
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, emoji }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal bereaksi.");

      reactionsState.counts[photoId] = data.counts || {};
      if (data.userReact) {
        reactionsState.userReacts[photoId] = data.userReact;
      } else {
        delete reactionsState.userReacts[photoId];
      }

      renderViewerReactions(photoId);
      updateGalleryReactionBadges();
    } catch (err) {
      alert(err.message);
    }
  }

  function renderViewerReviews(photoId) {
    const container = $("viewerReviewsContainer");
    if (!container) return;

    const reviews = reactionsState.reviews[photoId] || [];

    container.innerHTML = `
      <div class="reviews-section">
        <div class="reviews-header">
          <strong>Ulasan & Komentar (${reviews.length})</strong>
        </div>
        <form id="reviewForm" class="review-form">
          <input 
            type="text" 
            id="reviewTextInput" 
            placeholder="Tulis ulasan/komentar tentang momen ini…" 
            maxlength="500" 
            required 
          />
          <div class="review-form-actions">
            <input 
              type="text" 
              id="reviewAuthorInput" 
              placeholder="Nama kamu (kosongkan jika anonim)" 
              value="${escapeHtml(currentSavedName)}"
              maxlength="40" 
            />
            <button type="submit" class="utility-button primary-accent">Kirim</button>
          </div>
          <p id="reviewStatus" class="form-note"></p>
        </form>
        <div class="reviews-list">
          ${reviews.length > 0 ? reviews.map((rev) => `
            <div class="review-item">
              <div class="review-meta">
                <span class="review-author">${escapeHtml(rev.senderName || "Anonim 🕶️")}</span>
                <time class="review-time">${formatRelativeTime(rev.createdAt)}</time>
              </div>
              <p class="review-text">${escapeHtml(rev.text)}</p>
            </div>
          `).join("") : `
            <p class="review-empty">Belum ada ulasan untuk foto ini. Jadilah yang pertama!</p>
          `}
        </div>
      </div>
    `;

    const form = $("reviewForm");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = $("reviewTextInput").value.trim();
        if (!text) return;

        const sender = $("reviewAuthorInput").value.trim();
        const status = $("reviewStatus");
        status.textContent = "Mengirim ulasan…";

        try {
          const res = await fetch("/api/reactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              photoId,
              review: text,
              senderName: sender,
              isAnonymous: !sender,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Gagal mengirim ulasan.");

          if (sender) {
            localStorage.setItem("gsa_saved_name", sender);
            currentSavedName = sender;
          }

          reactionsState.reviews[photoId] = data.reviews || [];
          renderViewerReviews(photoId);
        } catch (err) {
          status.textContent = `❌ ${err.message}`;
        }
      });
    }
  }

  // Hook into viewer open
  window.addEventListener("viewer:open", (e) => {
    const item = e.detail?.item;
    if (item && item.id) {
      renderViewerReactions(item.id);
      renderViewerReviews(item.id);
    }
  });

  // Initial loads
  loadMenfess();
  loadReactions();

  // Periodic polling for fresh menfess & reactions (every 30 seconds)
  setInterval(() => {
    loadMenfess();
    loadReactions();
  }, 30000);
});
