import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// Painel (Studio) de notícias do Instituto AME.
// O projectId é preenchido na configuração inicial (mesmo valor do site).
export default defineConfig({
  name: 'default',
  title: 'Notícias — Instituto AME',

  projectId: 'u1olu9ga',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
