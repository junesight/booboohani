import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile, mkdir, rename, stat } from "node:fs/promises";
import { randomUUID, randomBytes } from "node:crypto";
import sharp from "sharp";
import { categories, samplePosts, publishedPosts, cards, listPage, articlePage, cleanBody, plainText, safeImage, withMobileContact } from "./content.mjs";
import {fetchSanityPosts, studioLinks} from "./sanity-source.mjs";
import settings from "../../health-config.json" with {type: "json"};

const root = fileURLToPath(new URL("../../", import.meta.url));
const local = process.env.HEALTH_DATA_DIR || path.join(root, ".local-health");
const store = path.join(local, "posts.json");
const port = Number(process.env.PORT || 8767);
const csrf = randomBytes(32).toString("hex");
const sanityMode = process.env.HEALTH_CONTENT_SOURCE === "sanity";
const origins = new Set([`http://127.0.0.1:${port}`, `http://localhost:${port}`]);
await mkdir(path.join(local, "uploads"), { recursive: true });
try { await stat(store); } catch { await writeFile(store, JSON.stringify(samplePosts(), null, 2)); }

const readPosts = async () => sanityMode ? fetchSanityPosts() : JSON.parse(await readFile(store, "utf8"));
const savePosts = async (posts) => {
  const temp = `${store}.${randomUUID()}.tmp`;
  await writeFile(temp, JSON.stringify(posts, null, 2));
  await rename(temp, store);
};
let mutation = Promise.resolve();
const serial = (callback) => {
  const result = mutation.then(callback);
  mutation = result.catch(() => {});
  return result;
};
const fail = (status, message) => Object.assign(new Error(message), { status });
const send = (res, status, body, type = "application/json; charset=utf-8") => {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "SAMEORIGIN", "Referrer-Policy": "strict-origin-when-cross-origin" });
  res.end(typeof body === "object" && !Buffer.isBuffer(body) ? JSON.stringify(body) : body);
};
const body = async (req, max = 2 * 1024 * 1024) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > max) throw fail(413, "파일 또는 본문이 너무 큽니다.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};
const jsonBody = async (req) => {
  if (!req.headers["content-type"]?.startsWith("application/json")) throw fail(415, "JSON 요청이 필요합니다.");
  try { return JSON.parse((await body(req)).toString()); } catch (error) { if (error.status) throw error; throw fail(400, "요청 형식이 올바르지 않습니다."); }
};

function validate(input, existing, preview = false) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw fail(400, "글 정보가 올바르지 않습니다.");
  const title = typeof input.title === "string" ? input.title.trim().slice(0, 160) : "";
  const html = cleanBody(typeof input.html === "string" ? input.html : "");
  const category = categories.some(([id]) => id === input.category) ? input.category : "";
  const status = input.status === "published" ? "published" : "draft";
  const cover = safeImage(input.cover);
  const coverThumb = safeImage(input.coverThumb) || cover;
  if (!preview && status === "published" && (!title || !category || !cover || !plainText(html))) throw fail(400, "제목, 카테고리, 대표 이미지, 본문을 모두 입력해 주세요.");
  const now = new Date().toISOString();
  return {
    id: existing?.id || randomUUID(), title: title || "제목 없는 글", category: category || "pain", html,
    cover: cover || "/assets/booboo-logo.webp", coverThumb: coverThumb || "/assets/booboo-logo.webp",
    coverAlt: typeof input.coverAlt === "string" ? input.coverAlt.trim().slice(0, 240) : "",
    status, sample: existing?.sample || false, revision: (existing?.revision || 0) + 1,
    createdAt: existing?.createdAt || now, updatedAt: now,
    publishedAt: status === "published" ? existing?.publishedAt || now : existing?.publishedAt || null,
  };
}

const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".pdf": "application/pdf", ".xml": "application/xml", ".txt": "text/plain" };
const vendor = {
  "/health-vendor/quill.js": "quill/dist/quill.js",
  "/health-vendor/quill.css": "quill/dist/quill.snow.css",
  "/health-vendor/lucide.js": "lucide/dist/umd/lucide.js",
};

