// Local preview: same API handler as Vercel, with no access to private project files.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const moments = require("./api/moments.js");
const menfess = require("./api/menfess.js");
const reactions = require("./api/reactions.js");
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".txt": "text/plain",
};
http
  .createServer(async (req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (pathname === "/api/moments") return moments(req, res);
    if (pathname === "/api/menfess") return menfess(req, res);
    if (pathname === "/api/reactions") return reactions(req, res);

    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405).end();
      return;
    }
    const root = path.resolve(__dirname, "assets");
    const file =
      pathname === "/" || pathname === "/index.html"
        ? path.join(__dirname, "index.html")
        : path.resolve(__dirname, "." + pathname);
    const allowed =
      file === path.join(__dirname, "index.html") ||
      (file.toLowerCase().startsWith((root + path.sep).toLowerCase()) &&
        !pathname.split("/").some((part) => part.startsWith(".")));
    const type = types[path.extname(file)];
    if (!allowed || !type) {
      res.writeHead(404).end("Not found");
      return;
    }
    try {
      const stat = await fs.promises.stat(file);
      if (!stat.isFile()) throw new Error("not-file");

      const isMedia = path.extname(file) === ".mp4" || path.extname(file) === ".mp3";
      const range = req.headers.range;

      if (range && isMedia) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = end - start + 1;
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": type,
          "Cache-Control": "public, max-age=31536000, immutable",
        });
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        fs.createReadStream(file, { start, end })
          .on("error", () => res.destroy())
          .pipe(res);
        return;
      }

      const headers = {
        "Content-Type": type,
        "Content-Length": stat.size,
        "Cache-Control": isMedia ? "public, max-age=31536000, immutable" : "no-store",
        "X-Content-Type-Options": "nosniff",
      };
      if (isMedia) {
        headers["Accept-Ranges"] = "bytes";
      }

      res.writeHead(200, headers);
      if (req.method === "HEAD") res.end();
      else
        fs.createReadStream(file)
          .on("error", () => res.destroy())
          .pipe(res);
    } catch {
      res.writeHead(404).end("Not found");
    }
  })
  .listen(Number(process.env.PORT) || 8000, "127.0.0.1", () =>
    console.log(`Local: http://localhost:${Number(process.env.PORT) || 8000}`),
  );
