import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { withMobileNavigation } from "./navigation.mjs";
import { listPage, articlePage, samplePosts } from "./content.mjs";

const source = await readFile(new URL("../../index.html", import.meta.url), "utf8");
test("public headers have one accessible drawer, eight care routes and a direct health route", async () => {
  const pages = [source, listPage(source, [], new URL("http://localhost/health.html")), articlePage(source, samplePosts()[0])];
  for (const name of ["spine", "joint", "accident", "sports", "diet", "digestion", "women-children", "autonomic"]) pages.push(await readFile(new URL(`../../care-${name}.html`, import.meta.url), "utf8"));
  pages.push(await readFile(new URL("../../privacy.html", import.meta.url), "utf8"));
  for (const page of pages) {
    const html = withMobileNavigation(page);
    assert.equal((html.match(/id="mobile-navigation"/g) || []).length, 1);
    assert.equal((html.match(/class="mobile-menu-toggle"/g) || []).length, 1);
    assert(html.includes('aria-controls="mobile-navigation" aria-expanded="false" hidden'));
    const drawer = html.slice(html.indexOf('<dialog id="mobile-navigation"'));
    assert.equal((drawer.match(/href="\/care-/g) || []).length, 8);
    assert(drawer.includes('<a href="/health.html">건강 정보</a>'));
    assert(drawer.includes('<a href="/#doctors">의료진 소개</a>'));
    assert.equal(withMobileNavigation(html), html);
  }
  assert(withMobileNavigation(source).includes('href="#health">건강 정보'));
});

test("navigation does not alter verification files or editor documents", () => {
  for (const html of ["google-site-verification: test.html", "<body><form>Editor</form></body>"]) assert.equal(withMobileNavigation(html), html);
});
