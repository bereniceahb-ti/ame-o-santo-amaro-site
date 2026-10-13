/**
 * Formulários do site do Instituto AME -> e-mail da AME (com anexos)
 *
 * COMO ATUALIZAR (sem mudar a URL que o site usa):
 * 1. Abra script.google.com com a conta institutodedireitoshumanosame@gmail.com
 *    e abra o projeto do formulário do site.
 * 2. Apague o código antigo do Código.gs e cole TODO este arquivo.
 * 3. Salve. Rode a função "testarPermissoes" uma vez e autorize (Gmail + Drive).
 * 4. Implantar -> Gerenciar implantações -> lápis (editar) ->
 *    Versão: "Nova versão" -> Implantar.  (NÃO crie "Nova implantação",
 *    senão a URL muda e o site para de enviar.)
 */

var EMAIL_DESTINO = 'institutodedireitoshumanosame@gmail.com';
var PASTA_ANEXOS  = 'Site AME - Anexos do formulário'; // pasta criada no Drive
var MAX_ANEXOS    = 3;
var MAX_BYTES     = 10 * 1024 * 1024; // 10 MB no total

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    // Anti-spam: campo escondido "botcheck" precisa vir vazio
    if (p.botcheck) { return resposta({ success: true }); }

    var nome     = (p.name || '').trim();
    var email    = (p.email || '').trim();
    var assunto  = (p.subject || '').trim() || 'Mensagem pelo site';
    var mensagem = (p.message || '').trim();

    // ---- Anexos (vêm em base64 do site) ----
    var anexos = [];
    var links  = [];
    var total  = 0;
    var qtd = Math.min(parseInt(p.anexos_qtd || '0', 10) || 0, MAX_ANEXOS);

    if (qtd > 0) {
      var pasta = pastaAnexos();
      var carimbo = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd HH-mm');
      for (var i = 0; i < qtd; i++) {
        var dados = p['anexo_dados_' + i];
        if (!dados) { continue; }
        var bytes = Utilities.base64Decode(dados);
        total += bytes.length;
        if (total > MAX_BYTES) { break; }
        var nomeArq = (p['anexo_nome_' + i] || ('anexo-' + (i + 1))).replace(/[\\/:*?"<>|]/g, '_');
        var blob = Utilities.newBlob(bytes, p['anexo_tipo_' + i] || 'application/octet-stream', nomeArq);
        anexos.push(blob);
        // Guarda uma cópia no Drive (fica fácil achar as publicações depois)
        var arq = pasta.createFile(blob.copyBlob().setName(carimbo + ' - ' + nome + ' - ' + nomeArq));
        links.push('• ' + nomeArq + ' — ' + arq.getUrl());
      }
    }

    var corpo =
      'Nova mensagem pelo site do Instituto AME\n\n' +
      'Nome: ' + nome + '\n' +
      'E-mail: ' + email + '\n' +
      'Assunto: ' + assunto + '\n\n' +
      'Mensagem:\n' + mensagem + '\n';

    if (links.length) {
      corpo += '\n------------------------------\n' +
               'Arquivos anexados (' + links.length + ') — também salvos no Drive, pasta "' + PASTA_ANEXOS + '":\n' +
               links.join('\n') + '\n';
    }

    var opcoes = { name: 'Site Instituto AME', attachments: anexos };
    if (email) { opcoes.replyTo = email; }

    MailApp.sendEmail(EMAIL_DESTINO, '[Site AME] ' + assunto + (anexos.length ? ' 📎' : ''), corpo, opcoes);

    return resposta({ success: true });
  } catch (err) {
    console.error(err);
    return resposta({ success: false, error: String(err) });
  }
}

function doGet() {
  return resposta({ ok: true, info: 'Formulário do site AME ativo' });
}

function pastaAnexos() {
  var it = DriveApp.getFoldersByName(PASTA_ANEXOS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PASTA_ANEXOS);
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Rode uma vez pelo editor para autorizar Gmail e Drive
function testarPermissoes() {
  pastaAnexos();
  Logger.log('Cota de e-mails restante hoje: ' + MailApp.getRemainingDailyQuota());
}
