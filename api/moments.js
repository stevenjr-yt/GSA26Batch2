const { randomUUID, createHmac } = require("node:crypto");
const sharp = require("sharp");
const MAX_IMAGE = 100000;
const MAX_BODY = 150000;
const PAGE_SIZE = 40;
const FIELDS =
  "id,title,description,tags,storage_path,image_bytes,width,height,created_at";

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
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "gsa-moments";
  if (!url || !key) return null;
  if (!/^https:\/\/[^/]+$/.test(url) || !/^[a-z0-9_-]+$/.test(bucket))
    throw failure(503, "Penyimpanan belum tersedia.");
  return { url, key, bucket };
}
async function supabase(config, path, options = {}) {
  const auth = { apikey: config.key };
  if (config.key.startsWith("eyJ")) auth.Authorization = `Bearer ${config.key}`;
  const response = await fetch(config.url + path, {
    ...options,
    headers: { ...auth, ...options.headers },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const text = await response.text();
    if (text.includes("MOMENT_RATE_LIMIT"))
      throw failure(429, "Batas upload hari ini tercapai. Coba lagi besok.");
    throw failure(503, "Momen belum bisa disimpan. Coba lagi sebentar.");
  }
  return response.status === 204 ? null : response.json();
}
function publicMoment(row, config) {
  return {
    id: `community-${row.id}`,
    title: row.title,
    description: row.description || "",
    tags: row.tags || [],
    src: `${config.url}/storage/v1/object/public/${config.bucket}/${encodeURIComponent(row.storage_path)}`,
    type: "image",
    category: "community",
    chapter: 0,
    chapterName: "Momen teman",
    badge: row.title,
    location: "Dari teman-teman GSA",
    date: new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeZone: "Asia/Jakarta",
    }).format(new Date(row.created_at)),
    createdAt: row.created_at,
    imageBytes: row.image_bytes,
  };
}
async function readBody(req) {
  if (req.body !== undefined) {
    const bytes =
      typeof req.body === "string" || Buffer.isBuffer(req.body)
        ? Buffer.byteLength(req.body)
        : Buffer.byteLength(JSON.stringify(req.body));
    if (bytes > MAX_BODY) throw failure(413, "Ukuran upload terlalu besar.");
    try {
      return typeof req.body === "object" && !Buffer.isBuffer(req.body)
        ? req.body
        : JSON.parse(req.body.toString());
    } catch {
      throw failure(400, "Data upload tidak valid.");
    }
  }
  let size = 0;
  const parts = [];
  for await (const part of req) {
    size += part.length;
    if (size > MAX_BODY) throw failure(413, "Ukuran upload terlalu besar.");
    parts.push(part);
  }
  try {
    return JSON.parse(Buffer.concat(parts).toString());
  } catch {
    throw failure(400, "Data upload tidak valid.");
  }
}
async function compress(input) {
  let metadata;
  try {
    metadata = await sharp(input, { limitInputPixels: 20000000 }).metadata();
  } catch {
    throw failure(422, "Gambar tidak dapat dibaca. Pilih JPG, PNG, atau WebP.");
  }
  if (
    !["jpeg", "png", "webp"].includes(metadata.format) ||
    (metadata.pages || 1) > 1
  )
    throw failure(422, "Pilih foto JPG, PNG, atau WebP yang tidak bergerak.");
  for (let edge = 1600; edge >= 256; edge = Math.floor(edge * 0.75)) {
    for (const quality of [82, 65, 45, 30]) {
      const result = await sharp(input, { limitInputPixels: 20000000 })
        .rotate()
        .resize({
          width: edge,
          height: edge,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer({ resolveWithObject: true });
      if (result.data.length <= MAX_IMAGE) return result;
    }
  }
  throw failure(422, "Foto belum dapat diperkecil ke 100 KB. Coba foto lain.");
}

module.exports = async function handler(req, res) {
  try {
    const url = new URL(req.url, "http://local");
    if (!["GET", "POST"].includes(req.method)) {
      res.setHeader("Allow", "GET, POST");
      return send(res, 405, { error: "Metode tidak didukung." });
    }
    const config = settings();
    if (!config)
      return send(res, req.method === "GET" ? 200 : 503, {
        available: false,
        items: [],
        nextCursor: null,
        error: "Upload momen belum tersedia. Coba lagi nanti.",
      });
    if (req.method === "GET") {
      const query = new URLSearchParams({
        select: FIELDS,
        published: "eq.true",
        order: "created_at.desc,id.desc",
        limit: String(PAGE_SIZE + 1),
      });
      if (url.searchParams.has("cursor")) {
        let cursor;
        try {
          cursor = JSON.parse(
            Buffer.from(url.searchParams.get("cursor"), "base64url").toString(),
          );
        } catch {
          throw failure(400, "Halaman tidak valid.");
        }
        if (
          !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/.test(cursor?.time) ||
          !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(cursor?.id)
        )
          throw failure(400, "Halaman tidak valid.");
        query.set(
          "or",
          `(created_at.lt.${cursor.time},and(created_at.eq.${cursor.time},id.lt.${cursor.id}))`,
        );
      }
      const rows = await supabase(
        config,
        `/rest/v1/community_moments?${query}`,
      );
      const more = rows.length > PAGE_SIZE;
      const visible = rows.slice(0, PAGE_SIZE);
      const last = visible.at(-1);
      const cursor = more
        ? Buffer.from(
            JSON.stringify({
              time: last.created_at.replace(/\+00:00$/, 'Z'),
              id: last.id,
            }),
          ).toString("base64url")
        : null;
      return send(res, 200, {
        available: true,
        items: visible.map((row) => publicMoment(row, config)),
        nextCursor: cursor,
      });
    }
    if (!req.headers["content-type"]?.startsWith("application/json"))
      throw failure(415, "Gunakan format upload yang benar.");
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    if (req.headers.origin && new URL(req.headers.origin).host !== host)
      throw failure(403, "Upload hanya tersedia dari website ini.");
    const body = await readBody(req);
    if (!body || typeof body !== "object" || body.website)
      throw failure(400, "Data upload tidak valid.");
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    if (!title || title.length > 100 || description.length > 2000)
      throw failure(
        422,
        "Isi judul maksimal 100 karakter dan deskripsi maksimal 2000 karakter.",
      );
    if (
      !Array.isArray(body.tags) ||
      body.tags.length > 8 ||
      body.tags.some(
        (tag) =>
          typeof tag !== "string" || !tag.trim() || tag.trim().length > 32,
      )
    )
      throw failure(422, "Gunakan maksimal 8 tag, masing-masing 32 karakter.");
    const tags = [
      ...new Set(body.tags.map((tag) => tag.trim().replace(/^#+/, ""))),
    ].filter(Boolean);
    if (
      typeof body.image !== "string" ||
      body.image.length > 133336 ||
      body.image.length % 4 !== 0 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(body.image)
    )
      throw failure(422, "Foto hasil kompresi tidak valid.");
    const input = Buffer.from(body.image, "base64");
    if (input.length > MAX_IMAGE)
      throw failure(413, "Foto harus maksimal 100 KB sebelum dikirim.");
    const image = await compress(input);
    const id = randomUUID(),
      path = `${id}.webp`;
    const ip = (
      req.headers["x-vercel-forwarded-for"] ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      "unknown"
    )
      .split(",")[0]
      .trim();
    const submitter = createHmac("sha256", config.key).update(ip).digest("hex");
    const params = {
      p_id: id,
      p_title: title,
      p_description: description || null,
      p_tags: tags,
      p_path: path,
      p_bytes: image.data.length,
      p_width: image.info.width,
      p_height: image.info.height,
      p_submitter_hash: submitter,
    };
    await supabase(config, "/rest/v1/rpc/reserve_community_moment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    let row;
    try {
      await supabase(config, `/storage/v1/object/${config.bucket}/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000",
          "x-upsert": "false",
        },
        body: image.data,
      });
      const rows = await supabase(
        config,
        `/rest/v1/community_moments?id=eq.${id}&select=${FIELDS}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({ published: true }),
        },
      );
      if (!rows?.[0]) throw failure(503, "Momen belum bisa diterbitkan.");
      row = rows[0];
    } catch (error) {
      await Promise.allSettled([
        supabase(config, `/storage/v1/object/${config.bucket}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prefixes: [path] }),
        }),
        supabase(
          config,
          `/rest/v1/community_moments?id=eq.${id}`,
          { method: "DELETE" },
        ),
      ]);
      throw error;
    }
    return send(res, 201, { item: publicMoment(row, config) });
  } catch (error) {
    if (!error.status) console.error("Moment request failed:", error.name);
    send(res, error.status || 503, {
      error: error.status
        ? error.message
        : "Layanan momen belum tersedia. Coba lagi nanti.",
    });
  }
};
