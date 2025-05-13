<template>
  <div v-if="modelValue" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <!-- 对话框 -->
    <div class="relative w-full max-w-md rounded-lg bg-card p-6 shadow-lg z-[10000]">
      <h2 class="mb-2 text-xl font-semibold" :class="confirmText === '删除' ? 'text-destructive' : 'text-primary'">
        {{ title || (multiple ? '确认批量操作' : '确认操作') }}
      </h2>

      <p v-if="message" class="mb-4 text-sm text-muted-foreground">{{ message }}</p>
      <p v-else-if="multiple" class="mb-4 text-sm text-muted-foreground">
        你确定要删除选中的 {{ count }} 项内容吗？此操作无法撤销。
      </p>
      <p v-else class="mb-4 text-sm text-muted-foreground">
        你确定要删除"{{ image?.name }}"吗？此操作无法撤销。
      </p>

      <div class="flex justify-end space-x-2">
        <button @click="cancel" class="rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80">
          取消
        </button>
        <button @click="confirm" class="rounded-md px-4 py-2 text-sm font-medium" :class="confirmText === '删除' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToastStore } from '../stores/toastStore';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  image: {
    type: Object,
    default: null,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  count: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: '删除',
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);
const toastStore = useToastStore();

// 关闭对话框
const close = () => {
  emit('update:modelValue', false);
};

// 取消操作
const cancel = () => {
  close();
};

// 确认操作
const confirm = () => {
  emit('confirm');

  if (props.confirmText === '删除') {
    if (props.multiple) {
      toastStore.success(`已删除 ${props.count} 项内容`);
    } else if (props.image) {
      toastStore.success(`已删除内容"${props.image.name}"`);
    }
  }

  close();
};
</script> 