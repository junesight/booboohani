import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { categories, samplePosts, cleanBody, safeImage, cards, listPage, articlePage, publishedPosts } from "./content.mjs";

const source = await readFile(new URL("../../index.html", import.meta.url), "utf8");

test("all seven categories and four labelled sample cards", () => {
  assert.equal(categories.length, 7);
  assert.equal(samplePosts().length, 4);
  assert.equal((cards(samplePosts()).match(/class="health-card"/g) || []).length, 4);
  assert.equal((cards(samplePosts()).match(/class="health-sample"/g) || []).length, 4);
});

test("rich text retains supported formatting and strips executable markup", () => {
  const dirty = '<h2>제목</h2><p><strong>굵게</strong><u>밑줄</u><span style="color: rgb(22, 61, 50); font-size: 22px; position:fixed; top:0">강조</span></p><script>alert(1)</script><img src="/health-media/abc-def.webp" alt="사진" onerror="alert(1)"><img src="https://external.test/pixel"><a href="javascript:alert(1)">링크</a><iframe src="https://example.com"></iframe>';
  const html = cleanBody(dirty);
  assert(html.includes("<strong>굵게</strong>"));
  assert(html.includes("<u>밑줄</u>"));
  assert(html.includes("font-size:22px"));
  assert(html.includes('alt="사진"'));
  for (const bad of ["<script", "onerror", "javascript:", "position", "external.test", "<iframe"]) assert(!html.includes(bad), bad);
});

test("only managed images can be embedded", () => {
  assert.equal(safeImage("/assets/booboo-logo.webp"), "/assets/booboo-logo.webp");
  for (const value of ["//evil.test/a.png", "javascript:alert(1)", "data:image/svg+xml,x", "/assets/../x", "https://test.com/image.png"]) assert.equal(safeImage(value), "");
});

test("drafts excluded and newest publication appears first", () => {
  const posts = samplePosts();
  posts[0].status = "draft";
  assert.equal(publishedPosts(posts).length, 3);
  assert.equal(publishedPosts(posts)[0].id, "sample-accident");
});

test("list filters render server-side without JavaScript", () => {
  const html = listPage(source, samplePosts(), new URL("http://localhost/health.html?category=diet"));
  assert(html.includes('aria-current="page">다이어트'));
  assert(html.includes('href="/health/sample-diet.html"'));
  assert(!html.includes('href="/health/sample-pain.html"'));
  assert(html.includes('name="robots" content="noindex,nofollow"'));
});

test("empty category and hostile search strings are escaped", () => {
  const html = listPage(source, samplePosts(), new URL("http://localhost/health.html?category=seasonal&q=%22%3E%3Cscript%3E"));
  assert(html.includes("등록된 글이 없습니다."));
  assert(!html.includes('"><script>'));
});

test("article publisher is clinic Organization, not a physician", () => {
  const post = { ...samplePosts()[0], sample: false };
  const html = articlePage(source, post);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.author["@type"], "Organization");
  assert.equal(schema.author.name, "부부한의원");
  assert(html.includes("진료 전에 정리할 내용"));
  assert(html.includes('<base href="/">'));
});

test("unreviewed sample posts have no Article structured data", () => {
  assert(!articlePage(source, samplePosts()[0]).includes('"@type":"Article"'));
});

test("main section order is doctors, health, gallery", () => {
  assert(source.indexOf('id="doctors"') < source.indexOf('id="health"'));
  assert(source.indexOf('id="health"') < source.indexOf('id="gallery"'));
});
