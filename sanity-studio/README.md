# Painel de Notícias e Publicações — Instituto AME (Sanity Studio)

Este é o **painel administrativo** onde o presidente publica, edita e remove
notícias e publicações (pesquisas/relatórios) — inclusive da aba **Observatório
do Santo Amaro**. O conteúdo publicado aparece automaticamente no site, sem
mexer no código.

> Esta pasta é usada **uma única vez** na configuração (por quem cuida da parte
> técnica). Depois de publicado, o presidente acessa apenas pela URL do painel.

---

## 1. Configuração inicial (feita uma vez)

Pré-requisito: ter o **Node.js** instalado (https://nodejs.org).

Abra o terminal **dentro desta pasta** (`sanity-studio`) e rode:

```bash
npm install
npx sanity login        # faça login com a conta do Sanity da ONG
```

Em seguida, **preencha o projectId** nos arquivos `sanity.config.ts` e
`sanity.cli.ts` (substitua `__PROJECT_ID__` pelo ID do projeto — o mesmo
informado em `assets/sanity-config.js` no site).

### Importar as notícias atuais (opcional, recomendado)

```bash
npx sanity dataset import seed-noticias.ndjson production
```

Isso carrega as 2 notícias que já existiam no site como ponto de partida.

### Publicar o painel (para o presidente acessar pelo navegador)

```bash
npx sanity deploy
```

Ao final, o painel fica disponível em uma URL como
`https://ame-noticias.sanity.studio`. **Guarde esse endereço** e envie ao
presidente.

### Testar localmente (opcional)

```bash
npm run dev
# abre em http://localhost:3333
```

> **Atenção:** sempre que o **schema** mudar (por exemplo, a adição do tipo
> "Publicação"), é preciso rodar `npx sanity deploy` de novo para o painel
> online refletir a mudança. Isso não afeta as notícias/publicações já
> cadastradas.

---

## 2. Como o presidente publica uma notícia

1. Acessar a URL do painel e fazer login.
2. Clicar em **"Notícia"** → **"Create new"**.
3. Preencher: **Título**, clicar em **Generate** (endereço/URL), escrever o
   **Resumo**, enviar a **Imagem de capa**, escolher **Categoria** e escrever o
   **Texto completo**.
4. Clicar em **Publish**. A notícia aparece no site em segundos.

- **Editar:** abrir a notícia, alterar, **Publish** de novo.
- **Despublicar / remover do site:** abrir a notícia → menu (•••) →
  **Unpublish** (tira do site sem apagar) ou **Delete** (apaga de vez).

### Publicar conteúdo na aba do Observatório

A página do Observatório (`nucleos/observatorio.html`) mostra dois tipos de
conteúdo automaticamente, sem precisar mexer no código:

- **Posts curtos / atualizações** → criar uma **Notícia** normal (como acima)
  e escolher a **Categoria "Observatório"**. Ela aparece na aba do Observatório
  *e* em "Notícias".
- **Pesquisas, relatórios e dados** → clicar em **"Publicação"** → **"Create
  new"**. Preencher **Título**, escolher o **Núcleo "Observatório do Santo
  Amaro"**, o **Tipo** de material (Pesquisa/Artigo/Relatório/Dado), o
  **Resumo** e, se houver, enviar o **arquivo PDF** (ou colar um **link
  externo**, por exemplo do DataLabe). Clicar em **Publish**.

O mesmo tipo **"Publicação"** serve para outros núcleos (Repositório, Cine
Santo Amaro etc.) — basta escolher o núcleo correspondente no campo
correspondente; cada página só mostra as publicações marcadas para ela.

---

## 3. Importante (segurança)

- O painel tem login próprio do Sanity. Convide o presidente como membro do
  projeto em https://www.sanity.io/manage (papel *Editor*).
- **Nenhuma senha ou token** fica no site nem nesta pasta.
- A pasta `node_modules` e arquivos `.env` não devem ir para o Git
  (já estão no `.gitignore`).
