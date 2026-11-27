import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

test("local CMS round trip, safety checks and restart persistence", async (t) => {
  const data = await mkdtemp(path.join(tmpdir(), "booboo-health-test-"));
  const socket = createServer();
  await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  let child;
  let token;
  const start = async () => {
    child = spawn(process.execPath, [fileURLToPath(new URL("server.mjs", import.meta.url))], { env: { ...process.env, PORT: String(port), HEALTH_DATA_DIR: data }, stdio: "pipe" });
    let log = "";
    child.stderr.on("data", (chunk) => { log += chunk; });
    for (let i = 0; i < 60; i++) {
      if (child.exitCode !== null) throw new Error(log);
      try { const res = await fetch(`${origin}/api/health/session`); if (res.ok) { token = (await res.json()).token; return; } } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Server did not start: ${log}`);
  };
  const stop = async () => { if (child && child.exitCode === null) { const done = new Promise((resolve) => child.once("exit", resolve)); child.kill(); await done; } };
  const api = (route, options = {}) => fetch(origin + route, { ...options, headers: { Origin: origin, "X-Health-Token": token, ...options.headers } });
  const post = (value) => api("/api/health/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
  t.after(async () => { await stop(); await rm(data, { recursive: true, force: true }); });
  await start();

  await t.test("preview serves the isolated public schedule engine", async () => {
    const response = await fetch(origin + "/article-schedule-engine.js");
    assert.equal(response.status, 200);
    assert(response.headers.get("content-type").includes("javascript"));
    const engine = await response.text();
    assert(engine.includes("ClinicArticleSchedule"));
    assert(!engine.includes("ADMIN_PASSWORD"));
    assert.equal((await fetch(origin + "/article-schedule-engine.js", {method: "HEAD"})).status, 200);
  });

  await t.test("cross-origin and missing-token writes are blocked", async () => {
    const res = await fetch(origin + "/api/health/posts", { method: "POST", headers: { Origin: "https://example.com", "Content-Type": "application/json" }, body: "{}" });
    assert.equal(res.status, 403);
    assert.equal((await fetch(origin + "/.git/config")).status, 404);
    assert.equal((await fetch(origin + "/api/health/posts", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: "{}" })).status, 403);
  });

  let draft;
  await t.test("draft is stored but not publicly accessible", async () => {
    const res = await post({ title: "LOCAL ROUND TRIP", category: "seasonal", html: "<p>검증용 본문입니다.</p>", status: "draft" });
    assert.equal(res.status, 200);
    draft = await res.json();
    assert.equal(draft.status, "draft");
    assert.equal((await fetch(`${origin}/health/${draft.id}.html`)).status, 404);
    assert(!(await (await fetch(`${origin}/health.html`)).text()).includes("LOCAL ROUND TRIP"));
  });

  await t.test("images decode to local WebP and a square thumbnail", async () => {
    const image = await readFile(new URL("../../assets/gallery/gallery-1f-07.webp", import.meta.url));
    const res = await api("/api/health/images", { method: "POST", headers: { "Content-Type": "image/webp" }, body: image });
    assert.equal(res.status, 200);
    const upload = await res.json();
    assert(upload.src.endsWith(".webp"));
    assert.equal((await fetch(origin + upload.src)).status, 200);
    draft.cover = upload.src;
    draft.coverThumb = upload.thumbnail;
    draft.coverAlt = "테스트 이미지";
    assert.equal((await api("/api/health/images", { method: "POST", headers: { "Content-Type": "image/webp" }, body: "not an image" })).status, 400);
  });

  await t.test("publication validates fields and returns server-rendered rich text", async () => {
    assert.equal((await post({ ...draft, title: "", status: "published" })).status, 400);
    const res = await post({ ...draft, status: "published", html: '<p><strong>검증</strong><u>밑줄</u><span style="color:#b33939;font-size:22px">서식</span><img src="/assets/booboo-logo.webp" alt="로고" onerror="alert(1)"></p><script>alert(1)</script>' });
    assert.equal(res.status, 200);
    const updated = await res.json();
    const html = await (await fetch(`${origin}/health/${updated.id}.html`)).text();
    assert(html.includes("<strong>검증</strong>"));
    assert(html.includes("<u>밑줄</u>"));
    assert(html.includes("font-size:22px"));
    assert(!html.includes("onerror"));
    assert(!html.includes("alert(1)"));
    assert(html.includes('"author":{"@type":"Organization","name":"부부한의원"'));
    assert((await (await fetch(`${origin}/health.html?category=seasonal`)).text()).includes(updated.title));
    assert.equal((await post({ ...draft, status: "published" })).status, 409);
    draft = updated;
  });

  await t.test("published post survives server restart", async () => {
    await stop();
    await start();
    const posts = await (await api("/api/health/posts")).json();
    assert.equal(posts.find((p) => p.id === draft.id).status, "published");
  });

  await t.test("unpublish and delete remove public access", async () => {
    draft = await (await post({ ...draft, status: "draft" })).json();
    assert.equal((await fetch(`${origin}/health/${draft.id}.html`)).status, 404);
    assert.equal((await api(`/api/health/posts/${draft.id}`, { method: "DELETE", headers: { "X-Post-Revision": "1" } })).status, 409);
    assert.equal((await api(`/api/health/posts/${draft.id}`, { method: "DELETE", headers: { "X-Post-Revision": String(draft.revision) } })).status, 200);
    assert(!(await (await api("/api/health/posts")).json()).some((p) => p.id === draft.id));
  });
});
