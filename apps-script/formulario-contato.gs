// ============================================================
// Formulário do site AME -> Gmail (via Google Apps Script)
// Envia o e-mail pela conta Gmail da AME, guarda uma cópia de
// backup numa planilha e (NOVO) recebe ANEXOS: eles vão junto no
// e-mail e ficam salvos numa pasta do Drive.
// ============================================================

var EMAIL_DESTINO = 'institutodedireitoshumanosame@gmail.com';
var NOME_PLANILHA = 'Submissões - Site AME';
var PASTA_ANEXOS  = 'Site AME - Anexos do formulário';
var MAX_ANEXOS    = 3;
var MAX_BYTES     = 10 * 1024 * 1024; // 10 MB no total

function doPost(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};

    // Honeypot anti-spam
    if (params.botcheck) {
      return responder({ success: true });
    }

    var nome = params.name || params.nome || '(não informado)';
    var email = params.email || '(não informado)';
    var assunto = params.subject || params.assunto || 'Novo contato pelo site AME';
    var mensagem = params.message || params.mensagem || '';

    if (!mensagem) {
      return responder({ success: false, message: 'Mensagem vazia.' });
    }

    // ---- Anexos (o site manda em base64) ----
    var anexos = [];
    var links = [];
    var qtd = Math.min(parseInt(params.anexos_qtd || '0', 10) || 0, MAX_ANEXOS);
    if (qtd > 0) {
      var pasta = getOuCriaPasta();
      var carimbo = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd HH-mm');
      var total = 0;
      for (var i = 0; i < qtd; i++) {
        var dados = params['anexo_dados_' + i];
        if (!dados) { continue; }
        var bytes = Utilities.base64Decode(dados);
        total += bytes.length;
        if (total > MAX_BYTES) { break; }
        var nomeArq = (params['anexo_nome_' + i] || ('anexo-' + (i + 1))).replace(/[\\\/:*?"<>|]/g, '_');
        var blob = Utilities.newBlob(bytes, params['anexo_tipo_' + i] || 'application/octet-stream', nomeArq);
        anexos.push(blob);
        try {
          var arq = pasta.createFile(blob.copyBlob().setName(carimbo + ' - ' + nome + ' - ' + nomeArq));
          links.push(nomeArq + ' — ' + arq.getUrl());
        } catch (errDrive) {
          Logger.log('Falha ao salvar anexo no Drive: ' + errDrive);
          links.push(nomeArq + ' (só no e-mail)');
        }
      }
    }

    var corpo =
      'Nova mensagem recebida pelo formulário do site institucional:\n\n' +
      'Nome: ' + nome + '\n' +
      'E-mail: ' + email + '\n' +
      'Assunto: ' + assunto + '\n\n' +
      'Mensagem:\n' + mensagem + '\n\n';
    if (links.length) {
      corpo += 'Arquivos anexados (' + links.length + ') — também salvos no Drive, pasta "' + PASTA_ANEXOS + '":\n' +
               '• ' + links.join('\n• ') + '\n\n';
    }
    corpo += '---\nEnviado automaticamente pelo site institutoameosantoamaro.org.br';

    var opcoes = {
      to: EMAIL_DESTINO,
      subject: '[Site AME] ' + assunto + (anexos.length ? ' 📎' : ''),
      body: corpo
    };
    if (email !== '(não informado)') { opcoes.replyTo = email; }
    if (anexos.length) { opcoes.attachments = anexos; }
    MailApp.sendEmail(opcoes);

    // Backup na planilha — se falhar, o e-mail já foi
    try {
      salvarNaPlanilha(nome, email, assunto, mensagem, links.join('\n'));
    } catch (errPlanilha) {
      Logger.log('Falha ao salvar backup na planilha: ' + errPlanilha);
    }

    return responder({ success: true });
  } catch (err) {
    Logger.log('Erro no doPost: ' + err);
    return responder({ success: false, message: String(err) });
  }
}

function salvarNaPlanilha(nome, email, assunto, mensagem, anexos) {
  var aba = getOuCriaPlanilha();
  if (!aba.getRange(1, 6).getValue()) { aba.getRange(1, 6).setValue('Anexos'); }
  aba.appendRow([new Date(), nome, email, assunto, mensagem, anexos || '']);
}

function getOuCriaPlanilha() {
  var arquivos = DriveApp.getFilesByName(NOME_PLANILHA);
  var planilha;
  if (arquivos.hasNext()) {
    planilha = SpreadsheetApp.open(arquivos.next());
  } else {
    planilha = SpreadsheetApp.create(NOME_PLANILHA);
    planilha.getActiveSheet().appendRow(['Data', 'Nome', 'E-mail', 'Assunto', 'Mensagem', 'Anexos']);
  }
  return planilha.getActiveSheet();
}

function getOuCriaPasta() {
  var it = DriveApp.getFoldersByName(PASTA_ANEXOS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PASTA_ANEXOS);
}

function responder(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// TESTE MANUAL: escolha "testeEnvio" no menu de funções e clique em Executar (▶).
// Manda um e-mail de teste COM um anexo .txt — confira na caixa da AME.
function testeEnvio() {
  doPost({
    parameter: {
      name: 'Teste Apps Script',
      email: 'teste@example.com',
      subject: 'Teste manual do script (com anexo)',
      message: 'Se você recebeu este e-mail com um anexo, está tudo funcionando.',
      anexos_qtd: '1',
      anexo_nome_0: 'teste.txt',
      anexo_tipo_0: 'text/plain',
      anexo_dados_0: Utilities.base64Encode('Arquivo de teste do formulário do site AME.')
    }
  });
}
