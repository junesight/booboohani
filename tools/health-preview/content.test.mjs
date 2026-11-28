import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { categories, samplePosts, cleanBody, safeImage, cards, homeColumns, listPage, articlePage, publishedPosts } from "./content.mjs";

const source = await readFile(new URL("../../index.html", import.meta.url), "utf8");

test("all seven categories and four labelled sample cards", () => {
  assert.equal(categories.length, 7);
  assert.equal(samplePosts().length, 4);
  assert.equal((cards(samplePosts()).match(/class="health-card"/g) || []).length, 4);
  assert.equal((cards(samplePosts()).match(/class="health-sample"/g) || []).length, 4);
});

test("home carousel includes the newest twenty published articles and no draft", () => {
  const posts = Array.from({length: 25}, (_, i) => ({...samplePosts()[0], id: `home-${i}`, publishedAt: new Date(Date.UTC(2026, 10, 1+i)).toISOString()}));
  posts.push({...posts[24], id: "hidden-draft", status: "draft"});
  const html = homeColumns(posts);
  assert.equal((html.match(/class="health-card"/g) || []).length, 20);
  assert(html.indexOf("/home-24.html") < html.indexOf("/home-23.html"));
  assert(html.includes("/home-5.html"));
  assert(!html.includes("/home-4.html"));
  assert(!html.includes("hidden-draft"));
  assert(html.includes('src="/health-carousel.js"'));
  assert.equal((homeColumns(posts.slice(0, 5)).match(/class="health-card"/g) || []).length, 5);
  assert(homeColumns([]).includes("등록된 글이 없습니다."));
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

test("image caption class survives sanitizing and the full article renderer", () => {
  const caption = '<p class="health-image-caption">이미지 설명입니다.</p>';
  assert.equal(cleanBody(caption), caption);
  const post = {...samplePosts()[0], html: `<p>일반 본문</p>${caption}`};
  const html = articlePage(source, post);
  assert(html.includes(caption));
  assert(html.includes("<p>일반 본문</p>"));
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

test("listing heading keeps the all title and uses only the selected category name", () => {
  const all = listPage(source, samplePosts(), new URL("http://localhost/health.html"));
  assert(all.includes("<h1>건강 정보 및 칼럼</h1>"));
  for (const [id, label] of categories) {
    const html = listPage(source, samplePosts(), new URL(`http://localhost/health.html?category=${id}`));
    assert(html.includes(`<h1>${label.replaceAll("&", "&amp;")}</h1>`));
  }
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

test("all eight care page headers link to health between doctors and gallery", async () => {
  for (const name of ["spine", "joint", "accident", "sports", "diet", "digestion", "women-children", "autonomic"]) {
    const html = await readFile(new URL(`../../care-${name}.html`, import.meta.url), "utf8");
    const header = html.match(/<header class="site-header"[\s\S]*?<\/header>/)[0];
    const link = '<a href="/health.html">건강 정보</a>';
    assert.equal(header.split(link).length - 1, 1, name);
    assert(header.indexOf("의료진 소개") < header.indexOf(link), name);
    assert(header.indexOf(link) < header.indexOf("한의원 둘러보기"), name);
    assert(html.includes('class="care-detail-page"'), name);
  }
  const homeHeader = source.match(/<header class="site-header"[\s\S]*?<\/header>/)[0];
  assert(homeHeader.includes('<a href="#health">건강 정보</a>'));
});

test("all eight care pages have one desktop phone number with the original contact links", async () => {
  for (const name of ["spine", "joint", "accident", "sports", "diet", "digestion", "women-children", "autonomic"]) {
    const html = await readFile(new URL(`../../care-${name}.html`, import.meta.url), "utf8");
    assert.equal((html.match(/<small class="contact-phone-number">061-272-1075<\/small>/g) || []).length, 1, name);
    assert(html.includes('href="tel:061-272-1075"'), name);
    assert(html.includes('href="http://pf.kakao.com/_VlVkG/chat"'), name);
    assert(html.includes("bizes/1260872"), name);
  }
});

test("column lists, categories and articles share the scoped public theme class", () => {
  const pages = [
    listPage(source, samplePosts(), new URL("http://localhost/health.html")),
    ...categories.map(([id]) => listPage(source, samplePosts(), new URL(`http://localhost/health.html?category=${id}`))),
    articlePage(source, samplePosts()[0]),
  ];
  for (const html of pages) assert(html.includes('<body class="health-public">'));
  assert(!source.includes('<body class="health-public">'));
});

test("column headers link directly to the health listing while home retains its section link", () => {
  const posts = Array.from({length: 14}, (_, index) => ({...samplePosts()[0], id: `page-${index}`}));
  const pages = [
    listPage(source, posts, new URL("http://localhost/health.html")),
    listPage(source, posts, new URL("http://localhost/health.html?page=2"), {staticMode: true}),
    ...categories.map(([id]) => listPage(source, posts, new URL(`http://localhost/health.html?category=${id}`), {staticMode: true})),
    articlePage(source, posts[0]),
  ];
  for (const html of pages) {
    const header = html.match(/<header class="site-header"[\s\S]*?<\/header>/)[0];
    assert(header.includes('<a href="/health.html">건강 정보</a>'));
    assert(!header.includes('href="/#health"'));
    assert(header.includes('href="/#doctors"'));
  }
  assert(source.includes('<a href="#health">건강 정보</a>'));
});
