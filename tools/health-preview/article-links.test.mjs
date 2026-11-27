import test from "node:test";
import assert from "node:assert/strict";
import {parseDocument} from "htmlparser2";
import {articleLinks, samplePosts} from "./content.mjs";

const nodes = (node, predicate) => (node.children || []).flatMap((child) => [...(predicate(child) ? [child] : []), ...nodes(child, predicate)]);
const hasClass = (node, name) => (node.attribs?.class || "").split(/\s+/).includes(name);
const fixtures = () => Array.from({length: 8}, (_, index) => ({...samplePosts()[0], id: `fixture-${index}`, title: `글 제목 ${index}`, category: index === 1 ? "diet" : "pain", publishedAt: new Date(Date.UTC(2026, 10, 27, 12-index)).toISOString()}));

test("previous is older, next is newer, related list is same category newest first and capped at five", () => {
  const posts = fixtures();
  const current = posts[3];
  const draft = {...posts[0], id: "draft-secret", status: "draft"};
  const html = articleLinks(current, [draft, ...posts.toReversed()], {staticMode: true});
  const doc = parseDocument(html);
  assert.equal(nodes(doc, (node) => node.attribs?.rel === "prev")[0].attribs.href, "/health/fixture-4.html");
  assert.equal(nodes(doc, (node) => node.attribs?.rel === "next")[0].attribs.href, "/health/fixture-2.html");
  const list = nodes(doc, (node) => hasClass(node, "health-related-list"))[0];
  assert.deepEqual(nodes(list, (node) => node.name === "a").map((node) => node.attribs.href), [0, 2, 4, 5, 6].map((id) => `/health/fixture-${id}.html`));
  assert.equal(nodes(list, (node) => node.name === "img").length, 5);
  assert(!html.includes("draft-secret"));
  assert(!html.includes("<time"));
  assert(html.includes('href="/health/category/pain.html"'));
});

test("edge and empty states have no broken adjacent links and preserve the category more link", () => {
  const posts = fixtures();
  const first = parseDocument(articleLinks(posts[0], posts));
  assert.equal(nodes(first, (node) => node.attribs?.rel === "next").length, 0);
  const last = parseDocument(articleLinks(posts.at(-1), posts));
  assert.equal(nodes(last, (node) => node.attribs?.rel === "prev").length, 0);
  const single = articleLinks(posts[1], [posts[1]]);
  assert.equal(nodes(parseDocument(single), (node) => node.attribs?.["aria-disabled"] === "true").length, 2);
  assert(single.includes("같은 분야의 다른 글이 아직 없습니다."));
  assert(single.includes('href="/health.html?category=diet"'));
  assert.equal(articleLinks({...posts[0], status: "draft"}, posts), "");
});

test("related titles are escaped and invalid thumbnails use the local fallback", () => {
  const posts = fixtures();
  posts[0].title = '<img src=x onerror="alert(1)">';
  posts[0].cover = "javascript:alert(1)";
  posts[0].coverThumb = "";
  const html = articleLinks(posts[3], posts, {staticMode: true});
  assert(html.includes("&lt;img"));
  assert(!html.includes('src="javascript:'));
  assert(html.includes('src="/assets/booboo-logo.webp"'));
});