const server = http.createServer(async (req, res) => {
  try {
    const origin = `http://${req.headers.host}`;
    if (!origins.has(origin)) throw fail(403, "로컬 주소로 접속해 주세요.");
    const url = new URL(req.url, origin);
    const route = decodeURIComponent(url.pathname);
    if (route.includes("\0") || route.split("/").some((part) => part === ".." || part.startsWith("."))) throw fail(404, "페이지를 찾을 수 없습니다.");
    if (sanityMode && route === "/health-editor.html") {
      res.writeHead(302, {Location: settings.studioUrl});
      return res.end();
    }
    if (sanityMode && route.startsWith("/api/health/") && !["GET", "HEAD"].includes(req.method)) throw fail(403, "글 작성과 수정은 Sanity 관리자에서 진행해 주세요.");
    if (!["GET", "HEAD"].includes(req.method)) {
      if (req.headers.origin !== origin || req.headers["x-health-token"] !== csrf) throw fail(403, "잘못된 요청입니다. 페이지를 새로고침해 주세요.");
    }
    if (route === "/api/health/session" && req.method === "GET") return send(res, 200, { token: sanityMode ? undefined : csrf, categories, mode: sanityMode ? "sanity" : "local" });
    if (route === "/api/health/posts" && req.method === "GET") return send(res, 200, await readPosts());
    if (route === "/api/health/posts" && req.method === "POST") {
      const input = await jsonBody(req);
      const post = await serial(async () => {
        const posts = await readPosts();
        const existing = input.id ? posts.find((p) => p.id === input.id) : null;
        if (input.id && !existing) throw fail(404, "삭제되었거나 존재하지 않는 글입니다.");
        if (existing && input.revision !== existing.revision) throw fail(409, "다른 창에서 수정한 글입니다. 새로고침 후 다시 확인해 주세요.");
        const next = validate(input, existing);
        await savePosts(existing ? posts.map((p) => p.id === next.id ? next : p) : [...posts, next]);
        return next;
      });
      return send(res, 200, post);
    }
    if (route.startsWith("/api/health/posts/") && req.method === "DELETE") {
      const id = route.split("/").at(-1);
      await serial(async () => {
        const posts = await readPosts();
        const found = posts.find((p) => p.id === id);
        if (!found) throw fail(404, "글을 찾을 수 없습니다.");
        if (Number(req.headers["x-post-revision"]) !== found.revision) throw fail(409, "다른 창에서 수정한 글입니다. 새로고침 후 다시 확인해 주세요.");
        await savePosts(posts.filter((p) => p.id !== id));
      });
      return send(res, 200, { ok: true });
    }
    if (route === "/api/health/preview" && req.method === "POST") {
      const input = await jsonBody(req);
      const preview = validate(input, null, true);
      return send(res, 200, { html: articlePage(await readFile(path.join(root, "index.html"), "utf8"), preview) });
    }
    if (route === "/api/health/images" && req.method === "POST") {
      if (!["image/jpeg", "image/png", "image/webp"].includes(req.headers["content-type"])) throw fail(415, "JPG, PNG, WebP 이미지를 선택해 주세요.");
      const bytes = await body(req, 12 * 1024 * 1024);
      const id = randomUUID();
      let image;
      try {
        image = await sharp(bytes, { limitInputPixels: 40_000_000 }).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
      } catch { throw fail(400, "이미지를 읽을 수 없습니다. 다른 파일을 선택해 주세요."); }
      const thumbnail = await sharp(image).resize(600, 600, { fit: "cover" }).webp({ quality: 82 }).toBuffer();
      await writeFile(path.join(local, "uploads", `${id}.webp`), image);
      await writeFile(path.join(local, "uploads", `${id}-thumb.webp`), thumbnail);
      return send(res, 200, { src: `/health-media/${id}.webp`, thumbnail: `/health-media/${id}-thumb.webp` });
    }
    if (!["GET", "HEAD"].includes(req.method)) throw fail(405, "지원하지 않는 요청입니다.");
    if (route === "/" || route === "/index.html") {
      const source = await readFile(path.join(root, "index.html"), "utf8");
      const posts = publishedPosts(await readPosts()).slice(0, 4);
      return send(res, 200, withMobileContact(source.replace(/<!-- HEALTH_CARDS_START -->[\s\S]*?<!-- HEALTH_CARDS_END -->/, `<!-- HEALTH_CARDS_START -->${posts.length ? cards(posts) : '<p class="health-empty-inline">등록된 글이 없습니다.</p>'}<!-- HEALTH_CARDS_END -->`), source), "text/html; charset=utf-8");
    }
    if (route === "/health.html") {
      const html = listPage(await readFile(path.join(root, "index.html"), "utf8"), await readPosts(), url);
      return send(res, 200, sanityMode ? studioLinks(html) : html, "text/html; charset=utf-8");
    }
    if (/^\/health\/[A-Za-z0-9_-]+\.html$/.test(route)) {
      const id = route.split("/").at(-1).replace(/\.html$/, "");
      const post = (await readPosts()).find((p) => p.id === id && p.status === "published");
      if (!post) throw fail(404, "글을 찾을 수 없습니다.");
      const html = articlePage(await readFile(path.join(root, "index.html"), "utf8"), post);
      return send(res, 200, sanityMode ? studioLinks(html) : html, "text/html; charset=utf-8");
    }
    let file;
    if (vendor[route]) file = path.join(root, "tools/health-preview/node_modules", vendor[route]);
    else if (/^\/health-media\/[a-f0-9-]+(?:-thumb)?\.webp$/.test(route)) file = path.join(local, "uploads", path.basename(route));
    else if (/^\/assets\//.test(route) || /^\/[a-zA-Z0-9_-]+\.(html|css|js|xml|txt)$/.test(route)) file = path.join(root, route);
    else throw fail(404, "페이지를 찾을 수 없습니다.");
    let data = await readFile(file);
    if (path.extname(file) === ".html") data = withMobileContact(data.toString("utf8"), await readFile(path.join(root, "index.html"), "utf8"));
    return send(res, 200, req.method === "HEAD" ? "" : data, mime[path.extname(file)] || "application/octet-stream");
  } catch (error) {
    const status = error.status || (error.code === "ENOENT" ? 404 : 500);
    send(res, status, { error: status === 500 ? "저장 중 오류가 발생했습니다. 다시 시도해 주세요." : error.message });
  }
});
server.listen(port, "127.0.0.1", () => console.log(`Local clinic preview: http://127.0.0.1:${port}/\nArticles: http://127.0.0.1:${port}/health.html\nEditor: http://127.0.0.1:${port}/health-editor.html`));
