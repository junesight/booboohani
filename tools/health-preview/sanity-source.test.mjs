import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import settings from "../../health-config.json" with {type: "json"};
import {bodyHtml, mapPost, fetchSanityPosts, studioLinks} from "./sanity-source.mjs";
import {safeImage, articlePage} from "./content.mjs";

const image = { _type: "image", alt: "진료실", asset: {_ref: "image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-1200x1000-webp"} };
const doc = {
  _id: "example-post", _createdAt: "2026-11-27T00:00:00Z", _updatedAt: "2026-11-27T01:00:00Z",
  publishedAt: "2026-11-27T00:00:00Z", title: "검증용 글", category: "pain", coverImage: image,
  body: [{_type: "block", _key: "p", style: "normal", markDefs: [], children: [{_type: "span", text: "칼럼 본문", marks: []}]}],
};

test("Sanity documents map to current clinic cards and Article schema", async () => {
  const post = mapPost(doc);
  assert.equal(post.status, "published");
  assert.equal(post.sample, false);
  assert(post.coverThumb.includes("w=600"));
  assert(post.coverThumb.includes("h=600"));
  assert.equal(safeImage(post.cover), post.cover);
  const source = await readFile(new URL("../../index.html", import.meta.url), "utf8");
  const html = articlePage(source, post);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert(schema.image.startsWith("https://cdn.sanity.io/"));
  assert.equal(schema.author.name, "부부한의원");
});

test("drafts, unknown categories, missing images and invalid timestamps are excluded", () => {
  for (const change of [{_id: "drafts.example"}, {_id: "versions.foo.example"}, {category: "wrong"}, {coverImage: {}}, {_updatedAt: "not a date"}]) assert.equal(mapPost({...doc, ...change}), null);
});

test("only our Sanity project image URLs are allowed", () => {
  assert(safeImage(`https://cdn.sanity.io/images/${settings.projectId}/${settings.dataset}/file.webp?w=600`));
  assert.equal(safeImage("https://cdn.sanity.io/images/other/production/file.webp"), "");
  assert.equal(safeImage(`https://attacker@cdn.sanity.io/images/${settings.projectId}/${settings.dataset}/file.webp`), "");
});

test("Portable Text preserves approved colors, sizes, underline, images and alignment", () => {
  const html = bodyHtml([{_type: "block", _key: "p", style: "center", markDefs: [
    {_key: "color", _type: "textColor", value: "#b33939"}, {_key: "size", _type: "textSize", value: "22px"},
  ], children: [{_type: "span", text: "강조", marks: ["strong", "underline", "color", "size"]}]}, {...image, displayWidth: "400"}]);
  assert(html.includes('class="ql-align-center"'));
  assert(html.includes("<u>"));
  assert(html.includes("color:#b33939"));
  assert(html.includes("font-size:22px"));
  assert(html.includes('width="400"'));
  assert(html.includes('alt="진료실"'));
});

test("unsafe markup and unapproved custom styles cannot enter published HTML", () => {
  const html = bodyHtml([{_type: "block", _key: "p", markDefs: [{_key: "color", _type: "textColor", value: 'red;position:fixed'}], children: [{_type: "span", text: "<script>alert(1)</script>", marks: ["color"]}]}]);
  assert(!html.includes("<script>"));
  assert(!html.includes("position:fixed"));
});

test("data reader always requests published perspective without authentication", async () => {
  let called = false;
  const posts = await fetchSanityPosts(async (url, options) => {
    called = true;
    assert.equal(url.searchParams.get("perspective"), "published");
    assert(url.searchParams.get("query").includes("healthPost"));
    assert.equal(options.headers, undefined);
    return {ok: true, json: async () => ({result: [doc]})};
  });
  assert(called);
  assert.equal(posts.length, 1);
});

test("query failures do not masquerade as empty or local sample data", async () => {
  await assert.rejects(fetchSanityPosts(async () => ({ok: false})), /Sanity/);
  await assert.rejects(fetchSanityPosts(async () => ({ok: true, json: async () => ({})})), /Sanity/);
  await assert.rejects(fetchSanityPosts(async () => ({ok: true, json: async () => ({result: [{...doc, coverImage: {}}]})})), /필수 항목/);
});

test("edit links lead to authenticated Sanity Studio instead of local editor", () => {
  assert(studioLinks('<a href="/health-editor.html?id=example-post">수정</a>').includes(`${settings.studioUrl}/structure/healthPost;example-post`));
});
