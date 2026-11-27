import {getCliClient} from 'sanity/cli'
import {prepareWebhook, safeHookStatus} from './publish-webhook.mjs'

try {
  const client = getCliClient({apiVersion: '2025-08-04', useProjectHostname: false})
  const result = await prepareWebhook(client)
  console.log(JSON.stringify({created: result.created, ...safeHookStatus(result.hook)}))
} catch (error) {
  console.error(`Webhook preparation failed (HTTP ${error.statusCode || 'unknown'}). Inspect Sanity Manage; credentials and API response details are intentionally not printed.`)
  process.exitCode = 1
}
