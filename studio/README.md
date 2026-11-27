# Clinic Sanity Studio (Local Only)

Project: `1qhc62dz`; dataset: `production` (public). These identifiers are not credentials. Shared settings and categories are in `../health-config.json`.

```sh
cd studio
npm ci
npm run dev
```

Open http://localhost:3333 and sign in through Sanity using the GitHub account that owns the project. No API token needs to be copied into this repository or sent in chat. Studio uses Sanity authentication and project membership for editing; the public frontend is read-only and has no write token.

The schema includes title, seven categories, square-thumbnail cover image with crop/hotspot, image description, publication date and rich text. Author/publisher is fixed to the clinic in frontend rendering; there is no physician author input. Rich text supports headings, lists, alignment, bold/italic/underline, preset text colors/sizes/highlights, links and inline images with width/alt/caption.

Local Studio connects to the real cloud dataset. Creating, editing, uploading or publishing in Studio writes to that project even though the Studio itself is running locally. No sample articles or images are automatically uploaded by setup or tests. Unpublished drafts are not included in the frontend data query (`perspective=published`).

The local frontend connected to Sanity runs separately:

```sh
cd tools/health-preview
HEALTH_CONTENT_SOURCE=sanity PORT=8768 node server.mjs
```

Homepage: http://127.0.0.1:8768/#health

Listing: http://127.0.0.1:8768/health.html

The original local-only example editor on port 8767 remains independent. It does not send its posts or images to Sanity. In Sanity mode, local mutation API routes are blocked and edit links point to Studio. Publication is visible after refreshing the connected local homepage; production `booboo.co.kr` is not connected yet.

If Studio shows a CORS error, the project owner should inspect Sanity Manage -> API -> CORS Origins. The documented default development origin is `http://localhost:3333` with credentials allowed. Do not enable wildcard credential origins. Adding origins expands authenticated access, so obtain the owner's approval before changing CORS.

Production remains a separate step: deploy Studio, approve its origin, configure a secure build trigger, generate static HTML from published content, and verify canonical/robots/sitemap plus image URLs. Do not expose the local Node preview server as a production CMS. Local preview pages retain `noindex`.

Build verification: `npm run build` builds locally and does not deploy Studio or publish schema/content to Sanity.

Verified on 2026-11-27: local Studio build and schema extraction passed, login screen rendered without JavaScript errors, public dataset query succeeded with zero published health posts, and connected lists rendered at 390/1440px. All 24 local content/adapter/API tests passed. Cloud login, authoring and publication still require the owner's sign-in and were not exercised automatically.

Dependency audit: scoped same-major overrides address high-severity `js-yaml` and `smol-toml` findings in the upstream CLI. Fourteen moderate CLI dependency findings remain (including the minimatch/oclif chain). Review upstream fixes before production deployment; no forced Sanity downgrade or incompatible dependency override was applied. The older local example editor has a separate Quill export advisory and is not used for authoring in Sanity mode.
