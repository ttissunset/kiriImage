<template>
  <div :class="['rounded-lg border bg-white shadow', className]">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: ''
  }
})
</script> 