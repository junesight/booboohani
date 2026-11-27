import sanitizeHtml from "sanitize-html";
import { withMobileNavigation, icon } from "./navigation.mjs";
import { articleContents, articleToc } from "./toc.mjs";
import { clinicPanel } from "./clinic-panel.mjs";
import settings from "../../health-config.json" with { type: "json" };

export const categories = settings.categories;
export const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
export const categoryName = (id) => categories.find(([value]) => value === id)?.[1] || "";
export const plainText = (html) => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
export function safeImage(src) {
  if (typeof src !== "string" || src.includes("..")) return "";
  if (/^\/(?:assets\/[a-zA-Z0-9_./-]+|health-media\/[a-f0-9-]+(?:-thumb)?\.webp)$/.test(src)) return src;
  try {
    const url = new URL(src);
    if (url.origin === "https://cdn.sanity.io" && url.pathname.startsWith(`/images/${settings.projectId}/${settings.dataset}/`) && !url.username && !url.password) return src;
  } catch {}
  return "";
}

export function cleanBody(html = "") {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "span", "a", "ul", "ol", "li", "blockquote", "img"],
    allowedAttributes: { "*": ["class", "style"], a: ["href", "target", "rel"], img: ["src", "alt", "width"] },
    allowedClasses: { "*": ["ql-align-center", "ql-align-right", "ql-align-justify", "ql-size-small", "ql-size-large", "ql-size-huge", "ql-indent-1", "ql-indent-2", "ql-indent-3"] },
    allowedStyles: { "*": {
      color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3}\s*\)$/],
      "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3}\s*\)$/],
      "font-size": [/^(14|16|18|22|28|36)px$/],
      "text-align": [/^(left|center|right|justify)$/],
    } },
    allowedSchemes: ["https", "http", "tel", "mailto"],
    allowProtocolRelative: false,
    transformTags: { a: (tag, attrs) => ({ tagName: tag, attribs: { ...attrs, target: "_blank", rel: "noopener noreferrer" } }) },
    exclusiveFilter: (frame) => frame.tag === "img" && !safeImage(frame.attribs.src),
  });
}

export function samplePosts() {
  const entries = [
    ["sample-pain", "pain", "허리 통증으로 내원하기 전, 어떤 내용을 정리하면 좋을까요?", "/assets/gallery/gallery-1f-07.webp", "부부한의원 진료실"],
    ["sample-accident", "accident", "교통사고 후 첫 진료, 상담 전에 확인할 내용", "/assets/gallery/gallery-1f-05.webp", "부부한의원 접수 공간"],
    ["sample-diet", "diet", "다이어트 상담에서 함께 살펴보는 일상 기록", "/assets/gallery/gallery-1f-12.webp", "부부한의원 검진실"],
    ["sample-treatment", "treatment", "한약 상담 전, 복용 중인 약을 알려주세요", "/assets/gallery/gallery-3f-06.webp", "부부한의원 한약 조제실"],
  ];
  return entries.map(([id, category, title, cover, coverAlt], index) => ({
    id, category, title, cover, coverThumb: cover, coverAlt,
    html: `<p>이 글은 로컬 화면 검수를 위한 예시이며, 실제 발행된 의료 칼럼이 아닙니다.</p><h2>진료 전에 정리할 내용</h2><p>상담하고 싶은 내용, 불편함을 느낀 시점, 현재 복용 중인 약과 이전 진료 자료를 정리해 주세요.</p><p>구체적인 진료 내용은 내원 시 의료진과 상담해 주세요.</p>`,
    status: "published", sample: true, revision: 1,
    createdAt: `2026-11-26T0${9-index}:00:00.000Z`, updatedAt: `2026-11-26T0${9-index}:00:00.000Z`, publishedAt: `2026-11-26T0${9-index}:00:00.000Z`,
  }));
}

export function publishedPosts(posts) {
  return posts.filter((p) => p.status === "published").sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function cards(posts) {
  return posts.map((post) => `<article class="health-card"><a href="/health/${escapeHtml(post.id)}.html"><div class="health-card-image"><img src="${escapeHtml(post.coverThumb || post.cover)}" alt="${escapeHtml(post.coverAlt)}" width="600" height="600" loading="lazy" decoding="async">${post.sample ? '<span class="health-sample">예시</span>' : ""}</div><div class="health-card-copy"><p class="health-category">${escapeHtml(categoryName(post.category))}</p><h3>${escapeHtml(post.title)}</h3></div></a></article>`).join("");
}

export function mobileContactActions(source) {
  const actions = source.match(/<div class="floating-actions"[\s\S]*?<\/div>/)?.[0];
  if (!actions) throw new Error("Missing homepage contact actions.");
  return actions.replace('class="floating-actions"', 'class="floating-actions mobile-contact-only"').replaceAll('src="assets/', 'src="/assets/');
}

export function withMobileContact(html, source) {
  if (html.includes("</footer>") && !/class="[^"]*\bfloating-actions\b/.test(html)) {
    html = html.replace("</body>", `${mobileContactActions(source)}</body>`);
  }
  return withMobileNavigation(html);
}

