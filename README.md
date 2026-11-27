# Booboo Clinic Website

Production: https://booboo.co.kr/

The `main` branch is the source of truth. Read `AGENTS.md` before making changes.

## Health articles

The clinic uses Sanity for authenticated authoring and image uploads. Public project settings and seven categories are in `health-config.json`; these are not secrets.

- Online authoring: https://booboohani-health.sanity.studio/
- Public list: https://booboo.co.kr/health.html
- Authors/publishers are represented as the clinic organization, not individual physicians.
- Only published `healthPost` documents are fetched. Drafts, release versions, local sample posts and local uploads are not deployed.
- Unpublish a document in Sanity to remove it from the next complete site build. Generated detail files are not retained after unpublishing.

```sh
npm ci --prefix tools/health-preview
node --test tools/health-preview/*.test.mjs
node tools/health-preview/build-site.mjs
```

The production artifact is `dist/`. It includes normal pages/assets, static category/pagination/detail HTML, the article search data, and a generated sitemap. It excludes the local editor, Node server, source configuration, tests, Studio source, dependency folders and local data. Original JPG assets are retained.

For local Studio: `npm ci --prefix studio`, then `npm run dev --prefix studio`. For Studio verification: `npm run build --prefix studio`. To deploy a Studio change, an authorized project member must sign in through `npm exec --prefix studio -- sanity login`, then deploy from the `studio` directory. Never commit an authentication token.

## Automatic publication

`.github/workflows/health-pages.yml` builds/deploys on `main` changes and checks published Sanity content at minutes 7, 22, 37 and 52 of each hour. If the production content digest is unchanged, deployment is skipped. You can run it manually through GitHub Actions -> Clinic Website and Health Columns -> Run workflow.

This is periodic synchronization, not an immediate webhook. GitHub may delay/drop scheduled runs under load. In a public repository GitHub disables schedules after 60 days without repository activity; Sanity edits alone must not be assumed to count as GitHub activity. Re-enable the workflow when necessary. For guaranteed event-driven publishing, add a separately reviewed authenticated webhook integration later. No GitHub credentials are stored in Sanity for this initial setup.

The workflow uses the job's short-lived `GITHUB_TOKEN`/OIDC with `contents: read`, and the deploy job alone gets `pages: write` and `id-token: write`. No personal access token or paid service is required by this setup. Public standard GitHub Actions runners and Sanity quotas are subject to their respective service terms and limits.

CI tests PRs and uploads a `clinic-website-preview` artifact. The Studio validation job builds but never publishes articles or uploads sample content. The production deployment job runs only from `main`, not from PRs.

## Deployment And Recovery

The prior site used legacy GitHub Pages from `main:/`, with the custom domain `booboo.co.kr`. The last pre-columns stable commit is `1d225d522685956bd12020da309848a25a140a66`.

Before activating this workflow, verify the PR artifact and set Settings -> Pages -> Build and deployment -> Source to GitHub Actions. Keep the existing custom domain and HTTPS settings unchanged. Merge the verified PR; confirm the production manifest's `sourceCommit` equals the merged `main` commit and inspect the actual pages, images, map and reservation links.

If a build/data fetch fails, the current successful Pages deployment remains live. Do not replace a failed query with empty data. A valid empty published dataset is different and produces an empty article section.

Rollback:
1. Disable this scheduled workflow to prevent further automated publication.
2. Revert the feature merge with a new PR (`git revert -m 1 MERGE_SHA`), and merge the reviewed rollback.
3. Restore GitHub Pages to legacy source `main:/`. Keep the custom domain and HTTPS settings.
4. Trigger a legacy Pages build and verify the previous site. Do not reset/force-push `main`.

Article publication changes are independent of a code rollback. Do not delete Sanity documents/projects to roll back website code.

## Local Prototype

`tools/health-preview/README.md` documents the earlier local-only editor and optional local server. It must not be exposed as a production server. Sanity Studio is the production writing interface. `studio/README.md` records schema, sign-in and dependency caveats.
