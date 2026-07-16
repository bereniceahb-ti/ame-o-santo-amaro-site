/* =====================================================================
   Integração das notícias com o Sanity (somente leitura).

   O que este arquivo faz:
   - Busca as notícias PUBLICADAS no painel do Sanity.
   - Preenche a seção de notícias da home e a página de notícias.
   - Monta a página individual de cada notícia (noticia.html?slug=...).

   Segurança/robustez:
   - Não usa nenhuma biblioteca externa (apenas fetch nativo).
   - Se o Sanity ainda não estiver configurado, indisponível ou sem
     notícias, o site NÃO quebra: mantém o conteúdo estático que já
     existe na página (fallback) ou mostra uma mensagem amigável.
   ===================================================================== */
(function () {
  'use strict';

  var cfg = window.SANITY_CONFIG || {};
  var CONFIGURADO = !!cfg.projectId && cfg.projectId.indexOf('__') !== 0;

  var MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
               'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  // ---- utilidades -----------------------------------------------------
  function escapaHTML(t) {
    return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function formataData(iso) {
    if (!iso) { return ''; }
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return ''; }
    return MESES[d.getMonth()] + '/' + d.getFullYear();
  }

  // Monta a URL de uma imagem do Sanity a partir da referência do asset.
  // Ex.: "image-abc123-1600x900-jpg" -> URL do CDN com redimensionamento.
  function urlImagem(ref, opts) {
    if (!ref) { return ''; }
    var m = /^image-([a-f0-9]+)-(\d+)x(\d+)-(\w+)$/.exec(ref);
    if (!m) { return ''; }
    var base = 'https://cdn.sanity.io/images/' + cfg.projectId + '/' +
      cfg.dataset + '/' + m[1] + '-' + m[2] + 'x' + m[3] + '.' + m[4];
    var q = [];
    opts = opts || {};
    if (opts.w) { q.push('w=' + opts.w); }
    if (opts.h) { q.push('h=' + opts.h); }
    if (opts.w || opts.h) { q.push('fit=crop'); }
    q.push('auto=format');
    return base + '?' + q.join('&');
  }

  // Executa uma consulta GROQ na API pública (CDN) do Sanity.
  function consulta(groq, params) {
    var url = 'https://' + cfg.projectId + '.apicdn.sanity.io/v' +
      cfg.apiVersion + '/data/query/' + cfg.dataset +
      '?query=' + encodeURIComponent(groq);
    if (params) {
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k)) {
          url += '&$' + k + '=' + encodeURIComponent(JSON.stringify(params[k]));
        }
      }
    }
    return fetch(url).then(function (r) {
      if (!r.ok) { throw new Error('Sanity HTTP ' + r.status); }
      return r.json();
    }).then(function (j) { return j.result; });
  }

  // ---- renderização de cartões ---------------------------------------
  function thumbHTML(n, alturaTexto) {
    var src = urlImagem(n.imgRef, { w: 800, h: 500 });
    if (src) {
      return '<div class="thumb"><img src="' + src + '" alt="' +
        escapaHTML(n.imgAlt || n.title) +
        '" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"></div>';
    }
    return '<div class="thumb"><div class="img-ph">AME' +
      '<span class="ph-mini">' + escapaHTML(alturaTexto || 'imagem em breve') +
      '</span></div></div>';
  }

  function cartaoHTML(n) {
    return '<article class="news-card">' +
      thumbHTML(n) +
      '<div class="body">' +
        metaHTML(n) +
        '<h3>' + escapaHTML(n.title) + '</h3>' +
        '<p>' + escapaHTML(n.summary || '') + '</p>' +
        '<a class="card-link" href="noticia.html?slug=' +
          encodeURIComponent(n.slug) + '">Ler mais &rarr;</a>' +
      '</div></article>';
  }

  function cartaoFullHTML(n) {
    return '<article class="news-card news-card--full">' +
      thumbHTML(n) +
      '<div class="body">' +
        metaHTML(n) +
        '<h3>' + escapaHTML(n.title) + '</h3>' +
        '<p>' + escapaHTML(n.summary || '') + '</p>' +
        '<a class="card-link" style="margin-top:auto;display:inline-block" href="noticia.html?slug=' +
          encodeURIComponent(n.slug) + '">Ler notícia completa &rarr;</a>' +
      '</div></article>';
  }

  function metaHTML(n) {
    var cat = n.category ? escapaHTML(n.category) : 'Notícia';
    var data = formataData(n.date);
    var dest = n.featured ? '<span>&#9733; Destaque</span>' : '';
    return '<div class="meta"><span>' + cat + '</span>' +
      (data ? '<span>' + data + '</span>' : '') + dest + '</div>';
  }

  // ---- Portable Text -> HTML (mínimo, suficiente para notícias) -------
  function spanComMarcas(child, markDefs) {
    var texto = escapaHTML(child.text || '');
    var marcas = child.marks || [];
    marcas.forEach(function (mk) {
      var def = (markDefs || []).filter(function (d) { return d._key === mk; })[0];
      if (def && def._type === 'link' && def.href) {
        var ext = /^https?:\/\//.test(def.href);
        texto = '<a href="' + escapaHTML(def.href) + '"' +
          (ext ? ' target="_blank" rel="noopener"' : '') + '>' + texto + '</a>';
      } else if (mk === 'strong') {
        texto = '<strong>' + texto + '</strong>';
      } else if (mk === 'em') {
        texto = '<em>' + texto + '</em>';
      } else if (mk === 'underline') {
        texto = '<u>' + texto + '</u>';
      }
    });
    return texto;
  }

  function blocoHTML(b) {
    if (b._type === 'image') {
      var src = urlImagem(b.asset && b.asset._ref, { w: 1200 });
      if (!src) { return ''; }
      return '<figure><img src="' + src + '" alt="' +
        escapaHTML(b.alt || '') + '" loading="lazy">' +
        (b.caption ? '<figcaption>' + escapaHTML(b.caption) + '</figcaption>' : '') +
        '</figure>';
    }
    if (b._type !== 'block') { return ''; }
    var inner = (b.children || []).map(function (c) {
      return spanComMarcas(c, b.markDefs);
    }).join('');
    switch (b.style) {
      case 'h2': return '<h2>' + inner + '</h2>';
      case 'h3': return '<h3>' + inner + '</h3>';
      case 'h4': return '<h4>' + inner + '</h4>';
      case 'blockquote': return '<blockquote>' + inner + '</blockquote>';
      default: return '<p>' + inner + '</p>';
    }
  }

  function portableTextHTML(blocos) {
    if (!Array.isArray(blocos)) { return ''; }
    var html = '';
    var i = 0;
    while (i < blocos.length) {
      var b = blocos[i];
      // agrupa itens de lista consecutivos
      if (b._type === 'block' && b.listItem) {
        var tag = b.listItem === 'number' ? 'ol' : 'ul';
        var itens = '';
        while (i < blocos.length && blocos[i].listItem) {
          var li = (blocos[i].children || []).map(function (c) {
            return spanComMarcas(c, blocos[i].markDefs);
          }).join('');
          itens += '<li>' + li + '</li>';
          i++;
        }
        html += '<' + tag + '>' + itens + '</' + tag + '>';
        continue;
      }
      html += blocoHTML(b);
      i++;
    }
    return html;
  }

  // ---- consultas ------------------------------------------------------
  var CAMPOS_LISTA =
    '{_id,title,"slug":slug.current,summary,category,featured,' +
    '"date":publishedAt,"imgRef":coverImage.asset._ref,"imgAlt":coverImage.alt}';

  function buscaLista(limite) {
    var fatia = limite ? ('[0...' + limite + ']') : '';
    var groq = '*[_type=="noticia" && defined(slug.current)]' +
      '|order(coalesce(publishedAt,_createdAt) desc)' + fatia + CAMPOS_LISTA;
    return consulta(groq);
  }

  function buscaPorSlug(slug) {
    var groq = '*[_type=="noticia" && slug.current==$slug][0]' +
      '{_id,title,summary,category,author,source,"date":publishedAt,' +
      '"imgRef":coverImage.asset._ref,"imgAlt":coverImage.alt,body}';
    return consulta(groq, { slug: slug });
  }

  // Notícias filtradas por categoria (ex.: posts/atualizações do Observatório
  // exibidos dentro da própria página do núcleo, além de aparecerem em "Notícias").
  function buscaListaPorCategoria(categoria, limite) {
    var fatia = limite ? ('[0...' + limite + ']') : '';
    var groq = '*[_type=="noticia" && category==$categoria && defined(slug.current)]' +
      '|order(coalesce(publishedAt,_createdAt) desc)' + fatia + CAMPOS_LISTA;
    return consulta(groq, { categoria: categoria });
  }

  // ---- Publicações (pesquisas/artigos/relatórios) ---------------------
  var CAMPOS_PUBLICACAO =
    '{_id,title,tipo,resumo,autores,destaque,"date":publishedAt,' +
    '"capaRef":capa.asset._ref,"capaAlt":capa.alt,' +
    '"arquivoUrl":arquivo.asset->url,linkExterno}';

  function buscaPublicacoes(nucleo, limite) {
    var fatia = limite ? ('[0...' + limite + ']') : '';
    var groq = '*[_type=="publicacao" && nucleo==$nucleo]' +
      '|order(coalesce(publishedAt,_createdAt) desc)' + fatia + CAMPOS_PUBLICACAO;
    return consulta(groq, { nucleo: nucleo });
  }

  function cartaoPublicacaoHTML(p) {
    var link = p.arquivoUrl || p.linkExterno;
    var rotulo = p.arquivoUrl ? 'Baixar PDF' : 'Acessar';
    var dest = p.destaque ? '<span>&#9733; Destaque</span>' : '';
    return '<article class="news-card">' +
      thumbHTML({ imgRef: p.capaRef, imgAlt: p.capaAlt || p.title, title: p.title }) +
      '<div class="body">' +
        '<div class="meta"><span>' + escapaHTML(p.tipo || 'Publicação') + '</span>' +
          (formataData(p.date) ? '<span>' + formataData(p.date) + '</span>' : '') + dest +
        '</div>' +
        '<h3>' + escapaHTML(p.title) + '</h3>' +
        '<p>' + escapaHTML(p.resumo || '') + '</p>' +
        (p.autores ? '<p class="noticia-autor">' + escapaHTML(p.autores) + '</p>' : '') +
        (link ? '<a class="card-link" href="' + escapaHTML(link) +
          '" target="_blank" rel="noopener">' + rotulo + ' &rarr;</a>' : '') +
      '</div></article>';
  }

  // ---- Cronograma de atividades (imagem mensal por núcleo) ------------
  var CAMPOS_CRONOGRAMA =
    '{_id,title,"mes":mesReferencia,' +
    '"imgRef":imagem.asset._ref,"imgAlt":imagem.alt,' +
    '"arquivoUrl":arquivo.asset->url}';

  function formataMesAno(iso) {
    if (!iso) { return ''; }
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) { return ''; }
    var MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return MESES_LONGOS[d.getMonth()] + ' de ' + d.getFullYear();
  }

  // Busca o cronograma mais recente (pelo mês de referência) de um núcleo.
  function buscaCronogramaAtual(nucleo) {
    var groq = '*[_type=="cronograma" && nucleo==$nucleo]' +
      '|order(mesReferencia desc)[0]' + CAMPOS_CRONOGRAMA;
    return consulta(groq, { nucleo: nucleo });
  }

  function cronogramaHTML(c) {
    var src = urlImagem(c.imgRef, { w: 900 });
    if (!src) { return ''; }
    var titulo = c.title || ('Cronograma — ' + formataMesAno(c.mes));
    return '<figure class="cronograma-figure">' +
      '<img src="' + src + '" alt="' + escapaHTML(c.imgAlt || titulo) + '" loading="lazy">' +
      '<figcaption>' + escapaHTML(titulo) + '</figcaption>' +
      (c.arquivoUrl ? '<p style="margin-top:14px"><a class="card-link" href="' +
        escapaHTML(c.arquivoUrl) + '" target="_blank" rel="noopener">Baixar PDF &rarr;</a></p>' : '') +
      '</figure>';
  }

  // Preenche todo elemento com [data-cronograma-nucleo="Elas"] com o
  // cronograma mais recente cadastrado no Sanity para aquele núcleo.
  // Se o Sanity ainda não tiver nenhum cronograma cadastrado (ou estiver
  // indisponível), mantém a imagem estática que já está na página.
  function preencheCronograma() {
    var alvos = document.querySelectorAll('[data-cronograma-nucleo]');
    for (var i = 0; i < alvos.length; i++) {
      (function (alvo) {
        var nucleo = alvo.getAttribute('data-cronograma-nucleo');
        if (!CONFIGURADO || !nucleo) { return; }
        buscaCronogramaAtual(nucleo).then(function (c) {
          if (c && c.imgRef) {
            alvo.innerHTML = cronogramaHTML(c);
          }
          // se não houver cronograma cadastrado, mantém o conteúdo estático
        }).catch(function () { /* mantém o conteúdo estático da página */ });
      })(alvos[i]);
    }
  }

  // ---- preenchimento das seções --------------------------------------
  function preencheHome() {
    var alvo = document.querySelector('[data-noticias-home]');
    if (!alvo) { return Promise.resolve(); }
    if (!CONFIGURADO) { return Promise.resolve(); } // mantém estático
    return buscaLista(3).then(function (lista) {
      if (lista && lista.length) {
        alvo.innerHTML = lista.map(cartaoHTML).join('');
      }
      // se vazio, mantém os cartões estáticos da página (home nunca fica vazia)
    }).catch(function () { /* mantém estático em caso de erro */ });
  }

  function preencheLista() {
    var alvo = document.querySelector('[data-noticias-lista]');
    if (!alvo || !CONFIGURADO) { return; }
    buscaLista().then(function (lista) {
      if (lista && lista.length) {
        alvo.innerHTML = lista.map(cartaoFullHTML).join('');
      } else {
        alvo.innerHTML =
          '<p class="noticias-vazio">Ainda não há notícias publicadas. ' +
          'Volte em breve para acompanhar as novidades do Instituto.</p>';
      }
    }).catch(function () { /* mantém o conteúdo estático da página */ });
  }

  function preencheDetalhe() {
    var alvo = document.querySelector('[data-noticia-detalhe]');
    if (!alvo) { return; }
    var slug = new URLSearchParams(window.location.search).get('slug');
    if (!CONFIGURADO || !slug) {
      alvo.innerHTML = msgNaoEncontrada();
      return;
    }
    buscaPorSlug(slug).then(function (n) {
      if (!n) { alvo.innerHTML = msgNaoEncontrada(); return; }

      document.title = n.title + ' — Notícias — Instituto de Direitos Humanos AME';
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && n.summary) { metaDesc.setAttribute('content', n.summary); }

      var capa = urlImagem(n.imgRef, { w: 1400 });
      var assinatura = [n.author, n.source].filter(Boolean).map(escapaHTML).join(' · ');

      alvo.innerHTML =
        '<div class="container noticia-artigo">' +
          '<div class="breadcrumb"><a href="index.html">Início</a> › ' +
            '<a href="noticias.html">Notícias</a> › ' + escapaHTML(n.title) + '</div>' +
          '<div class="meta">' +
            (n.category ? '<span>' + escapaHTML(n.category) + '</span>' : '') +
            (formataData(n.date) ? '<span>' + formataData(n.date) + '</span>' : '') +
          '</div>' +
          '<h1>' + escapaHTML(n.title) + '</h1>' +
          (n.summary ? '<p class="noticia-resumo">' + escapaHTML(n.summary) + '</p>' : '') +
          (assinatura ? '<p class="noticia-autor">' + assinatura + '</p>' : '') +
          (capa ? '<img class="noticia-capa" src="' + capa + '" alt="' +
            escapaHTML(n.imgAlt || n.title) + '">' : '') +
          '<div class="noticia-corpo">' + portableTextHTML(n.body) + '</div>' +
          '<p class="noticia-voltar"><a class="card-link" href="noticias.html">' +
            '&larr; Voltar para todas as notícias</a></p>' +
        '</div>';
    }).catch(function () { alvo.innerHTML = msgNaoEncontrada(); });
  }

  function msgNaoEncontrada() {
    return '<div class="container noticia-artigo">' +
      '<h1>Notícia não encontrada</h1>' +
      '<p>A notícia que você procura não está disponível.</p>' +
      '<p class="noticia-voltar"><a class="card-link" href="noticias.html">' +
      '&larr; Voltar para todas as notícias</a></p></div>';
  }

  // Preenche todo elemento com [data-noticias-categoria="Observatório"] (ou
  // outra categoria) com os posts curtos daquela categoria. Usado em páginas
  // de núcleo (ex.: nucleos/observatorio.html) para mostrar atualizações.
  function preencheCategoria() {
    var alvos = document.querySelectorAll('[data-noticias-categoria]');
    for (var i = 0; i < alvos.length; i++) {
      (function (alvo) {
        var categoria = alvo.getAttribute('data-noticias-categoria');
        if (!CONFIGURADO || !categoria) { return; }
        var limiteAttr = alvo.getAttribute('data-limite');
        buscaListaPorCategoria(categoria, limiteAttr ? Number(limiteAttr) : null)
          .then(function (lista) {
            if (lista && lista.length) {
              alvo.innerHTML = lista.map(cartaoHTML).join('');
            } else {
              alvo.innerHTML = '<p class="noticias-vazio">Ainda não há publicações ' +
                'nesta seção. Volte em breve.</p>';
            }
          }).catch(function () { /* mantém o conteúdo estático da página */ });
      })(alvos[i]);
    }
  }

  // Preenche todo elemento com [data-publicacoes-nucleo="Observatório"] com
  // as publicações (pesquisas/artigos/relatórios) cadastradas para o núcleo.
  function preenchePublicacoes() {
    var alvos = document.querySelectorAll('[data-publicacoes-nucleo]');
    for (var i = 0; i < alvos.length; i++) {
      (function (alvo) {
        var nucleo = alvo.getAttribute('data-publicacoes-nucleo');
        if (!CONFIGURADO || !nucleo) { return; }
        var limiteAttr = alvo.getAttribute('data-limite');
        buscaPublicacoes(nucleo, limiteAttr ? Number(limiteAttr) : null)
          .then(function (lista) {
            if (lista && lista.length) {
              alvo.innerHTML = lista.map(cartaoPublicacaoHTML).join('');
            } else {
              alvo.innerHTML = '<p class="noticias-vazio">Ainda não há publicações ' +
                'cadastradas. Volte em breve.</p>';
            }
          }).catch(function () { /* mantém o conteúdo estático da página */ });
      })(alvos[i]);
    }
  }

  // ---- inicialização --------------------------------------------------
  // A home expõe uma promessa para o carrossel do topo (script.js) aguardar
  // os cartões dinâmicos antes de montar os slides.
  window.AME_noticiasReady = preencheHome();
  preencheLista();
  preencheDetalhe();
  preencheCategoria();
  preenchePublicacoes();
  preencheCronograma();
})();
