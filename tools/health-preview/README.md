# Local Health Columns Preview

This local-only feature runs on a separate Node server. It does not publish to GitHub Pages or contact the production database.

```sh
cd tools/health-preview
npm ci
node server.mjs
```

- Home: http://127.0.0.1:8767/#health
- Articles: http://127.0.0.1:8767/health.html
- Editor: http://127.0.0.1:8767/health-editor.html
- Change the port with `PORT=8768 node server.mjs` if necessary.
- Posts and converted uploads persist in `.local-health/` at the repository root. This directory is ignored by Git. Restarting the server preserves edits.
- Initial sample posts are explicitly labelled as examples. They are not clinician-reviewed medical articles.
- The server binds only to loopback and validates Host, Origin, request token, input, and rich text. It has no production authentication and must not be exposed to a network or deployed as a production CMS.
- Quill 2.0.3 has a low-severity HTML export advisory (GHSA-v3m3-f69x-jf25) with no upstream patched release. All exported rich text is sanitized on the server before storage or preview/rendering, never rendered as raw exported HTML. Keep this mitigation and review the editor dependency again before production.
- Public article content, categories and cards are rendered to HTML on the server; they remain readable without JavaScript. Draft bodies are excluded from public routes. Preview pages use `noindex` during local review.
- Article publisher/author is the organization, not an individual physician. No author input is requested.
- Image uploads accept JPEG/PNG/WebP up to 12 MB, decode at most 40 million pixels, strip metadata, and produce WebP plus 600x600 thumbnails. Existing source photos are never overwritten.
- Draft saving and publication are explicit actions. Only published posts appear on the home page and listing. Saving changes to an already-published post keeps it published; the separate unpublish action removes it from public pages.
- Before production: choose authenticated CMS/storage and static generation or a supported server host, export approved content, remove sample posts, confirm canonical/robots/sitemap and asset URLs, and obtain medical content approval. The current GitHub Pages deployment cannot run this Node server.

## Sanity-connected local preview

The selected CMS is now configured in `../../studio/`. See its README for sign-in and editing. `../../health-config.json` contains public project/dataset identifiers and the shared category list; no secret token is used.

Run `HEALTH_CONTENT_SOURCE=sanity PORT=8768 node server.mjs` from this directory to read real published articles from Sanity. This mode never falls back to local examples, excludes drafts/versions, blocks local mutation APIs, and sends management links to Sanity Studio at http://localhost:3333. The example preview on port 8767 remains independent. No cloud content or production website is modified by starting either server.

## Verification

Run `node --test tools/health-preview/content.test.mjs tools/health-preview/server.test.mjs` at the repository root after installing dependencies. Browser QA covers desktop/mobile home, category filters, draft/publish/edit/unpublish/delete, rich text, image uploads, and restart persistence. No lint or build scripts are introduced into the existing static site.

For browser QA, install Playwright in your tooling environment and run `node tools/health-preview/browser-check.mjs` while the local preview is running. Optional `PLAYWRIGHT_PATH` points to a Playwright module entry, and `CHROME_PATH` selects an existing Chrome executable. This test creates and removes its own test article. Run on the initial sample data; responsive assertions expect the four sample posts.

Verified locally on 2026-11-26:
- 16 unit/integration tests passed, including restart persistence and cross-origin write rejection.
- Browser draft -> preview -> publish -> reload -> unpublish -> delete passed with bold, underline, font size/color, cover image, body image alt text and width retained.
- Public listing/detail work with JavaScript disabled.
- Main section, listing and editor checked at 320, 390, 768, 1024 and 1440 pixels without document horizontal overflow.
- Dependency audit after updating Sharp: no high/critical findings; one low Quill advisory remains with server-side sanitization mitigation described above.
- No commits, pushes, production database writes or deployment performed.