export function shell(source, { title, description, path, body, schema = null, production = false }) {
  const header = source.match(/<header class="site-header"[\s\S]*?<\/header>/)[0]
    .replace('href="#health"', 'href="/health.html"')
    .replaceAll('href="#', 'href="/#');
  const footer = source.match(/<footer>[\s\S]*?<\/footer>/)[0].replace(/<button class="admin-trigger"[^>]*>[\s\S]*?<\/button>/, "").replaceAll('href="#', 'href="/#');
  const fonts = source.match(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com"[\s\S]*?<\/noscript>/)?.[0] || "";
  const image = schema?.image || "https://booboo.co.kr/assets/og-image-wide.png";
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><base href="/"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="${production ? "index,follow" : "noindex,nofollow"}"><title>${escapeHtml(title)} | 부부한의원</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="https://booboo.co.kr${escapeHtml(path)}"><meta property="og:title" content="${escapeHtml(title)} | 부부한의원"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="${schema ? "article" : "website"}"><meta property="og:url" content="https://booboo.co.kr${escapeHtml(path)}"><meta property="og:image" content="${escapeHtml(image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${escapeHtml(image)}"><link rel="icon" href="/assets/booboo-logo.webp">${fonts}<link rel="stylesheet" href="/styles.css?v=1.9.11"><link rel="stylesheet" href="/health.css">${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>` : ""}</head><body class="health-public">${header}${body}${footer}${mobileContactActions(source)}</body></html>`;
}

export function listingPath(category = "", page = 1) {
  if (category) return `/health/category/${category}${page > 1 ? `-page-${page}` : ""}.html`;
  return page > 1 ? `/health/page/${page}.html` : "/health.html";
}

export function listPage(source, posts, url, options = {}) {
  const category = categories.some(([id]) => id === url.searchParams.get("category")) ? url.searchParams.get("category") : "";
  const query = (url.searchParams.get("q") || "").trim().slice(0, 100);
  const filtered = publishedPosts(posts).filter((p) => (!category || p.category === category) && (!query || `${p.title} ${plainText(p.html)}`.toLowerCase().includes(query.toLowerCase())));
  const pageCount = Math.max(1, Math.ceil(filtered.length / 12));
  const page = Math.min(pageCount, Math.max(1, Number.parseInt(url.searchParams.get("page"), 10) || 1));
  const link = (cat, p = 1) => options.staticMode ? listingPath(cat, p) : `/health.html?${new URLSearchParams({ ...(cat ? { category: cat } : {}), ...(query ? { q: query } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;
  const title = `${category ? `${categoryName(category)} · ` : ""}건강 정보 및 칼럼${page > 1 ? ` · ${page}페이지` : ""}`;
  const heading = category ? categoryName(category) : "건강 정보 및 칼럼";
  const results = filtered.length ? `<div class="health-grid">${cards(filtered.slice((page-1)*12, page*12))}</div>` : '<div class="health-empty"><h2>등록된 글이 없습니다.</h2><a href="/health.html">전체 글 보기</a></div>';
  const pagination = pageCount > 1 ? `<nav class="health-pagination" aria-label="페이지">${Array.from({ length: pageCount }, (_, i) => `<a href="${escapeHtml(link(category, i+1))}" ${page === i+1 ? 'aria-current="page"' : ""}>${i+1}</a>`).join("")}</nav>` : "";
  const body = `<main class="health-list-page section" data-health-category="${category}"><div class="health-page-heading"><div><p class="eyebrow">HEALTH & COLUMN</p><h1>${escapeHtml(heading)}</h1></div><a class="health-manage-link" href="/health-editor.html">글 관리</a></div><nav class="health-categories" aria-label="칼럼 카테고리">${[["", "전체"], ...categories].map(([id, label]) => `<a href="${escapeHtml(link(id))}" ${id === category ? 'aria-current="page"' : ""}>${escapeHtml(label)}</a>`).join("")}</nav><div class="health-list-tools"><p>전체 <strong id="health-result-count">${filtered.length}</strong>개</p><form role="search" action="${options.staticMode ? listingPath(category) : "/health.html"}">${category && !options.staticMode ? `<input type="hidden" name="category" value="${escapeHtml(category)}">` : ""}<input type="search" name="q" value="${escapeHtml(query)}" placeholder="검색어 입력" aria-label="칼럼 검색"><button type="submit" title="검색" aria-label="검색"><i data-lucide="search"></i></button></form></div><div id="health-results">${results}${pagination}</div></main><script src="/health-vendor/lucide.js"></script><script src="/health-public.js"></script>`;
  return withMobileNavigation(shell(source, { title, description: category ? `부부한의원의 ${categoryName(category)} 건강 정보 및 칼럼입니다.` : "부부한의원이 전하는 통증, 교통사고, 여성·소아, 소화·순환·자율신경, 다이어트, 치료 및 계절 건강 정보입니다.", path: options.staticMode ? listingPath(category, page) : "/health.html", body, production: options.production }));
}

export function articleLinks(post, posts = [], options = {}) {
  if (post.status !== "published") return "";
  const ordered = publishedPosts(posts);
  const index = ordered.findIndex((item) => item.id === post.id);
  const previous = index >= 0 ? ordered[index + 1] : null;
  const next = index > 0 ? ordered[index - 1] : null;
  const adjacent = (item, direction, label) => {
    const heading = `<span class="health-adjacent-label">${direction === "previous" ? icon("ArrowLeft") : ""}${label}${direction === "next" ? icon("ArrowRight") : ""}</span>`;
    return item
      ? `<a class="health-adjacent-${direction}" href="/health/${escapeHtml(item.id)}.html" rel="${direction === "previous" ? "prev" : "next"}">${heading}<strong>${escapeHtml(item.title)}</strong></a>`
      : `<div class="health-adjacent-${direction} health-adjacent-empty" aria-disabled="true">${heading}<span>${label}이 없습니다.</span></div>`;
  };
  const related = ordered.filter((item) => item.id !== post.id && item.category === post.category).slice(0, 5);
  const rows = related.map((item) => `<li><a href="/health/${escapeHtml(item.id)}.html" title="${escapeHtml(item.title)}"><img src="${escapeHtml(safeImage(item.coverThumb || item.cover) || "/assets/booboo-logo.webp")}" alt="" width="64" height="64" loading="lazy" decoding="async"><span>${escapeHtml(item.title)}</span></a></li>`).join("");
  const categoryUrl = options.staticMode ? listingPath(post.category) : `/health.html?category=${encodeURIComponent(post.category)}`;
  return `<div class="health-article-links"><nav class="health-adjacent" aria-label="칼럼 이전글 및 다음글">${adjacent(previous, "previous", "이전글")}${adjacent(next, "next", "다음글")}</nav><section class="health-related" aria-labelledby="health-related-title"><h2 id="health-related-title">같은 분야의 다른 글</h2>${rows ? `<ul class="health-related-list">${rows}</ul>` : '<p class="health-related-empty">같은 분야의 다른 글이 아직 없습니다.</p>'}<div class="health-related-more"><a class="health-outline-button" href="${escapeHtml(categoryUrl)}" aria-label="${escapeHtml(categoryName(post.category))} 분야 글 더보기">더보기${icon("ArrowRight")}</a></div></section></div>`;
}

export function articlePage(source, post, options = {}) {
  const clinic = clinicPanel(source, escapeHtml);
  const cleanHtml = cleanBody(post.html);
  const contents = articleContents(cleanHtml);
  const date = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(post.publishedAt || post.updatedAt));
  const description = plainText(post.html).slice(0, 140);
  const body = `<main class="health-article"><nav class="health-breadcrumb" aria-label="현재 위치"><a href="/">홈</a><span>/</span><a href="/health.html">건강 정보 및 칼럼</a><span>/</span><a href="/health.html?category=${post.category}">${escapeHtml(categoryName(post.category))}</a></nav><article><header class="health-article-heading"><p class="health-category">${escapeHtml(categoryName(post.category))}${post.sample ? " · 예시" : ""}</p><h1>${escapeHtml(post.title)}</h1><p class="health-article-meta">부부한의원 <span>·</span> <time datetime="${escapeHtml(post.publishedAt || post.updatedAt)}">${date}</time>${post.status === "draft" ? " · 임시저장" : ""}</p></header><img class="health-article-cover" src="${escapeHtml(post.cover)}" alt="${escapeHtml(post.coverAlt)}" width="1000" height="750"><div class="health-prose">${cleanBody(post.html)}</div></article><div class="health-article-bottom"><a class="health-outline-button" href="/health.html">목록으로</a><a href="/health-editor.html?id=${escapeHtml(post.id)}" class="health-manage-link">글 수정</a></div></main>`;
  const schema = post.sample || post.status !== "published" ? null : { "@context": "https://schema.org", "@type": "Article", headline: post.title, description, image: post.cover.startsWith("https://") ? post.cover : `https://booboo.co.kr${post.cover}`, author: { "@type": "Organization", name: "부부한의원", url: "https://booboo.co.kr/" }, publisher: { "@type": "Organization", name: "부부한의원", url: "https://booboo.co.kr/" }, datePublished: post.publishedAt, dateModified: post.updatedAt, mainEntityOfPage: `https://booboo.co.kr/health/${post.id}.html`, articleSection: categoryName(post.category) };
  const articleBody = body.replace(`<div class="health-prose">${cleanHtml}</div>`, `<div class="health-prose">${contents.html}</div>`)
    .replace('</main>', `${articleLinks(post, options.posts, options)}</main>`)
    .replace('<main class="health-article">', `<div class="health-article-layout">${articleToc(contents.headings, `/health/${post.id}.html`, escapeHtml)}<main id="article-top" class="health-article">`)
    .replace("</main>", `</main>${clinic.sidebar}</div>${clinic.popup}${contents.headings.length ? '<script src="/article-toc.js" defer></script>' : ""}`);
  return withMobileNavigation(shell(source, { title: post.title, description, path: `/health/${post.id}.html`, body: options.staticMode ? articleBody.replace(`href="/health.html?category=${post.category}"`, `href="${listingPath(post.category)}"`) : articleBody, schema, production: options.production }));
}
