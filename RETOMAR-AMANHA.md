# Retomar amanhã — CMS de notícias (Sanity)

## Objetivo
Permitir que o presidente publique/edite/remova notícias por um painel, sem
mexer no código. Solução escolhida: **Sanity CMS** (o site estático busca as
notícias publicadas; nada de rebuild a cada publicação).

## Dados do projeto
- **Project ID do Sanity:** `u1olu9ga`  ·  **dataset:** `production`
- Repositório: github.com/bereniceahb-ti/ame-o-santo-amaro-site
- Deploys: **GitHub Pages** e **Vercel**
- Pasta de trabalho: `D:\BERENICE\Documents\Claude\Projects\Site AME\site-novo`

## O que JÁ está pronto (código implementado e com o Project ID preenchido)
- `assets/sanity-config.js` — projectId já configurado (`u1olu9ga`).
- `assets/sanity-news.js` — busca e monta as notícias (sem dependências/segredos).
- `index.html` e `noticias.html` — passam a exibir o que vier do painel; se vazio
  ou offline, mantêm as notícias atuais (não quebra).
- `noticia.html` — página individual nova (`noticia.html?slug=...`).
- `assets/script.js` — ajuste mínimo (carrossel espera as notícias).
- `assets/styles.css` — só acréscimos da página de notícia.
- `sanity-studio/` — o painel (schema `noticia` com todos os campos) +
  `seed-noticias.ndjson` (as 2 notícias atuais para importar).

## Onde paramos
- Node.js instalado (v24.18.0).
- Trocamos o terminal do VS Code para **Command Prompt (cmd)** porque o PowerShell
  bloqueava os scripts do npm.
- Rodando `npm install` dentro de `sanity-studio` (estava baixando — normal levar
  alguns minutos).

## Próximos passos (continuar daqui, no terminal cmd dentro de `sanity-studio`)
1. Esperar o `npm install` terminar.
2. `npx sanity login`  (entrar na conta do projeto u1olu9ga)
3. `npx sanity dataset import seed-noticias.ndjson production`  (importa as 2 notícias)
4. `npx sanity deploy`  (publica o painel; ANOTAR a URL final, tipo `https://ame-noticias.sanity.studio`)
5. **CORS** em https://www.sanity.io/manage → projeto `u1olu9ga` → API → CORS origins
   → Add origin (SEM "Allow credentials"):
   - `http://localhost:5500` (ou a porta usada para testar local)
   - `https://bereniceahb-ti.github.io`  (GitHub Pages)
   - domínio de produção da Vercel (ex.: `https://ame-o-santo-amaro-site.vercel.app`)
     + domínio próprio, se houver
6. Convidar o presidente como **Editor** em sanity.io/manage.
7. **Commitar/publicar** os arquivos novos para GitHub Pages e Vercel atualizarem
   (`node_modules` já é ignorado pelo `.gitignore`).

## Como testar
- Local: rodar um servidor na pasta `site-novo` (ex.: Live Server do VS Code),
  abrir `index.html` e `noticias.html`; abrir o Console (F12) — sem erros.
- Pós-deploy: publicar uma notícia no painel e ver aparecer na home/listagem.

## Lembretes
- Nenhuma senha/token fica no código (leitura é pública).
- Guia de uso do presidente: `sanity-studio/README.md`.
- Visão geral: `LEIA-ME-NOTICIAS.md`.
