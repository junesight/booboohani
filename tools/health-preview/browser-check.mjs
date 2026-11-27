import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_PATH ? pathToFileURL(process.env.PLAYWRIGHT_PATH).href : "playwright");
const origin = process.env.HEALTH_URL || "http://127.0.0.1:8767";
const root = fileURLToPath(new URL("../../", import.meta.url));
const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("dialog", (dialog) => dialog.accept());
const savedPost = () => page.waitForResponse((response) => response.url().endsWith("/api/health/posts") && response.request().method() === "POST");
const uploadedImage = () => page.waitForResponse((response) => response.url().endsWith("/api/health/images") && response.request().method() === "POST");
let post;
try {
  await page.goto(`${origin}/health-editor.html`, { waitUntil: "networkidle" });
  await page.locator("#post-title").fill("로컬 검증용 칼럼 (삭제 예정)");
  await page.locator("#post-category").selectOption("seasonal");
  const editor = page.locator(".ql-editor");
  await editor.fill("서식이 유지되는지 확인하는 본문입니다.");
  await editor.press(process.platform === "darwin" ? "Meta+a" : "Control+a");
  await page.locator(".ql-bold").click();
  await page.locator(".ql-underline").click();
  await page.locator(".ql-size .ql-picker-label").click();
  await page.locator('.ql-size .ql-picker-item[data-value="22px"]').click();
  await page.locator(".ql-color .ql-picker-label").click();
  await page.locator('.ql-color .ql-picker-item[data-value="#b33939"]').click();
  let response = uploadedImage();
  await page.locator("#cover-file").setInputFiles(path.join(root, "assets/gallery/gallery-1f-07.webp"));
  await response;
  await page.waitForFunction(() => !document.querySelector("#publish-post").disabled);
  await page.locator("#cover-alt").fill("검증용 진료실 이미지");
  response = savedPost();
  await page.locator("#save-draft").click();
  post = await (await response).json();
  assert.equal(post.status, "draft");
  assert(/<strong\b/.test(post.html));
  assert(/<u\b/.test(post.html));
  assert(post.html.includes("font-size:22px"));
  assert(post.html.includes("color:rgb(179, 57, 57)"));
  await page.waitForFunction(() => !document.querySelector("#publish-post").disabled);
  await editor.click();
  await editor.press(process.platform === "darwin" ? "Meta+End" : "Control+End");
  await page.locator(".ql-image").click();
  response = uploadedImage();
  await page.locator("#body-file").setInputFiles(path.join(root, "assets/gallery/gallery-3f-06.webp"));
  await response;
  await page.locator("#image-dialog").waitFor({ state: "visible" });
  await page.locator("#inline-image-alt").fill("본문 약재 사진");
  await page.locator("#inline-image-width").selectOption("400");
  await page.locator('#image-settings button[type="submit"]').click();
  assert.equal(await editor.locator("img").getAttribute("alt"), "본문 약재 사진");
  assert.equal(await editor.locator("img").getAttribute("width"), "400");
  await page.locator("#preview-post").click();
  await page.locator("#preview-dialog").waitFor({ state: "visible" });
  await page.frameLocator("#preview-frame").locator(".health-prose img").waitFor();
  await page.locator("#preview-dialog [data-close-dialog]").click();
  response = savedPost();
  await page.locator("#publish-post").click();
  post = await (await response).json();
  assert.equal(post.status, "published");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await editor.locator("img").getAttribute("alt"), "본문 약재 사진");
  const reader = await browser.newPage({ viewport: { width: 390, height: 1000 }, javaScriptEnabled: false });
  await reader.goto(`${origin}/health.html?category=seasonal`);
  assert.equal(await reader.locator(`a[href="/health/${post.id}.html"]`).count(), 1);
  await reader.locator(`a[href="/health/${post.id}.html"]`).click();
  assert((await reader.locator(".health-prose").innerText()).replace(/\s+/g, " ").includes("서식이 유지"));
  assert.equal(await reader.locator(".health-prose img").getAttribute("width"), "400");
  assert(await reader.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await reader.screenshot({ path: "/tmp/booboo-columns-article-test.png", fullPage: true });
  await reader.close();
  await page.locator("#unpublish-post").click();
  await page.waitForFunction(() => document.querySelector("#unpublish-post").hidden);
  await page.locator("#delete-post").click();
  await page.waitForFunction(() => document.querySelector("#delete-post").hidden);
  console.log("Browser flow passed: formatting, uploads, image settings, draft, preview, publish, reload, no-JS reading, unpublish, delete");
  assert.equal(errors.length, 0, errors.join("\n"));

  for (const width of [320, 390, 768, 1024, 1440]) {
    const view = await browser.newPage({ viewport: { width, height: 1000 } });
    const pageErrors = [];
    view.on("pageerror", (error) => pageErrors.push(error.message));
    await view.addInitScript(() => { try { localStorage.setItem("promoHideUntil_v3", String(Date.now()+86400000)); } catch {} });
    for (const [name, route] of [["home", "/#health"], ["list", "/health.html"], ["editor", "/health-editor.html"]]) {
      await view.goto(origin + route, { waitUntil: "networkidle" });
      if (name === "home") { await view.locator("#health").scrollIntoViewIfNeeded(); await view.waitForTimeout(1300); }
      assert(await view.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} overflow at ${width}`);
      if (name === "home" || name === "list") assert.equal(await view.locator(".health-card").count(), 4);
      if (name === "list") assert.equal(await view.locator(".health-categories a").count(), 8);
      if (name === "editor") assert.equal(await view.locator("#remove-cover").isVisible(), false);
      await view.screenshot({ path: `/tmp/booboo-columns-${width}-${name}.png` });
    }
    await view.goto(origin + "/health.html?category=pain");
    assert.equal(await view.locator(".health-card").count(), 1);
    await view.goto(origin + "/health.html?category=women-children");
    assert.equal(await view.locator(".health-card").count(), 0);
    assert(await view.locator(".health-empty").isVisible());
    assert.equal(pageErrors.length, 0, pageErrors.join("\n"));
    console.log(`Responsive check passed: ${width}px`);
    await view.close();
  }
} catch (error) {
  await page.screenshot({ path: "/tmp/booboo-columns-ui-failure.png", fullPage: true });
  throw error;
} finally {
  if (post?.id) await page.evaluate(async (id) => {
    const session = await (await fetch("/api/health/session")).json();
    const posts = await (await fetch("/api/health/posts")).json();
    const found = posts.find((item) => item.id === id);
    if (found) await fetch(`/api/health/posts/${id}`, { method: "DELETE", headers: { "X-Health-Token": session.token, "X-Post-Revision": String(found.revision) } });
  }, post.id).catch(() => {});
  await browser.close();
}
