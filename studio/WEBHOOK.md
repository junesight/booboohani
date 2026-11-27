# Published Article Webhook

## Purpose

Sanity sends a server-side POST to the existing GitHub `health-pages.yml` workflow when a published `healthPost` is created, updated or deleted/unpublished. Draft and release-version edits are excluded. The payload is only `{"ref":"main"}`; article content and images are never sent to GitHub in the webhook payload. The workflow fetches the current published dataset itself.

This bypasses GitHub's scheduled-event processing, not GitHub's runner queue. Dispatch acceptance is not a promise that deployment has finished. Keep the 15-minute cron as a fallback, not a timing guarantee. No paid backend or new public endpoint is introduced.

Prepared on 2026-11-27: project `1qhc62dz`, webhook `Aiz7AzvqVTo7zFWA`. Created disabled and without an Authorization header; owner activation is a separate required step. Preparation tests passed (5), and the GROQ filter was checked for published create/update/delete, draft create/delete, version create/delete and unrelated document changes. No clinic document was modified to test it.

## Prepare

```sh
cd studio
node --test scripts/publish-webhook.test.mjs
npm exec -- sanity exec scripts/prepare-publish-webhook.mjs --with-user-token
```

Use normal `sanity login` first if needed. The script uses the CLI session without printing it. It creates a **disabled** webhook with no GitHub credential. It never overwrites an existing matching webhook or its headers. Multiple matching hooks cause an error to prevent accidental duplicate deployments. Run tests before creating cloud configuration.

## Owner Activation

1. In GitHub Settings -> Developer settings -> Personal access tokens -> Fine-grained tokens, create a dedicated token with resource owner `junesight`, **Only select repositories -> booboohani**, and **Repository permissions -> Actions -> Read and write**. Metadata read is automatic. Do not grant Contents write, Workflows write, account-wide access, or use a classic token. Use a finite expiration (for example 90 days) and record a renewal date.
2. In Sanity Manage -> project `1qhc62dz` -> API -> Webhooks, open **Clinic published columns to GitHub Pages**.
3. Under HTTP headers, add `Authorization` with value `Bearer YOUR_NEW_FINE_GRAINED_TOKEN` (substitute locally in Sanity only). Keep the existing Accept, Content-Type and API-version headers. The webhook **Secret** field is NOT a substitute for this header: it signs requests, but GitHub's dispatch endpoint expects bearer authentication.
4. Enable the webhook and save. The GitHub credential lives only in Sanity's server-side webhook configuration. Never add it to source, `.env`, Studio browser code, screenshots, terminal commands or chat.

The token can request Actions runs for the selected repository, including other workflows. It does not grant code pushes; review that repository's workflows accordingly. Treat webhook administration rights as privileged. Rotate/revoke the token immediately if it is exposed.

## Verify Without Changing Medical Text

Ask the owner to republish an actual article through Studio. If there are no changes to publish, the owner can make a deliberate approved edit; do not automatically patch clinical text or add test posts to the production dataset. Confirm all three boundaries:

- Sanity webhook attempt: GitHub responds with 2xx (current API may return 200 with a run ID; older API versions can return 204).
- GitHub Actions: a new `workflow_dispatch` run completes successfully. Its published build must match the latest main commit and public article count.
- Website: home, relevant category and article URL show the expected text, thumbnail, HTML metadata and sitemap entry, on desktop and mobile and without JavaScript.

Draft-only edits should produce no request. Unpublishing should cause the next build to remove the article. Do not perform destructive publication tests on the owner's article without approval. Do not print raw webhook objects or attempt headers: they can contain Authorization credentials.

## Diagnose And Recover

- No attempt: confirm webhook enabled, `production` dataset, document type and published-vs-draft state.
- 401/403/404: check token expiration, selected repository and Actions-write permission. Do not broaden token scope just to bypass an error.
- 422: confirm workflow_dispatch exists on `main`, the workflow filename and the exact projection/ref.
- 2xx but no updated site: follow the actual Actions run through build/deploy, then inspect the public manifest. A failed build leaves the previous successful deployment live.
- Duplicate attempts: the existing workflow serializes production runs; its content digest skips unchanged deployments. Do not enable duplicate hooks.

Rollback: disable this webhook in Sanity Manage, then revoke its dedicated GitHub token if no longer needed. This does not alter clinic content, the current deployed site or the fallback cron. Reverting these source docs/scripts alone does **not** delete or disable the cloud webhook.

References: [Sanity webhooks](https://www.sanity.io/docs/content-lake/webhooks), [webhook API](https://www.sanity.io/docs/http-reference/webhooks), [GitHub workflow dispatch](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event), [fine-grained tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
