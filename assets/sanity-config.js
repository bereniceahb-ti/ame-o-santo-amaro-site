/* =====================================================================
   Configuração de conexão com o Sanity (CMS das notícias).

   IMPORTANTE: este arquivo NÃO contém senhas nem tokens secretos.
   - projectId e dataset são PÚBLICOS e usados apenas para LEITURA das
     notícias já publicadas (o mesmo dado que aparece no site).
   - A criação/edição/remoção de notícias acontece no painel do Sanity
     (Studio), com login próprio — nunca por aqui.

   Só é preciso preencher o projectId uma única vez (a Berenice faz isso
   na configuração inicial). Depois disso, o presidente nunca mexe aqui.
   ===================================================================== */
window.SANITY_CONFIG = {
  // Cole aqui o ID do projeto Sanity (algo como 'a1b2c3d4'):
  projectId: 'u1olu9ga',
  dataset: 'production',
  apiVersion: '2024-01-01'
};
