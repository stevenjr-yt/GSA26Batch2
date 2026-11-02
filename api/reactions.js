const { randomUUID, createHmac } = require("node:crypto");

function failure(status, message) {
  return Object.assign(new Error(message), { status });
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}

function settings() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "gsa-moments";
  if (!url || !key) return null;
  return { url, key, bucket };
}

const STORAGE_PATH = "reactions/data.json";
const ALLOWED_EMOJIS = ["❤️", "🔥", "🥹", "😂", "👏"];

// Filter kata-kata sindiran kasar / SARA / hate speech
const FORBIDDEN_WORDS = [
  "anjing", "babi", "bangsat", "kontol", "memek", "jembut", "pantek",
  "perek", "bajingan", "goblok", "tolol", "idiot", "cacat",
  "kafir", "sesat", "pribumi", "chindo", "cina kafir", "negro", "lonte"
];

function containsHarmfulContent(text) {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  return FORBIDDEN_WORDS.some((badWord) => {
    const regex = new RegExp(`\\b${badWord}\\b`, "i");
    return regex.test(normalized) || normalized.includes(badWord);
  });
}

function getClientIp(req) {
  return (
    req.headers["x-vercel-forwarded-for"] ||
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "127.0.0.1"
  )
    .split(",")[0]
    .trim();
}

async function readReactionsData(config) {
  try {
    const auth = { apikey: config.key };
    if (config.key.startsWith("eyJ") || config.key.startsWith("sb_secret_")) {
      auth.Authorization = `Bearer ${config.key}`;
    }
    const response = await fetch(`${config.url}/storage/v1/object/${config.bucket}/${STORAGE_PATH}`, {
      headers: auth,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return { reactions: {}, reviews: {} };
    const data = await response.json();
    return {
      reactions: data?.reactions || {},
      reviews: data?.reviews || {},
    };
  } catch {
    return { reactions: {}, reviews: {} };
  }
}

async function writeReactionsData(config, data) {
  const auth = { apikey: config.key };
  if (config.key.startsWith("eyJ") || config.key.startsWith("sb_secret_")) {
    auth.Authorization = `Bearer ${config.key}`;
  }
  const response = await fetch(`${config.url}/storage/v1/object/${config.bucket}/${STORAGE_PATH}`, {
    method: "POST",
    headers: {
      ...auth,
      "Content-Type": "application/json",
      "x-upsert": "true",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const errText = await response.text();
    console.error("Failed to write reactions:", errText);
    throw failure(503, "Gagal menyimpan reaksi.");
  }
}

async function readBody(req) {
  if (req.body !== undefined) {
    return typeof req.body === "object" ? req.body : JSON.parse(req.body.toString());
  }
  const parts = [];
  for await (const chunk of req) parts.push(chunk);
  try {
    return JSON.parse(Buffer.concat(parts).toString());
  } catch {
    throw failure(400, "Format data tidak valid.");
  }
}

module.exports = async function handler(req, res) {
  try {
    if (!["GET", "POST"].includes(req.method)) {
      res.setHeader("Allow", "GET, POST");
      return send(res, 405, { error: "Metode tidak didukung." });
    }

    const config = settings();
    if (!config) {
      return send(res, 200, { reactions: {}, userReacts: {}, reviews: {}, available: false });
    }

    const ip = getClientIp(req);
    const ipHash = createHmac("sha256", config.key).update(ip).digest("hex");

    const store = await readReactionsData(config);
    store.reactions ||= {};
    store.reviews ||= {};

    if (req.method === "GET") {
      // Format response: counts per photo, user's reaction per photo, and reviews per photo
      const counts = {};
      const userReacts = {};

      for (const [photoId, photoData] of Object.entries(store.reactions)) {
        counts[photoId] = photoData.counts || {};
        if (photoData.user_hashes && photoData.user_hashes[ipHash]) {
          userReacts[photoId] = photoData.user_hashes[ipHash];
        }
      }

      return send(res, 200, {
        available: true,
        counts,
        userReacts,
        reviews: store.reviews,
      });
    }

    // POST: Submit React atau Ulasan
    const body = await readBody(req);
    const photoId = typeof body.photoId === "string" ? body.photoId.trim() : "";
    if (!photoId) {
      throw failure(400, "ID foto wajib disertakan.");
    }

    let updatedUserReact = null;

    // Handle React: 1 IP ADDRESS HANYA 1 REACT PER FOTO
    if (body.emoji) {
      if (!ALLOWED_EMOJIS.includes(body.emoji)) {
        throw failure(422, "Emoji tidak valid.");
      }

      store.reactions[photoId] ||= { user_hashes: {}, counts: {} };
      const photoRecord = store.reactions[photoId];
      photoRecord.user_hashes ||= {};
      photoRecord.counts ||= {};

      const previousEmoji = photoRecord.user_hashes[ipHash];

      if (previousEmoji === body.emoji) {
        // Klik emoji yang sama -> batalkan reaksi (toggle off)
        delete photoRecord.user_hashes[ipHash];
        photoRecord.counts[previousEmoji] = Math.max(0, (photoRecord.counts[previousEmoji] || 1) - 1);
        updatedUserReact = null;
      } else {
        // Jika sebelumnya sudah react dengan emoji lain, kurangi emoji lama (1 IP = 1 vote)
        if (previousEmoji) {
          photoRecord.counts[previousEmoji] = Math.max(0, (photoRecord.counts[previousEmoji] || 1) - 1);
        }
        // Tambahkan emoji baru
        photoRecord.user_hashes[ipHash] = body.emoji;
        photoRecord.counts[body.emoji] = (photoRecord.counts[body.emoji] || 0) + 1;
        updatedUserReact = body.emoji;
      }
    }

    // Handle Review / Ulasan
    let newReview = null;
    if (body.review && typeof body.review === "string") {
      const reviewText = body.review.trim();
      if (reviewText) {
        if (containsHarmfulContent(reviewText)) {
          throw failure(422, "Ulasan dibatalkan: Dilarang menyindir/menyinggung, ujaran kebencian, atau SARA.");
        }
        if (reviewText.length > 500) {
          throw failure(422, "Ulasan maksimal 500 karakter.");
        }
        store.reviews[photoId] ||= [];
        const isAnon = Boolean(body.isAnonymous);
        let sender = typeof body.senderName === "string" ? body.senderName.trim() : "";
        if (isAnon || !sender) sender = "Anonim 🕶️";
        else sender = sender.slice(0, 40);

        newReview = {
          id: randomUUID(),
          senderName: sender,
          text: reviewText,
          createdAt: new Date().toISOString(),
        };
        store.reviews[photoId].unshift(newReview);
        // Batasi maksimal 50 ulasan per foto
        store.reviews[photoId] = store.reviews[photoId].slice(0, 50);
      }
    }

    await writeReactionsData(config, store);

    return send(res, 200, {
      success: true,
      photoId,
      counts: store.reactions[photoId]?.counts || {},
      userReact: updatedUserReact,
      reviews: store.reviews[photoId] || [],
    });
  } catch (error) {
    console.error("Reactions error:", error);
    return send(res, error.status || 500, {
      error: error.message || "Gagal memproses reaksi.",
    });
  }
};
