import {test} from 'node:test'
import assert from 'node:assert/strict'
import {webhookDefinition, prepareWebhook, safeHookStatus, dispatchUrl, hookName} from './publish-webhook.mjs'

test('new webhook is disabled, published-only and sends only the main ref', () => {
  const hook = webhookDefinition()
  assert.equal(hook.type, 'document')
  assert.equal(hook.url, dispatchUrl)
  assert.equal(hook.httpMethod, 'POST')
  assert.equal(hook.dataset, 'production')
  assert.equal(hook.isDisabledByUser, true)
  assert.equal(hook.includeDrafts, false)
  assert.equal(hook.includeAllVersions, false)
  assert.deepEqual(hook.rule.on, ['create', 'update', 'delete'])
  assert.match(hook.rule.filter, /before\(\)/)
  assert.match(hook.rule.filter, /after\(\)/)
  assert.match(hook.rule.filter, /healthPost/)
  assert.match(hook.rule.filter, /drafts\.\*\*/)
  assert.match(hook.rule.filter, /versions\.\*\*/)
  assert.deepEqual(JSON.parse(hook.rule.projection), {ref: 'main'})
  assert.equal('Authorization' in hook.headers, false)
  assert.equal('secret' in hook, false)
})

test('preparation creates a disabled hook only when missing', async () => {
  const requests = []
  const result = await prepareWebhook({request: async (options) => {
    requests.push(options)
    return options.method === 'POST' ? {id: 'test-hook', ...options.body} : []
  }})
  assert.equal(result.created, true)
  assert.equal(requests.length, 2)
  assert.equal(requests[1].body.isDisabledByUser, true)
})

test('preparation never overwrites an existing hook or its secret headers', async () => {
  const existing = {id: 'existing', name: hookName, url: dispatchUrl, headers: {Authorization: 'test-only'}}
  const requests = []
  const result = await prepareWebhook({request: async (options) => {requests.push(options); return [existing]}})
  assert.equal(result.created, false)
  assert.equal(result.hook, existing)
  assert.equal(requests.length, 1)
  assert.equal(existing.headers.Authorization, 'test-only')
})

test('duplicate hooks fail closed', async () => {
  await assert.rejects(prepareWebhook({request: async () => [{name: hookName}, {url: dispatchUrl}]}), /Multiple matching/)
})

test('status output contains no headers or secrets', () => {
  const status = safeHookStatus({id: 'test', name: hookName, isDisabledByUser: true, headers: {authorization: 'test-only'}, secret: 'test-only'})
  assert.equal(status.authorizationConfigured, true)
  assert.equal(status.disabled, true)
  assert.equal(JSON.stringify(status).includes('test-only'), false)
  assert.equal('headers' in status, false)
  assert.equal('secret' in status, false)
})
