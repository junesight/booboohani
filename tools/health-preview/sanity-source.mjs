import {toHTML} from "@portabletext/to-html";
import {createImageUrlBuilder} from "@sanity/image-url";
import settings from "../../health-config.json" with {type: "json"};
import {cleanBody, escapeHtml, categoryName, safeImage} from "./content.mjs";

const builder = createImageUrlBuilder({projectId: settings.projectId, dataset: settings.dataset});
const colors = new Set(["#20251f", "#163d32", "#b99a63", "#b33939", "#2765a1", "#777777"]);
const highlights = new Set(["#fff0a8", "#dcebdc", "#f5dede", "#ddeafa"]);
const sizes = new Set(["14px", "16px", "18px", "22px", "28px", "36px"]);

export function imageUrl(value, thumbnail = false) {
  try {
    const image = builder.image(value).auto("format").quality(85);
    return safeImage(thumbnail ? image.width(600).height(600).fit("crop").url() : image.width(1400).fit("max").url());
  } catch { return ""; }
}

export function bodyHtml(body = []) {
  return cleanBody(toHTML(body, {
    components: {
      block: {
        center: ({children}) => `<p class="ql-align-center">${children}</p>`,
        right: ({children}) => `<p class="ql-align-right">${children}</p>`,
      },
      marks: {
        underline: ({children}) => `<u>${children}</u>`,
        "strike-through": ({children}) => `<s>${children}</s>`,
        textColor: ({children, value}) => colors.has(value?.value) ? `<span style="color:${value.value}">${children}</span>` : children,
        textSize: ({children, value}) => sizes.has(value?.value) ? `<span style="font-size:${value.value}">${children}</span>` : children,
        highlight: ({children, value}) => highlights.has(value?.value) ? `<span style="background-color:${value.value}">${children}</span>` : children,
      },
      types: {
        image: ({value}) => {
          const src = imageUrl(value);
          if (!src) return "";
          const width = ["640", "400", "240"].includes(value.displayWidth) ? value.displayWidth : "100%";
          return `<p><img src="${escapeHtml(src)}" alt="${escapeHtml(value.alt || "")}" width="${width}"></p>${value.caption ? `<p class="health-image-caption">${escapeHtml(value.caption)}</p>` : ""}`;
        },
      },
    },
    onMissingComponent: false,
  }));
}

export function mapPost(doc) {
  if (!doc || !/^[A-Za-z0-9_-]{1,128}$/.test(doc._id) || !categoryName(doc.category) || typeof doc.title !== "string" || !doc.title.trim()) return null;
  const cover = imageUrl(doc.coverImage);
  const createdAt = doc._createdAt;
  const updatedAt = doc._updatedAt;
  const publishedAt = doc.publishedAt || createdAt;
  if (!cover || ![createdAt, updatedAt, publishedAt].every((date) => typeof date === "string" && Number.isFinite(Date.parse(date)))) return null;
  return {id: doc._id, title: doc.title.slice(0, 160), category: doc.category, cover, coverThumb: imageUrl(doc.coverImage, true), coverAlt: doc.coverImage?.alt || doc.title, html: bodyHtml(doc.body), status: "published", sample: false, createdAt, updatedAt, publishedAt};
}

export async function fetchSanityPosts(fetcher = fetch) {
  const url = new URL(`https://${settings.projectId}.api.sanity.io/v${settings.apiVersion}/data/query/${settings.dataset}`);
  url.searchParams.set("query", '*[_type == "healthPost" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(publishedAt desc) {_id, _createdAt, _updatedAt, title, category, coverImage, publishedAt, body}');
  url.searchParams.set("perspective", "published");
  const response = await fetcher(url, {signal: AbortSignal.timeout(10000)});
  if (!response.ok) throw Object.assign(new Error("Sanity 연결을 확인해 주세요."), {status: 503});
  const payload = await response.json();
  if (!Array.isArray(payload.result)) throw Object.assign(new Error("Sanity 응답을 확인해 주세요."), {status: 503});
  const posts = payload.result.map(mapPost);
  if (posts.some((post) => !post)) throw Object.assign(new Error("발행된 칼럼의 필수 항목을 확인해 주세요. 기존 배포는 유지됩니다."), {status: 503});
  return posts;
}

export function studioLinks(html) {
  return html.replace(/href="\/health-editor\.html(?:\?id=([^"&]+))?"/g, (_, id) => `href="${settings.studioUrl}${id ? `/structure/healthPost;${encodeURIComponent(id)}` : ""}"`);
}
