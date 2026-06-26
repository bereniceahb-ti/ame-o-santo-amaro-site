import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'

/**
 * Tipo de conteúdo "Notícia".
 * Cada notícia publicada aqui aparece automaticamente no site.
 *
 * Visibilidade no site: use os botões "Publish" / "Unpublish" do Studio.
 * - Publish  -> a notícia fica visível no site.
 * - Unpublish -> a notícia some do site (despublicar), sem apagar o conteúdo.
 */
export const noticia = defineType({
  name: 'noticia',
  title: 'Notícia',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.required().error('O título é obrigatório.'),
    }),
    defineField({
      name: 'slug',
      title: 'Endereço (URL) da notícia',
      description: 'Gerado automaticamente a partir do título. Clique em "Generate".',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required().error('Clique em "Generate" para criar o endereço.'),
    }),
    defineField({
      name: 'summary',
      title: 'Resumo / subtítulo',
      description: 'Texto curto que aparece nos cartões de notícia (home e listagem).',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300).warning('Resumos curtos (até 300 caracteres) ficam melhores nos cartões.'),
    }),
    defineField({
      name: 'coverImage',
      title: 'Imagem de capa',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Descrição da imagem (acessibilidade)',
          description: 'Descreva brevemente a foto. Importante para acessibilidade e SEO.',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data de publicação',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'string',
      options: {
        list: [
          {title: 'Comunicação', value: 'Comunicação'},
          {title: 'Meio Ambiente', value: 'Meio Ambiente'},
          {title: 'Direitos', value: 'Direitos'},
          {title: 'Educação', value: 'Educação'},
          {title: 'Cultura', value: 'Cultura'},
          {title: 'Gênero', value: 'Gênero'},
          {title: 'Observatório', value: 'Observatório'},
          {title: 'Tribunal da Terra', value: 'Tribunal da Terra'},
          {title: 'Geral', value: 'Geral'},
        ],
      },
    }),
    defineField({
      name: 'author',
      title: 'Autor (opcional)',
      type: 'string',
    }),
    defineField({
      name: 'source',
      title: 'Fonte (opcional)',
      description: 'Use quando a notícia vier de outra fonte.',
      type: 'string',
    }),
    defineField({
      name: 'featured',
      title: 'Destaque na home',
      description: 'Marque para exibir o selo "★ Destaque" no cartão.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'body',
      title: 'Texto completo',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Parágrafo', value: 'normal'},
            {title: 'Título 2', value: 'h2'},
            {title: 'Título 3', value: 'h3'},
            {title: 'Citação', value: 'blockquote'},
          ],
          lists: [
            {title: 'Lista', value: 'bullet'},
            {title: 'Lista numerada', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Negrito', value: 'strong'},
              {title: 'Itálico', value: 'em'},
              {title: 'Sublinhado', value: 'underline'},
            ],
            annotations: [
              defineArrayMember({
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'Endereço (URL)',
                    type: 'url',
                    validation: (rule) =>
                      rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Descrição da imagem', type: 'string'}),
            defineField({name: 'caption', title: 'Legenda', type: 'string'}),
          ],
        }),
      ],
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
    select: {title: 'title', subtitle: 'category', media: 'coverImage'},
  },
})
