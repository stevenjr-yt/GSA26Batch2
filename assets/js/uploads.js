document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const dialog = $("uploadDialog"),
    form = $("uploadForm");
  const LIMIT = 100000;
  let available = false,
    prepared = null,
    previewUrl = null,
    processing = false,
    generation = 0,
    nextCursor = null;
  let uploadController = null;
  const sizeLabel = (bytes) =>
    bytes >= 1000000
      ? `${(bytes / 1000000).toFixed(1)} MB`
      : `${Math.ceil(bytes / 1000)} KB`;
  function syncSubmit() {
    $("uploadSubmit").disabled = !available || !prepared || processing;
  }
  function showStatus(message, error = false) {
    $("uploadStatus").textContent = message;
    $("uploadStatus").classList.toggle("is-error", error);
  }
  function openUpload() {
    dialog.showModal();
    $("uploadClose").focus();
    if (!available) showStatus("Upload momen belum tersedia. Coba lagi nanti.");
  }
  $("uploadMomentBtn").addEventListener("click", openUpload);
  $("uploadClose").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    uploadController?.abort();
    $("uploadMomentBtn").focus({ preventScroll: true });
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const b = dialog.getBoundingClientRect();
    if (
      event.clientX < b.left ||
      event.clientX > b.right ||
      event.clientY < b.top ||
      event.clientY > b.bottom
    )
      dialog.close();
  });

  async function loadMoments(cursor = null, selectCommunity = false) {
    const button = $("loadMoreMoments");
    button.disabled = true;
    try {
      const response = await fetch(
        "/api/moments" +
          (cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""),
        { cache: "no-store" },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Momen teman belum dapat dimuat.");
      available = Boolean(data.available);
      nextCursor = data.nextCursor || null;
      button.hidden = !nextCursor;
      if (data.items?.length)
        window.dispatchEvent(
          new CustomEvent("moments:loaded", {
            detail: { items: data.items, selectCommunity },
          }),
        );
      $("communityStatus").textContent = "";
      if (available && dialog.open) showStatus("");
    } catch {
      if (cursor)
        $("communityStatus").textContent =
          "Momen lainnya belum dapat dimuat. Coba lagi.";
    } finally {
      button.disabled = false;
      syncSubmit();
    }
  }
  $("loadMoreMoments").addEventListener("click", () =>
    loadMoments(nextCursor, true),
  );
  loadMoments();

  async function compressPhoto(file) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      throw new Error("Pilih foto JPG, PNG, atau WebP.");
    if (file.size > 20000000) throw new Error("Foto awal maksimal 20 MB.");
    let bitmap;
    try {
      bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
    } catch {
      throw new Error("Foto tidak dapat dibaca. Coba file lain.");
    }
    try {
      if (bitmap.width * bitmap.height > 40000000)
        throw new Error(
          "Resolusi foto terlalu besar. Pilih versi di bawah 40 megapiksel.",
        );
      const canvas = document.createElement("canvas");
      let edge = Math.min(1600, Math.max(bitmap.width, bitmap.height));
      while (edge >= 128) {
        const ratio = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
        canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
        const context = canvas.getContext("2d");
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        for (const quality of [0.86, 0.72, 0.58, 0.44, 0.3]) {
          let blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/webp", quality),
          );
          if (blob?.type !== "image/webp")
            blob = await new Promise((resolve) =>
              canvas.toBlob(resolve, "image/jpeg", quality),
            );
          if (blob && blob.size <= LIMIT) return blob;
        }
        edge = Math.floor(edge * 0.75);
      }
      throw new Error("Foto belum bisa diperkecil ke 100 KB. Coba foto lain.");
    } finally {
      bitmap.close();
    }
  }
  $("momentImage").addEventListener("change", async () => {
    const token = ++generation;
    prepared = null;
    processing = true;
    syncSubmit();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    $("uploadPreview").hidden = true;
    const file = $("momentImage").files[0];
    if (!file) {
      processing = false;
      $("compressionStatus").textContent = "";
      syncSubmit();
      return;
    }
    $("compressionStatus").textContent = "Menyiapkan foto…";
    try {
      const blob = await compressPhoto(file);
      if (token !== generation) return;
      prepared = blob;
      previewUrl = URL.createObjectURL(blob);
      $("uploadPreview").src = previewUrl;
      $("uploadPreview").hidden = false;
      $("photoPickerText").textContent = "Ganti foto";
      $("compressionStatus").textContent =
        `${sizeLabel(file.size)} → ${sizeLabel(blob.size)} · Foto siap dibagikan`;
    } catch (error) {
      if (token === generation)
        $("compressionStatus").textContent = error.message;
    } finally {
      if (token === generation) {
        processing = false;
        syncSubmit();
      }
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!prepared || !available || processing) return;
    const tags = [
      ...new Set(
        $("momentTags")
          .value.split(",")
          .map((tag) => tag.trim().replace(/^#+/, ""))
          .filter(Boolean),
      ),
    ];
    if (tags.length > 8 || tags.some((tag) => tag.length > 32)) {
      showStatus("Gunakan maksimal 8 tag, masing-masing 32 karakter.", true);
      return;
    }
    processing = true;
    syncSubmit();
    form.setAttribute("aria-busy", "true");
    showStatus("Menyimpan momenmu…");
    uploadController = new AbortController();
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(prepared);
      });
      const response = await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: uploadController.signal,
        body: JSON.stringify({
          image: dataUrl.split(",")[1],
          title: $("momentTitle").value.trim(),
          description: $("momentDescription").value.trim(),
          tags,
          website: form.elements.website.value,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Momen belum berhasil disimpan.");
      dialog.close();
      window.dispatchEvent(
        new CustomEvent("moments:loaded", {
          detail: { items: [data.item], selectCommunity: true },
        }),
      );
      $("communityStatus").textContent =
        "Momenmu sudah ada di sini. Terima kasih sudah berbagi!";
      form.reset();
      prepared = null;
      $("uploadPreview").hidden = true;
      $("photoPickerText").textContent = "Pilih foto dari perangkatmu";
      $("compressionStatus").textContent = "";
      showStatus("");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    } catch (error) {
      if (error.name !== "AbortError")
        showStatus(error.message || "Upload belum berhasil. Coba lagi.", true);
    } finally {
      processing = false;
      uploadController = null;
      form.removeAttribute("aria-busy");
      syncSubmit();
    }
  });
});
