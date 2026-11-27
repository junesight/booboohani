import settings from '../../health-config.json' with {type: 'json'}

export const hookName = 'Clinic published columns to GitHub Pages'
export const dispatchUrl = 'https://api.github.com/repos/junesight/booboohani/actions/workflows/health-pages.yml/dispatches'

export function webhookDefinition() {
  const id = 'coalesce(after()._id, before()._id)'
  return {
    type: 'document',
    name: hookName,
    description: 'Published healthPost changes request the existing main Pages workflow. Add a repository-scoped Actions-write token in Authorization before enabling.',
    dataset: settings.dataset,
    url: dispatchUrl,
    apiVersion: 'v2025-08-04',
    httpMethod: 'POST',
    includeDrafts: false,
    includeAllVersions: false,
    isDisabledByUser: true,
    rule: {
      on: ['create', 'update', 'delete'],
      filter: `coalesce(after()._type, before()._type) == "healthPost" && !(${id} in path("drafts.**")) && !(${id} in path("versions.**"))`,
      projection: '{"ref": "main"}',
    },
    headers: {
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2026-03-10',
    },
  }
}

export async function prepareWebhook(client) {
  const url = `/hooks/projects/${settings.projectId}`
  const hooks = await client.request({url})
  const existing = hooks.filter((hook) => hook.name === hookName || hook.url === dispatchUrl)
  if (existing.length > 1) throw new Error('Multiple matching webhooks exist; review them in Sanity Manage.')
  if (existing.length) return {created: false, hook: existing[0]}
  return {created: true, hook: await client.request({url, method: 'POST', body: webhookDefinition()})}
}

export function safeHookStatus(hook) {
  // Never serialize request headers, credentials, response bodies or payloads.
  return {
    id: hook.id,
    name: hook.name,
    dataset: hook.dataset,
    disabled: Boolean(hook.isDisabled || hook.isDisabledByUser),
    authorizationConfigured: Object.keys(hook.headers || {}).some((key) => key.toLowerCase() === 'authorization'),
  }
}
