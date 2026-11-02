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

const STORAGE_PATH = "menfess/messages.json";
const AUTHORS_PATH = "menfess/authors.json";

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

async function readFromStorage(config, path, defaultVal = []) {
  try {
    const auth = { apikey: config.key };
    if (config.key.startsWith("eyJ") || config.key.startsWith("sb_secret_")) {
      auth.Authorization = `Bearer ${config.key}`;
    }
    const response = await fetch(`${config.url}/storage/v1/object/${config.bucket}/${path}`, {
      headers: auth,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return defaultVal;
    return await response.json();
  } catch {
    return defaultVal;
  }
}

async function writeToStorage(config, path, data) {
  const auth = { apikey: config.key };
  if (config.key.startsWith("eyJ") || config.key.startsWith("sb_secret_")) {
    auth.Authorization = `Bearer ${config.key}`;
  }
  const response = await fetch(`${config.url}/storage/v1/object/${config.bucket}/${path}`, {
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
    console.error(`Failed to write ${path}:`, errText);
    throw failure(503, "Gagal menyimpan data ke penyimpanan.");
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
      return send(res, 200, { items: [], available: false });
    }

    const ip = getClientIp(req);
    const ipHash = createHmac("sha256", config.key).update(ip).digest("hex");
    const authorId = "gsa-" + ipHash.slice(0, 8);

    const authors = await readFromStorage(config, AUTHORS_PATH, {});
    const authorProfile = authors[ipHash] || null;

    if (req.method === "GET") {
      const items = await readFromStorage(config, STORAGE_PATH, []);
      return send(res, 200, {
        available: true,
        items,
        authorId,
        savedName: authorProfile?.name || null,
      });
    }

    // POST: Simpan Menfess Baru
    const body = await readBody(req);
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 1000) {
      throw failure(422, "Pesan menfess wajib diisi (maksimal 1000 karakter).");
    }

    // ATURAN: Dilarang menyindir, kata kasar, atau SARA
    if (containsHarmfulContent(message)) {
      throw failure(
        422,
        "Pesan dibatalkan: Dilarang keras menyindir/menyinggung sesama delegasi, ujaran kebencian, atau SARA. Mari jaga kenangan kita tetap positif!",
      );
    }

    let recipient = typeof body.recipient === "string" ? body.recipient.trim() : "";
    if (!recipient) {
      recipient = "All General";
    }
    if (containsHarmfulContent(recipient)) {
      throw failure(422, "Nama penerima (To:) tidak pantas atau melanggar aturan komunitas.");
    }
    recipient = recipient.slice(0, 50);

    const isAnonymous = Boolean(body.isAnonymous);
    let senderName = typeof body.senderName === "string" ? body.senderName.trim() : "";
    const isAdmin = !isAnonymous && senderName.toLowerCase() === "steven erlinto";
    const role = isAdmin ? "admin" : (isAnonymous ? "anon" : "delegasi");

    // Simpan nama berdasarkan IP jika pengguna mengisi nama
    if (!isAnonymous && senderName) {
      if (containsHarmfulContent(senderName)) {
        throw failure(422, "Nama tidak pantas atau melanggar aturan komunitas.");
      }
      senderName = senderName.slice(0, 50);
      authors[ipHash] = {
        authorId,
        name: senderName,
        role,
        updatedAt: new Date().toISOString(),
      };
      // Tulis pembaruan author profile secara asynchronous
      writeToStorage(config, AUTHORS_PATH, authors).catch(() => {});
    } else {
      senderName = "Anonim 🕶️";
    }

    const allowedColors = ["blue", "red", "yellow", "green", "purple"];
    const color = allowedColors.includes(body.color) ? body.color : "blue";

    const newEntry = {
      id: randomUUID(),
      authorId,
      recipient,
      message,
      senderName,
      role,
      isAnonymous,
      color,
      createdAt: new Date().toISOString(),
    };

    // Baca data lama dan simpan entri baru di posisi paling atas
    const existing = await readFromStorage(config, STORAGE_PATH, []);
    const updated = [newEntry, ...existing].slice(0, 500);

    await writeToStorage(config, STORAGE_PATH, updated);

    return send(res, 201, {
      success: true,
      item: newEntry,
      authorId,
      savedName: isAnonymous ? authorProfile?.name || null : senderName,
    });
  } catch (error) {
    console.error("Menfess error:", error);
    return send(res, error.status || 500, {
      error: error.message || "Terjadi kesalahan pada layanan menfess.",
    });
  }
};
