<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/50" @click="cancel"></div>

    <!-- 对话框 -->
    <div class="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
      <h2 class="mb-2 text-xl font-semibold text-destructive">确认删除</h2>

      <p v-if="multiple" class="mb-4 text-sm text-muted-foreground">
        你确定要删除选中的 {{ count }} 张图片吗？此操作无法撤销。
      </p>
      <p v-else class="mb-4 text-sm text-muted-foreground">
        你确定要删除"{{ image?.name }}"吗？此操作无法撤销。
      </p>

      <div class="flex justify-end space-x-2">
        <button @click="cancel" class="rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80">
          取消
        </button>
        <button @click="confirm" class="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
          删除
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

  if (props.multiple) {
    toastStore.success(`已删除 ${props.count} 张图片`);
  } else if (props.image) {
    toastStore.success(`已删除图片"${props.image.name}"`);
  }

  close();
};
</script> 