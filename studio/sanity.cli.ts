import {defineCliConfig} from 'sanity/cli'
import settings from '../health-config.json'

export default defineCliConfig({
  api: {projectId: settings.projectId, dataset: settings.dataset},
  deployment: {appId: 'gczlsdicgufw100xd6ko5b8r'},
})
