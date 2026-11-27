import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp, readFile, stat, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {XMLParser} from "fast-xml-parser";
import {buildSite} from "./build-site.mjs";
import {samplePosts} from "./content.mjs";

const options = {sourceCommit: "test-source", sourceDate: "2026-11-27T00:00:00Z", copyAssets: false};
const fixture = (index) => ({...samplePosts()[index % 4], id: `fixture-${index}`, title: `검증용 칼럼 ${index}`, sample: false, publishedAt: `2026-11-${String(index+1).padStart(2, "0")}T00:00:00Z`});

test("production build generates indexable static category/detail pages, excludes drafts and local tools", async () => {
  const output = await mkdtemp(path.join(tmpdir(), "booboo-static-test-"));
  try {
    const posts = Array.from({length: 14}, (_, i) => ({...fixture(i), category: "pain"}));
    posts.push({...fixture(20), status: "draft"}, ...samplePosts());
    const result = await buildSite({...options, posts, output});
    assert.equal(result.manifest.postCount, 14);
    const home = await readFile(path.join(output, "index.html"), "utf8");
    assert.equal((home.match(/class="health-card"/g) || []).length, 4);
    assert(!home.includes("sample-pain"));
    assert(!home.includes("예시"));
    const list = await readFile(path.join(output, "health.html"), "utf8");
    assert(list.includes('content="index,follow"'));
    assert(list.includes('href="/health/category/pain.html"'));
    assert(list.includes('href="/health/page/2.html"'));
    assert(list.includes('https://booboohani-health.sanity.studio'));
    assert(list.includes('id="health-search-data"'));
    assert.equal((list.match(/class="health-card"/g) || []).length, 12);
    const next = await readFile(path.join(output, "health/page/2.html"), "utf8");
    assert.equal((next.match(/class="health-card"/g) || []).length, 2);
    const category = await readFile(path.join(output, "health/category/pain-page-2.html"), "utf8");
    assert(category.includes('href="https://booboo.co.kr/health/category/pain-page-2.html"'));
    const article = await readFile(path.join(output, "health/fixture-1.html"), "utf8");
    assert(article.includes("<h1>검증용 칼럼 1</h1>"));
    assert(article.includes('"@type":"Article"'));
    assert(article.includes('href="/health/category/pain.html"'));
    assert(!article.includes("localhost"));
    for (const route of ["care-spine.html", "care-joint.html", "care-accident.html", "care-sports.html", "care-diet.html", "care-digestion.html", "care-women-children.html", "care-autonomic.html", "privacy.html", "health.html", "health/page/2.html", "health/category/pain-page-2.html", "health/fixture-1.html"]) {
      const page = await readFile(path.join(output, route), "utf8");
      assert.equal((page.match(/class="floating-actions\b/g) || []).length, 1, route);
      assert(page.includes('class="floating-actions mobile-contact-only"'), route);
      assert(page.includes('src="/assets/floating-phone.png"'), route);
      assert.equal((page.match(/id="mobile-navigation"/g) || []).length, 1, route);
      assert(page.includes('<script src="/mobile-navigation.js" defer></script>'), route);
    }
    assert.equal((home.match(/id="mobile-navigation"/g) || []).length, 1);
    assert((await readFile(path.join(output, "mobile-navigation.js"), "utf8")).includes("drawer.showModal()"));
    assert.equal((home.match(/class="floating-actions\b/g) || []).length, 1);
    const verification = "googlec6e19113d29d97cb.html";
    assert.equal(await readFile(path.join(output, verification), "utf8"), await readFile(new URL(`../../${verification}`, import.meta.url), "utf8"));
    const sitemap = new XMLParser().parse(await readFile(path.join(output, "sitemap.xml"), "utf8"));
    assert(sitemap.urlset.url.some((entry) => entry.loc === "https://booboo.co.kr/care-spine.html"));
    assert(sitemap.urlset.url.some((entry) => entry.loc === "https://booboo.co.kr/health/fixture-1.html"));
    assert(!sitemap.urlset.url.some((entry) => entry.loc.includes("sample") || entry.loc.includes("fixture-20")));
    for (const privateFile of ["studio", "tools", ".git", ".local-health", "health-editor.html", "health-editor.js", "health-config.json"]) await assert.rejects(stat(path.join(output, privateFile)));
    const repeated = await buildSite({...options, posts, output});
    assert.equal(repeated.manifest.contentDigest, result.manifest.contentDigest);
    const unpublished = await buildSite({...options, posts: posts.filter((post) => post.id !== "fixture-1"), output});
    assert.notEqual(unpublished.manifest.contentDigest, result.manifest.contentDigest);
    await assert.rejects(stat(path.join(output, "health/fixture-1.html")));
  } finally { await rm(output, {recursive: true, force: true}); }
});

test("zero published posts produces a real empty listing without example articles", async () => {
  const output = await mkdtemp(path.join(tmpdir(), "booboo-static-empty-"));
  try {
    const result = await buildSite({...options, posts: samplePosts(), output});
    assert.equal(result.manifest.postCount, 0);
    const home = await readFile(path.join(output, "index.html"), "utf8");
    assert(!home.includes('class="health-card"'));
    assert(home.includes("등록된 글이 없습니다."));
    assert((await readFile(path.join(output, "health/category/seasonal.html"), "utf8")).includes("계절건강정보"));
  } finally { await rm(output, {recursive: true, force: true}); }
});
