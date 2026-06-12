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
});
