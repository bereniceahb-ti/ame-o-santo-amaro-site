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
});
