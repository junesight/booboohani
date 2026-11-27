import React from 'react'
import {defineArrayMember, defineField, defineType} from 'sanity'
import settings from '../../health-config.json'

const colors = [
  {title: '기본', value: '#20251f'}, {title: '초록', value: '#163d32'},
  {title: '금색', value: '#b99a63'}, {title: '빨강', value: '#b33939'},
  {title: '파랑', value: '#2765a1'}, {title: '회색', value: '#777777'},
]
function MarkPreview(props: any) {
  const value = props.value || {}
  const style = value._type === 'textColor' ? {color: value.value}
    : value._type === 'highlight' ? {backgroundColor: value.value}
      : {fontSize: value.value}
  return <span style={style}>{props.children}</span>
}
const imageFields = [defineField({name: 'alt', title: '이미지 설명', type: 'string', validation: (rule) => rule.required().max(240)})]

export const healthPost = defineType({
  name: 'healthPost', title: '건강 정보 및 칼럼', type: 'document',
  fields: [
    defineField({name: 'title', title: '제목', type: 'string', validation: (rule) => rule.required().max(160)}),
    defineField({name: 'category', title: '카테고리', type: 'string', options: {list: settings.categories.map(([value, title]) => ({title, value}))}, validation: (rule) => rule.required()}),
    defineField({name: 'coverImage', title: '대표 이미지', type: 'image', options: {hotspot: true, accept: 'image/jpeg,image/png,image/webp'}, fields: imageFields, validation: (rule) => rule.required()}),
    defineField({name: 'publishedAt', title: '최초 발행일', type: 'datetime', initialValue: () => new Date().toISOString(), validation: (rule) => rule.required()}),
    defineField({name: 'body', title: '본문', type: 'array', validation: (rule) => rule.required().min(1), of: [
      defineArrayMember({type: 'block', styles: [
        {title: '본문', value: 'normal'}, {title: '큰 제목', value: 'h2'}, {title: '작은 제목', value: 'h3'},
        {title: '인용문', value: 'blockquote'}, {title: '가운데 정렬', value: 'center'}, {title: '오른쪽 정렬', value: 'right'},
      ], lists: [{title: '글머리 목록', value: 'bullet'}, {title: '번호 목록', value: 'number'}], marks: {
        decorators: [{title: '굵게', value: 'strong'}, {title: '기울임', value: 'em'}, {title: '밑줄', value: 'underline'}, {title: '취소선', value: 'strike-through'}],
        annotations: [
          {name: 'link', title: '링크', type: 'object', fields: [defineField({name: 'href', title: '주소', type: 'url', validation: (rule) => rule.required().uri({scheme: ['https', 'http', 'mailto', 'tel'], allowRelative: true})})]},
          {name: 'textColor', title: '글자색', type: 'object', components: {annotation: MarkPreview}, fields: [defineField({name: 'value', title: '색상', type: 'string', options: {list: colors}, validation: (rule) => rule.required()})]},
          {name: 'textSize', title: '글자 크기', type: 'object', components: {annotation: MarkPreview}, fields: [defineField({name: 'value', title: '크기', type: 'string', options: {list: ['14px', '16px', '18px', '22px', '28px', '36px']}, validation: (rule) => rule.required()})]},
          {name: 'highlight', title: '배경 강조', type: 'object', components: {annotation: MarkPreview}, fields: [defineField({name: 'value', title: '강조색', type: 'string', options: {list: [{title: '노랑', value: '#fff0a8'}, {title: '초록', value: '#dcebdc'}, {title: '분홍', value: '#f5dede'}, {title: '파랑', value: '#ddeafa'}]}, validation: (rule) => rule.required()})]},
        ],
      }}),
      defineArrayMember({type: 'image', title: '본문 이미지', options: {hotspot: true, accept: 'image/jpeg,image/png,image/webp'}, fields: [
        ...imageFields,
        defineField({name: 'caption', title: '사진 설명', type: 'string'}),
        defineField({name: 'displayWidth', title: '표시 너비', type: 'string', initialValue: 'full', options: {list: [{title: '본문 너비', value: 'full'}, {title: '640px', value: '640'}, {title: '400px', value: '400'}, {title: '240px', value: '240'}]}}),
      ]}),
    ]}),
  ],
  preview: {
    select: {title: 'title', category: 'category', media: 'coverImage'},
    prepare({title, category, media}) {return {title, subtitle: `부부한의원 · ${settings.categories.find(([id]) => id === category)?.[1] || '카테고리 미선택'}`, media}},
  },
  orderings: [{title: '발행일 최신순', name: 'publishedAtDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
})
