<template>
  <button :class="[
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
      variants[variant],
      sizes[size],
      className
    ]" :disabled="disabled" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (val) => ['default', 'primary', 'destructive', 'outline', 'secondary', 'ghost', 'link'].includes(val)
  },
  size: {
    type: String,
    default: 'default',
    validator: (val) => ['default', 'sm', 'lg', 'icon'].includes(val)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
})

const variants = computed(() => ({
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline'
}))

const sizes = computed(() => ({
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9'
}))
</script> 