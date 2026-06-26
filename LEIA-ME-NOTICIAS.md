# Sistema de Notícias (CMS) — Instituto AME

As notícias do site agora vêm de um **painel** (Sanity CMS). O presidente
publica/edita/remove notícias por lá, sem mexer no código, e o site se atualiza
sozinho.

## O que mudou no site

| Arquivo | O que faz |
|---|---|
| `assets/sanity-config.js` | Configuração pública (projectId). **Editar 1x.** |
| `assets/sanity-news.js` | Busca as notícias e monta os cartões. Sem dependências. |
| `index.html` | A grade de notícias agora é preenchida pelo painel. |
| `noticias.html` | A listagem agora é preenchida pelo painel. |
| `noticia.html` | **Novo.** Página individual de cada notícia (`?slug=`). |
| `assets/script.js` | Ajuste mínimo: o carrossel do topo espera as notícias. |
| `assets/styles.css` | Acréscimo de estilos só da página de notícia. |
| `sanity-studio/` | O painel administrativo (instalado 1x — ver README). |

> Nada do site antigo foi removido. Sem CMS configurado, as páginas continuam
> mostrando as notícias atuais (fallback), então o site nunca quebra.

## Ativar (passo a passo — feito uma vez pela parte técnica)

1. Criar conta/projeto no Sanity (https://www.sanity.io) — plano gratuito.
2. Copiar o **Project ID** e colar em `assets/sanity-config.js`
   (campo `projectId`).
3. Liberar os domínios do site no **CORS** do Sanity
   (https://www.sanity.io/manage → projeto → API → CORS origins). Adicionar:
   - `http://localhost:3000` (e/ou a porta usada para testar local, ex.: `http://localhost:5500`)
   - GitHub Pages: `https://bereniceahb-ti.github.io`
   - Vercel: o domínio de produção (ex.: `https://ame-o-santo-amaro-site.vercel.app`)
     e, se houver, o domínio próprio (ex.: `https://institutoameosantoamaro.org`)
   > Marcar "Allow credentials" **não** é necessário (somente leitura pública).
   > Observação: cada deploy de *preview* do Vercel tem uma URL diferente; o CORS
   > vale para os domínios fixos (produção). As notícias funcionam normalmente na
   > produção.
4. Instalar e publicar o painel — siga `sanity-studio/README.md`.
5. (Opcional) Importar as 2 notícias atuais: `seed-noticias.ndjson`.

## Como testar

**Local:** abra o site com um servidor simples (ex.: extensão *Live Server* do
VS Code, ou `python -m http.server`) e veja `index.html`, `noticias.html` e
`noticia.html?slug=...`. Abra o Console do navegador (F12) — não deve haver erros.

**Depois do deploy:** publique uma notícia no painel e confira se aparece na
home e na listagem em alguns segundos. Teste com e sem imagem; em celular e
computador.

## Segurança

- O site usa **apenas leitura pública** (sem senhas/tokens no código).
- Publicar/editar exige login no painel do Sanity.
- `sanity-studio/node_modules` e `.env` **não** vão para o Git.
