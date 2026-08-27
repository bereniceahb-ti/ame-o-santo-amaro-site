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

  // Formulários (envio real via Google Apps Script -> Gmail da AME)
  // URL do "App da Web" publicado no Google Apps Script (script.google.com).
  // Se precisar recriar o script, atualize essa URL depois de reimplantar.
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzHO544mPzloGz1tcz_2yfDQrfsLfGmsZT4Da5PlQCd02b00IDH8HPf22tI2es1VCjP/exec';

  document.querySelectorAll('form[data-web3forms]').forEach(function (f) {
    var msgOk = f.querySelector('.form-msg:not(.form-msg--error)');
    var msgErro = f.querySelector('.form-msg--error');
    var btn = f.querySelector('button[type="submit"]');

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (msgOk) { msgOk.style.display = 'none'; }
      if (msgErro) { msgErro.style.display = 'none'; }

      var textoOriginal = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

      var dados = new FormData(f);

      // Campo extra (ex: "Quero contribuir com" em Como Ajudar) não é lido
      // pelo script — anexa o valor na mensagem pra não perder a informação.
      var tipoContribuicao = dados.get('tipo_contribuicao');
      if (tipoContribuicao) {
        var mensagemAtual = dados.get('message') || '';
        dados.set('message', 'Quero contribuir com: ' + tipoContribuicao + '\n\n' + mensagemAtual);
      }

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: dados
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.success) {
            f.reset();
            if (msgOk) { msgOk.style.display = 'block'; }
          } else if (msgErro) {
            msgErro.style.display = 'block';
          }
        })
        .catch(function () {
          if (msgErro) { msgErro.style.display = 'block'; }
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = textoOriginal; }
        });
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

  // O hero e uma imagem unica e estatica (sem carrossel): a foto vem do
  // proprio HTML (.hl-slide.is-active), entao nao ha JS envolvido nele.
});
