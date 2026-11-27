import sanitizeHtml from "sanitize-html";

export function articleContents(cleanHtml) {
  const headings = [];
  let index = 0;
  const html = sanitizeHtml(cleanHtml, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "span", "a", "ul", "ol", "li", "blockquote", "img"],
    allowedAttributes: false,
    transformTags: Object.fromEntries(["h2", "h3"].map((tag) => [tag, (tagName, attribs) => ({
      tagName, attribs: {...attribs, id: `article-section-${++index}`},
    })])),
    exclusiveFilter: (frame) => {
      if (["h2", "h3"].includes(frame.tag) && frame.text.trim()) {
        headings.push({id: frame.attribs.id, level: frame.tag, text: frame.text.trim().replace(/\s+/g, " ")});
      }
      return false;
    },
  });
  return {html, headings};
}

export function articleToc(headings, articlePath, escape) {
  if (!headings.length) return "";
  return `<aside class="health-toc"><nav aria-labelledby="health-toc-title"><h2 id="health-toc-title">목차</h2><ol><li><a href="${escape(articlePath)}#article-top">처음으로</a></li>${headings.map(({id, level, text}) => `<li class="health-toc-${level}"><a href="${escape(articlePath)}#${id}">${escape(text)}</a></li>`).join("")}</ol></nav></aside>`;
}
