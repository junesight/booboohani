import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFile} from "node:fs/promises";

const script = await readFile(new URL("../../article-toc.js", import.meta.url), "utf8");
function setup(href = "https://booboo.co.kr/health/test.html#article-section-1", reduced = false) {
  const calls = [];
  const attributes = new Map();
  let click, blur;
  const target = {hasAttribute: (key) => attributes.has(key), setAttribute: (key, value) => attributes.set(key, value), removeAttribute: (key) => attributes.delete(key), focus: (options) => calls.push(["focus", options]), addEventListener: (_, fn) => { blur = fn; }, scrollIntoView: (options) => calls.push(["scroll", options])};
  const state = {existing: true};
  const link = {href, target: "", hasAttribute: () => false};
  vm.runInNewContext(script, {
    document: {querySelector: () => ({addEventListener: (_, fn) => { click = fn; }}), getElementById: (id) => id === "article-section-1" ? target : null},
    location: new URL("https://booboo.co.kr/health/test.html"), URL,
    history: {state, replaceState: (...args) => calls.push(["replace", ...args])}, matchMedia: () => ({matches: reduced}),
  });
  const event = {button: 0, target: {closest: () => link}, preventDefault: () => calls.push(["prevent"])};
  return {calls, click, event, link, attributes, state, blur: () => blur()};
}

test("TOC replaces the current entry, preserves state and moves focus without creating history", () => {
  const s = setup();
  s.click(s.event);
  assert.equal(s.calls[1][0], "replace");
  assert.equal(s.calls[1][1], s.state);
  assert.equal(s.calls[1][3], s.link.href);
  assert.equal(s.attributes.get("tabindex"), "-1");
  assert.equal(s.calls.find(([name]) => name === "scroll")[1].behavior, "smooth");
  s.blur();
  assert.equal(s.attributes.size, 0);
});

test("modified clicks, different pages and missing targets keep normal browser behavior", () => {
  for (const modifier of ["ctrlKey", "metaKey", "shiftKey", "altKey", "defaultPrevented"]) {
    const s = setup(); s.click({...s.event, [modifier]: true}); assert.equal(s.calls.length, 0);
  }
  for (const href of ["https://example.com/#article-section-1", "https://booboo.co.kr/health.html#article-section-1", "https://booboo.co.kr/health/test.html#missing", "https://booboo.co.kr/health/test.html#%ZZ"]) {
    const s = setup(href); s.click(s.event); assert.equal(s.calls.length, 0);
  }
  const s = setup(); s.link.target = "_blank"; s.click(s.event); assert.equal(s.calls.length, 0);
});

test("reduced motion uses an immediate scroll", () => {
  const s = setup(undefined, true); s.click(s.event);
  assert.equal(s.calls.find(([name]) => name === "scroll")[1].behavior, "instant");
});
