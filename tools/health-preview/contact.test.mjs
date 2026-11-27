import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {mobileContactActions, withMobileContact, listPage, articlePage, samplePosts, categories} from "./content.mjs";

const source = await readFile(new URL("../../index.html", import.meta.url), "utf8");
const countBars = (html) => (html.match(/class="floating-actions\b/g) || []).length;

test("mobile contact actions reuse the home links and use root-relative icons", () => {
  const html = mobileContactActions(source);
  assert(html.includes('class="floating-actions mobile-contact-only"'));
  assert.equal((html.match(/<a /g) || []).length, 3);
  for (const href of ["tel:061-272-1075", "https://m.booking.naver.com/booking/13/bizes/1260872?theme=place&lang=ko&area=pll", "http://pf.kakao.com/_VlVkG/chat"]) assert(html.includes(`href="${href}"`));
  for (const name of ["phone", "naver", "kakao"]) assert(html.includes(`src="/assets/floating-${name}.png"`));
});

test("care pages and privacy get one server-rendered bar after the footer", async () => {
  for (const name of ["care-spine", "care-joint", "care-accident", "care-sports", "care-diet", "care-digestion", "care-women-children", "care-autonomic", "privacy"]) {
    const original = await readFile(new URL(`../../${name}.html`, import.meta.url), "utf8");
    const html = withMobileContact(original, source);
    assert.equal(countBars(html), 1, name);
    assert(html.indexOf('class="floating-actions') > html.indexOf("</footer>"), name);
    assert.equal(withMobileContact(html, source), html, name);
  }
});

test("home contact bar is not duplicated; verification and editor documents are unchanged", () => {
  assert.equal(countBars(withMobileContact(source, source)), 1);
  for (const html of ["google-site-verification: test.html", "<html><body><form>Editor</form></body></html>"]) assert.equal(withMobileContact(html, source), html);
});

test("all column views include exactly one bar without client-side injection", () => {
  const pages = [listPage(source, samplePosts(), new URL("http://localhost/health.html")), ...categories.map(([id]) => listPage(source, samplePosts(), new URL(`http://localhost/health.html?category=${id}`))), articlePage(source, samplePosts()[0])];
  for (const html of pages) {
    assert.equal(countBars(html), 1);
    assert(html.includes('class="floating-actions mobile-contact-only"'));
  }
});

test("missing source contact block fails instead of deploying broken contact links", () => {
  assert.throws(() => mobileContactActions("<html></html>"), /Missing homepage contact/);
});
