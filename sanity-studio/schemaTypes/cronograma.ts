import {defineType, defineField} from 'sanity'
import {CalendarIcon} from '@sanity/icons'

/**
 * Tipo de conteúdo "Cronograma de Atividades".
 * Usado nas páginas de núcleo (ex.: Elas) para mostrar a programação do mês.
 *
 * Como usar (mensalmente):
 * - Crie um novo documento a cada início de mês com a imagem do cronograma.
 * - O site sempre mostra automaticamente o cronograma mais recente
 *   (pelo campo "Mês de referência") de cada núcleo — não é preciso
 *   apagar os antigos nem mexer no código do site.
 *
 * Visibilidade no site: use os botões "Publish" / "Unpublish" do Studio.
 */
export const cronograma = defineType({
  name: 'cronograma',
  title: 'Cronograma de Atividades',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'nucleo',
      title: 'Núcleo / aba do site',
      description: 'Define em qual página do site este cronograma aparece.',
      type: 'string',
      options: {
        list: [
          {title: 'Elas', value: 'Elas'},
          {title: 'Observatório do Santo Amaro', value: 'Observatório'},
          {title: 'Repositório Institucional', value: 'Repositório'},
          {title: 'Cine Santo Amaro', value: 'Cine Santo Amaro'},
          {title: 'Pesquisa Caminho das Águas', value: 'Caminho das Águas'},
          {title: 'Grupo de Estudos Luam Pessoa', value: 'Luam Pessoa'},
          {title: 'Tribunal da Terra', value: 'Tribunal da Terra'},
        ],
      },
      initialValue: 'Elas',
      validation: (rule) => rule.required().error('Escolha em qual página este cronograma deve aparecer.'),
    }),
    defineField({
      name: 'title',
      title: 'Título (opcional)',
      description: 'Ex.: "Cronograma de Julho 2026". Se deixar em branco, o site usa o mês de referência.',
      type: 'string',
    }),
    defineField({
      name: 'mesReferencia',
      title: 'Mês de referência',
      description: 'Escolha qualquer dia do mês a que este cronograma se refere (ex.: 01/07/2026 para julho/2026). O site sempre exibe o cronograma do mês mais recente cadastrado aqui.',
      type: 'date',
      options: {dateFormat: 'MM/YYYY'},
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required().error('Informe o mês de referência do cronograma.'),
    }),
    defineField({
      name: 'imagem',
      title: 'Imagem do cronograma',
      description: 'Envie a imagem (foto/arte) com a programação do mês.',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Descrição da imagem (acessibilidade)',
          description: 'Ex.: "Cronograma de atividades do Núcleo Elas — Julho 2026".',
          type: 'string',
        }),
      ],
      validation: (rule) => rule.required().error('Envie a imagem do cronograma.'),
    }),
    defineField({
      name: 'arquivo',
      title: 'Arquivo PDF (opcional)',
      description: 'Envie aqui se também quiser disponibilizar o cronograma em PDF para download.',
      type: 'file',
      options: {accept: '.pdf'},
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data de publicação',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Mês de referência (mais recente)',
      name: 'mesReferenciaDesc',
      by: [{field: 'mesReferencia', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', nucleo: 'nucleo', mes: 'mesReferencia', media: 'imagem'},
    prepare({title, nucleo, mes, media}) {
      return {
        title: title || `Cronograma — ${nucleo || ''}`,
        subtitle: mes,
        media,
      }
    },
  },
})
