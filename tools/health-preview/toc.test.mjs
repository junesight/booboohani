import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {articleContents} from "./toc.mjs";
import {articlePage, cleanBody, samplePosts} from "./content.mjs";

test("headings keep formatting and receive deterministic unique anchors in document order", () => {
  const result = articleContents(cleanBody('<h2>같은 <strong>제목</strong> &amp; 질문</h2><p>본문</p><h3>하위 제목</h3><h2>같은 제목</h2><h2> </h2><h4>제외</h4>'));
  assert.deepEqual(result.headings, [
    {id: "article-section-1", level: "h2", text: "같은 제목 & 질문"},
    {id: "article-section-2", level: "h3", text: "하위 제목"},
    {id: "article-section-3", level: "h2", text: "같은 제목"},
  ]);
  assert(result.html.includes('<h2 id="article-section-1">같은 <strong>제목</strong> &amp; 질문</h2>'));
  assert.deepEqual(articleContents(cleanBody(result.html)), result);
});

test("article TOC is static HTML, escapes labels, preserves content, and is absent without headings", async () => {
  const source = await readFile(new URL("../../index.html", import.meta.url), "utf8");
  const post = {...samplePosts()[0], html: '<h2>&lt;태그&gt; &amp; 질문</h2><p><u>본문</u><img src="/assets/booboo-logo.webp" alt="로고"></p>'};
  const html = articlePage(source, post);
  assert(html.includes('<main id="article-top" class="health-article">'));
  const topLink = `<a href="/health/${post.id}.html#article-top">처음으로</a>`;
  assert(html.includes(topLink));
  assert(html.indexOf(topLink) < html.indexOf(`href="/health/${post.id}.html#article-section-1"`));
  assert(html.includes(`<a href="/health/${post.id}.html#article-section-1">&lt;태그&gt; &amp; 질문</a>`));
  assert(html.includes('<nav aria-labelledby="health-toc-title">'));
  assert(html.includes('<h2 id="article-section-1">&lt;태그&gt; &amp; 질문</h2>'));
  assert(html.includes('<u>본문</u>'));
  assert(!articlePage(source, {...post, html: "<p>본문만</p>"}).includes('class="health-toc"'));
});
