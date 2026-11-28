import {readFile, writeFile, mkdir, readdir, cp, rm, appendFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {XMLParser, XMLBuilder} from "fast-xml-parser";
import settings from "../../health-config.json" with {type: "json"};
import {categories, categoryName, homeColumns, publishedPosts, plainText, listingPath, listPage, articlePage, withMobileContact} from "./content.mjs";
import {fetchSanityPosts, studioLinks} from "./sanity-source.mjs";
import {scheduleEngine} from "./clinic-panel.mjs";

export const siteRoot = fileURLToPath(new URL("../../", import.meta.url));
const outputFile = async (directory, relative, text) => {
  const file = path.join(directory, relative);
  await mkdir(path.dirname(file), {recursive: true});
  await writeFile(file, text);
};
const jsonScript = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");
const copyFiles = ["styles.css", "script.js", "health.css", "health-public.js", "health-carousel.js", "mobile-navigation.js", "article-clinic.js", "article-toc.js", "robots.txt", "llms.txt", "CNAME"];

export async function buildSite({posts, output = path.join(siteRoot, "dist"), sourceCommit, sourceDate, copyAssets = true} = {}) {
  const directory = path.resolve(output);
  if (directory === siteRoot || siteRoot.startsWith(directory + path.sep)) throw new Error("Build output must not overwrite the source directory.");
  if (!/^https:\/\/[a-z0-9-]+\.sanity\.studio$/.test(settings.studioUrl)) throw new Error("Set the verified HTTPS Studio URL before building production pages.");
  const articles = publishedPosts(posts === undefined ? await fetchSanityPosts() : posts).filter((post) => !post.sample);
  if (articles.some((post) => post.cover.startsWith("/health-media/"))) throw new Error("Local preview uploads must not enter the production build.");
  const commit = sourceCommit || execFileSync("git", ["rev-parse", "HEAD"], {cwd: siteRoot, encoding: "utf8"}).trim();
  const modified = sourceDate || execFileSync("git", ["log", "-1", "--format=%cI"], {cwd: siteRoot, encoding: "utf8"}).trim();
  const source = await readFile(path.join(siteRoot, "index.html"), "utf8");
  const cssVersions = new Map();
  for (const file of ["styles.css", "health.css"]) {
    cssVersions.set(file, createHash("sha256").update(await readFile(path.join(siteRoot, file))).digest("hex").slice(0, 12));
  }
  const outputPage = (relative, html) => outputFile(directory, relative, html.replace(
    /href=(["'])(\/?(?:styles|health)\.css)(?:\?[^"']*)?\1/g,
    (_, quote, file) => `href=${quote}${file}?v=${cssVersions.get(file.replace(/^\//, ""))}${quote}`,
  ));
  await rm(directory, {recursive: true, force: true});
  await mkdir(directory, {recursive: true});
  if (copyAssets) await cp(path.join(siteRoot, "assets"), path.join(directory, "assets"), {recursive: true});
  for (const file of copyFiles) await cp(path.join(siteRoot, file), path.join(directory, file));
  await outputFile(directory, "article-schedule-engine.js", scheduleEngine(await readFile(path.join(siteRoot, "script.js"), "utf8")));
  for (const file of await readdir(siteRoot)) {
    if (file.endsWith(".html") && !["index.html", "health-editor.html"].includes(file)) {
      const html = await readFile(path.join(siteRoot, file), "utf8");
      await outputPage(file, withMobileContact(html, source));
    }
  }
  await outputFile(directory, ".nojekyll", "");
  const homeCards = homeColumns(articles);
  if (!source.includes("<!-- HEALTH_CARDS_START -->")) throw new Error("Missing homepage article markers.");
  const home = source.replace(/<!-- HEALTH_CARDS_START -->[\s\S]*?<!-- HEALTH_CARDS_END -->/, `<!-- HEALTH_CARDS_START -->${homeCards}<!-- HEALTH_CARDS_END -->`);
  await outputPage("index.html", withMobileContact(home, source));
  await outputFile(directory, "health-vendor/lucide.js", await readFile(path.join(siteRoot, "tools/health-preview/node_modules/lucide/dist/umd/lucide.min.js")));

  const searchData = articles.map((post) => ({id: post.id, title: post.title, category: post.category, categoryLabel: categoryName(post.category), coverThumb: post.coverThumb || post.cover, coverAlt: post.coverAlt, searchText: `${post.title} ${plainText(post.html)}`}));
  const latestDate = (items) => [modified, ...items.map((post) => post.updatedAt)].sort().at(-1).slice(0, 10);
  const addedUrls = [];
  for (const category of ["", ...categories.map(([id]) => id)]) {
    const selected = articles.filter((post) => !category || post.category === category);
    const count = Math.max(1, Math.ceil(selected.length / 12));
    for (let page = 1; page <= count; page++) {
      const url = new URL("https://booboo.co.kr/health.html");
      if (category) url.searchParams.set("category", category);
      url.searchParams.set("page", String(page));
      let html = listPage(source, articles, url, {staticMode: true, production: true});
      html = studioLinks(html).replace('<script src="/health-public.js">', `<script id="health-search-data" type="application/json">${jsonScript(searchData)}</script><script src="/health-public.js">`);
      const relative = listingPath(category, page);
      await outputPage(relative.slice(1), html);
      addedUrls.push({loc: `https://booboo.co.kr${relative}`, lastmod: latestDate(selected)});
    }
  }
  for (const post of articles) {
    await outputPage(`health/${post.id}.html`, studioLinks(articlePage(source, post, {production: true, staticMode: true, posts: articles})));
    addedUrls.push({loc: `https://booboo.co.kr/health/${post.id}.html`, lastmod: post.updatedAt.slice(0, 10)});
  }
  const parser = new XMLParser({ignoreAttributes: false});
  const sitemap = parser.parse(await readFile(path.join(siteRoot, "sitemap.xml"), "utf8"));
  const existingUrls = Array.isArray(sitemap.urlset.url) ? sitemap.urlset.url : [sitemap.urlset.url];
  const rootEntry = existingUrls.find((entry) => entry.loc === "https://booboo.co.kr/");
  if (rootEntry) rootEntry.lastmod = latestDate(articles);
  sitemap.urlset.url = [...existingUrls.filter((entry) => !entry.loc.startsWith("https://booboo.co.kr/health")), ...addedUrls];
  await outputFile(directory, "sitemap.xml", new XMLBuilder({ignoreAttributes: false, format: true}).build(sitemap));

  const hash = createHash("sha256");
  async function hashFiles(dir, prefix = "") {
    for (const entry of (await readdir(dir, {withFileTypes: true})).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === "assets") continue;
      const relative = path.join(prefix, entry.name);
      if (entry.isDirectory()) await hashFiles(path.join(dir, entry.name), relative);
      else { hash.update(relative); hash.update(await readFile(path.join(dir, entry.name))); }
    }
  }
  hash.update(commit);
  await hashFiles(directory);
  const manifest = {version: 1, sourceCommit: commit, contentDigest: hash.digest("hex"), postCount: articles.length};
  await outputFile(directory, "health-manifest.json", JSON.stringify(manifest));
  return {directory, manifest, urls: addedUrls};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await buildSite();
  let changed = true;
  if (process.argv.includes("--check-live")) {
    try {
      const response = await fetch("https://booboo.co.kr/health-manifest.json", {signal: AbortSignal.timeout(10000), cache: "no-store"});
      if (response.ok) changed = (await response.json()).contentDigest !== result.manifest.contentDigest;
    } catch { /* A missing/unreachable manifest must not prevent a valid new deployment. */ }
  }
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
  console.log(JSON.stringify({output: result.directory, posts: result.manifest.postCount, changed, sourceCommit: result.manifest.sourceCommit}));
}
