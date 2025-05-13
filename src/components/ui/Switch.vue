<template>
  <div class="flex items-center space-x-2">
    <button type="button" role="switch" :aria-checked="localValue" class="peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted" :class="className" :data-state="localValue ? 'checked' : 'unchecked'" @click="toggle" :disabled="disabled">
      <span class="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 border border-slate-200" :data-state="localValue ? 'checked' : 'unchecked'" />
    </button>
    <slot></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { debounce } from '../../utils';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  },
  debounceTime: {
    type: Number,
    default: 300
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// 防抖处理的toggle函数
const debouncedToggle = debounce(function (newValue) {
  emit('update:modelValue', newValue);
  emit('change', newValue);
}, props.debounceTime);

// 本地状态，用于立即反馈UI效果
const localValue = ref(props.modelValue);

// 切换状态
const toggle = () => {
  if (props.disabled) return;

  // 立即更新本地状态以提供UI反馈
  const newValue = !props.modelValue;
  localValue.value = newValue;

  // 使用防抖函数处理实际状态更新
  debouncedToggle(newValue);
};
</script> 