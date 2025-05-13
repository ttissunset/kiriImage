<template>
  <div>
    <!-- 这是一个包含所有卡片子组件的文件 -->
  </div>
</template>

<script setup>
import { defineComponent, h } from 'vue'

const CardHeader = defineComponent({
  name: 'CardHeader',
  setup(_, { slots }) {
    return () => h('div', { class: 'flex flex-col space-y-1.5 p-6' }, slots.default && slots.default())
  }
})

const CardTitle = defineComponent({
  name: 'CardTitle',
  props: {
    as: {
      type: String,
      default: 'h3'
    }
  },
  setup(props, { slots }) {
    return () => h(props.as, { class: 'text-lg font-semibold leading-none tracking-tight' }, slots.default && slots.default())
  }
})

const CardDescription = defineComponent({
  name: 'CardDescription',
  setup(_, { slots }) {
    return () => h('p', { class: 'text-sm text-gray-500' }, slots.default && slots.default())
  }
})

const CardContent = defineComponent({
  name: 'CardContent',
  setup(_, { slots }) {
    return () => h('div', { class: 'p-6 pt-0' }, slots.default && slots.default())
  }
})

const CardFooter = defineComponent({
  name: 'CardFooter',
  setup(_, { slots }) {
    return () => h('div', { class: 'flex items-center p-6 pt-0' }, slots.default && slots.default())
  }
})

// 导出所有组件
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
</script> 