<template>
  <div class="relative w-full">
    <button type="button" :aria-expanded="open" :aria-controls="id" class="w-full relative flex items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary" @click="toggle" :class="className">
      <span class="flex items-center gap-2">
        <slot name="icon" v-if="$slots.icon"></slot>
        <span>{{ selectedOption ? selectedOption.label : placeholder }}</span>
      </span>
      <ChevronDownIcon class="h-4 w-4 opacity-50" :class="{ 'rotate-180 transform': open }" />
    </button>

    <!-- Dropdown -->
    <div v-if="open" class="absolute z-50 mt-1 w-full rounded-md border border-input bg-background p-1 shadow-md" :id="id">
      <div class="max-h-[200px] overflow-auto">
        <div v-for="option in options" :key="option.value" class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" :class="{ 'bg-accent text-accent-foreground': modelValue === option.value }" @click="select(option.value)">
          <slot name="option" :option="option">
            {{ option.label }}
          </slot>
          <CheckIcon v-if="modelValue === option.value" class="ml-auto h-4 w-4" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { CheckIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '请选择...',
  },
  className: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const id = `select-${Math.random().toString(36).substr(2, 9)}`;
const open = ref(false);

// 获取选中的选项
const selectedOption = computed(() => {
  return props.options.find(option => option.value === props.modelValue);
});

// 选择选项
const select = (value) => {
  emit('update:modelValue', value);
  open.value = false;
};

// 切换下拉框的显示/隐藏
const toggle = () => {
  open.value = !open.value;
};

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  const el = event.target;
  if (el.closest(`#${id}`) === null && el.closest(`button[aria-controls="${id}"]`) === null) {
    open.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script> 