// Menu mobile
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        // No mobile, fecha o menu ao clicar em link que não seja o pai do dropdown
        if (!a.parentElement.classList.contains('dropdown')) {
          links.classList.remove('open');
        }
      });
    });
  }

  // Copiar chave PIX
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var txt = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(txt).then(function () {
        var orig = btn.textContent;
        btn.textContent = 'Copiado!';
        setTimeout(function () { btn.textContent = orig; }, 1800);
      });
    });
  });

  // Formulários de demonstração (protótipo, sem back-end)
  document.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.querySelector('.form-msg');
      if (msg) { msg.style.display = 'block'; }
      f.reset();
    });
  });

  // Contagem crescente (count-up) nos números de impacto
  var nums = document.querySelectorAll('.num[data-count]');
  if (nums.length) {
    var reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function formata(el, valor) {
      var prefixo = el.getAttribute('data-prefix') || '';
      var txt = el.getAttribute('data-sep')
        ? Math.round(valor).toLocaleString('pt-BR')
        : String(Math.round(valor));
      el.textContent = prefixo + txt;
    }

    function anima(el) {
      var alvo = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(alvo)) { return; }
      var dur = 1400, ini = null;
      function passo(t) {
        if (ini === null) { ini = t; }
        var p = Math.min((t - ini) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // ease-out cúbico
        formata(el, alvo * eased);
        if (p < 1) { requestAnimationFrame(passo); }
        else { formata(el, alvo); }
      }
      requestAnimationFrame(passo);
    }

    // Sem animação: mantém o valor final já presente no HTML
    if (!reduzido && 'IntersectionObserver' in window) {
      nums.forEach(function (el) { formata(el, 0); });
      var obs = new IntersectionObserver(function (entradas, observer) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            anima(entrada.target);
            observer.unobserve(entrada.target);
          }
        });
      }, { threshold: 0.4 });
      nums.forEach(function (el) { obs.observe(el); });
    }
  }

  // Carrossel do hero (autoplay + notícias recentes)
  // Slide 1 = institucional (fixo). Slides seguintes são montados a partir da
  // seção "Notícias e novidades", garantindo uma única fonte de conteúdo.
  // Aguarda as notícias do CMS (quando houver) antes de montar os slides,
  // para refletir o conteúdo publicado. Sem CMS, executa imediatamente.
  (window.AME_noticiasReady || Promise.resolve()).then(function () {
  var hero = document.querySelector('.highlight');
  if (hero) {
    var bg = hero.querySelector('.hl-bg');
    var pane = hero.querySelector('.container');
    var dotsWrap = hero.querySelector('.hl-dots');
    var hreduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (hreduz) { hero.classList.add('no-anim'); }

    // 1) Preserva o conteúdo institucional do slide 1, intacto.
    var introHTML = pane ? pane.innerHTML : '';

    // 2) Coleta as notícias recentes da seção "Notícias e novidades" (máx. 3).
    var cards = [].slice.call(document.querySelectorAll('.news-card')).slice(0, 3);
    var noticias = cards.map(function (c) {
      var img = c.querySelector('.thumb img');
      var cat = c.querySelector('.meta span');
      var titulo = c.querySelector('h3');
      var link = c.querySelector('.card-link') || c.querySelector('a');
      return {
        img: img ? img.getAttribute('src') : '',
        cat: cat ? cat.textContent.trim() : 'Notícia',
        titulo: titulo ? titulo.textContent.trim() : '',
        href: link ? link.getAttribute('href') : 'noticias.html'
      };
    });

    // 3) Cria os slides de fundo das notícias (o slide 1 já existe no HTML).
    //    Slides com foto usam "cover" (mesmo enquadramento da 1ª foto);
    //    sem foto, vira um placeholder full-bleed do mesmo tamanho.
    noticias.forEach(function (n) {
      var s = document.createElement('div');
      s.className = 'hl-slide';
      s.style.backgroundColor = '#7C1C18';
      if (n.img) {
        s.style.backgroundImage = "url('" + n.img + "')";
        s.style.backgroundSize = 'cover';
        s.style.backgroundPosition = 'center';
      } else {
        s.classList.add('hl-slide--ph');
        var lab = document.createElement('span');
        lab.className = 'hl-ph';
        lab.textContent = 'Imagem em breve';
        s.appendChild(lab);
      }
      bg.appendChild(s);
    });

    var hslides = [].slice.call(bg.querySelectorAll('.hl-slide'));
    var total = hslides.length;

    // 4) Monta os indicadores (dots) conforme o número de slides.
    var hdots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      for (var i = 0; i < total; i++) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'hl-dot' + (i === 0 ? ' is-active' : '');
        d.setAttribute('aria-label', 'Imagem ' + (i + 1));
        (function (idx) { d.addEventListener('click', function () { heroGo(idx); reinicia(); }); })(i);
        dotsWrap.appendChild(d);
        hdots.push(d);
      }
    }

    var hi = 0, timer = null, DELAY = 6000;

    function escapaHTML(t) {
      return String(t).replace(/[&<>"]/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
      });
    }

    // Troca o texto sobreposto conforme o slide ativo.
    function renderizaPainel(i) {
      if (!pane) { return; }
      if (i === 0) {
        hero.classList.remove('is-news');
        pane.innerHTML = introHTML;
      } else {
        var n = noticias[i - 1];
        hero.classList.add('is-news');
        pane.innerHTML =
          '<span class="kicker">' + escapaHTML(n.cat) + '</span>' +
          '<h2 class="hl-news-title">' + escapaHTML(n.titulo) + '</h2>' +
          '<div class="highlight-actions">' +
            '<a class="btn btn--gold btn--lg" href="' + n.href + '">Ler notícia</a>' +
            '<a class="btn btn--ghost btn--lg" href="noticias.html">Ver todas as notícias</a>' +
          '</div>';
      }
    }

    function heroGo(n) {
      hi = (n + total) % total;
      hslides.forEach(function (s, idx) { s.classList.toggle('is-active', idx === hi); });
      hdots.forEach(function (d, idx) { d.classList.toggle('is-active', idx === hi); });
      renderizaPainel(hi);
    }

    function avanca() { heroGo(hi + 1); }
    function inicia() { if (!hreduz && total > 1 && !timer) { timer = setInterval(avanca, DELAY); } }
    function para() { if (timer) { clearInterval(timer); timer = null; } }
    function reinicia() { para(); inicia(); }

    var hprev = hero.querySelector('.hl-prev');
    var hnext = hero.querySelector('.hl-next');
    if (hprev) { hprev.addEventListener('click', function () { heroGo(hi - 1); reinicia(); }); }
    if (hnext) { hnext.addEventListener('click', function () { heroGo(hi + 1); reinicia(); }); }

    // Pausa o autoplay no hover/foco e quando a aba fica em segundo plano.
    hero.addEventListener('mouseenter', para);
    hero.addEventListener('mouseleave', inicia);
    hero.addEventListener('focusin', para);
    hero.addEventListener('focusout', inicia);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { para(); } else { inicia(); }
    });

    heroGo(0);
    inicia();
  }
  });
});
