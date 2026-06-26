import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'u1olu9ga',
    dataset: 'production',
  },
  // Nome do painel publicado: https://<studioHost>.sanity.studio
  studioHost: 'ame-noticias',
  deployment: {
    appId: 'o2jkjhn2kuvmfhu4jfvfi972',
    autoUpdates: true,
  },
})
