import {defineType, defineField} from 'sanity'
import {DocumentsIcon} from '@sanity/icons'

/**
 * Tipo de conteúdo "Publicação" (pesquisas, artigos, relatórios, dados).
 * Diferente da "Notícia" (posts curtos), aqui o foco é material mais robusto:
 * um PDF para baixar ou um link externo, associado a um núcleo do AME
 * (ex.: Observatório do Santo Amaro, Repositório Institucional).
 *
 * Visibilidade no site: use os botões "Publish" / "Unpublish" do Studio.
 */
export const publicacao = defineType({
  name: 'publicacao',
  title: 'Publicação (Pesquisa/Relatório)',
  type: 'document',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.required().error('O título é obrigatório.'),
    }),
    defineField({
      name: 'nucleo',
      title: 'Núcleo / aba do site',
      description: 'Define em qual página do site esta publicação aparece.',
      type: 'string',
      options: {
        list: [
          {title: 'Observatório do Santo Amaro', value: 'Observatório'},
          {title: 'Repositório Institucional', value: 'Repositório'},
          {title: 'Cine Santo Amaro', value: 'Cine Santo Amaro'},
          {title: 'Pesquisa Caminho das Águas', value: 'Caminho das Águas'},
          {title: 'Grupo de Estudos Luam Pessoa', value: 'Luam Pessoa'},
          {title: 'Elas', value: 'Elas'},
          {title: 'Tribunal da Terra', value: 'Tribunal da Terra'},
          {title: 'Geral (institucional)', value: 'Geral'},
        ],
      },
      validation: (rule) => rule.required().error('Escolha em qual página esta publicação deve aparecer.'),
    }),
    defineField({
      name: 'tipo',
      title: 'Tipo de material',
      type: 'string',
      options: {
        list: [
          {title: 'Pesquisa', value: 'Pesquisa'},
          {title: 'Artigo', value: 'Artigo'},
          {title: 'Relatório', value: 'Relatório'},
          {title: 'Dado / Levantamento', value: 'Dado'},
        ],
      },
      initialValue: 'Pesquisa',
    }),
    defineField({
      name: 'resumo',
      title: 'Resumo',
      description: 'Texto curto que aparece no cartão da publicação.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300).warning('Resumos curtos (até 300 caracteres) ficam melhores nos cartões.'),
    }),
    defineField({
      name: 'capa',
      title: 'Imagem de capa (opcional)',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Descrição da imagem (acessibilidade)',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'arquivo',
      title: 'Arquivo PDF (opcional)',
      description: 'Envie o PDF aqui se quiser que apareça um botão de "Baixar PDF".',
      type: 'file',
      options: {accept: '.pdf'},
    }),
    defineField({
      name: 'linkExterno',
      title: 'Link externo (opcional)',
      description: 'Use quando o material estiver hospedado em outro site (ex.: DataLabe, Google Drive). Se preencher o PDF acima, este campo é ignorado.',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'autores',
      title: 'Autoria (opcional)',
      description: 'Ex.: "Observatório do Santo Amaro" ou nomes de pesquisadores(as).',
      type: 'string',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data de publicação',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'destaque',
      title: 'Destaque',
      description: 'Marque para exibir o selo "★ Destaque" no cartão.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Data de publicação (mais recente)',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', subtitle: 'nucleo', media: 'capa'},
  },
})
