import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {koKRLocale} from '@sanity/locale-ko-kr'
import settings from '../health-config.json'
import {healthPost} from './schemaTypes/healthPost'

export default defineConfig({
  name: 'booboo-health',
  title: '부부한의원 · 건강 정보 및 칼럼',
  projectId: settings.projectId,
  dataset: settings.dataset,
  plugins: [structureTool(), koKRLocale()],
  schema: {types: [healthPost]},
})
