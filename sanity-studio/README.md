# Painel de Notícias — Instituto AME (Sanity Studio)

Este é o **painel administrativo** onde o presidente publica, edita e remove
notícias. As notícias publicadas aparecem automaticamente no site, sem mexer
no código.

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

---

## 3. Importante (segurança)

- O painel tem login próprio do Sanity. Convide o presidente como membro do
  projeto em https://www.sanity.io/manage (papel *Editor*).
- **Nenhuma senha ou token** fica no site nem nesta pasta.
- A pasta `node_modules` e arquivos `.env` não devem ir para o Git
  (já estão no `.gitignore`).
