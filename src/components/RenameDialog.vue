<template>
  <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/50" @click="cancel"></div>

    <!-- 对话框 -->
    <div class="relative w-full max-w-md rounded-lg bg-card p-6 shadow-lg z-[101]">
      <h2 class="mb-4 text-xl font-semibold">重命名图片</h2>

      <div class="mb-4">
        <label for="name" class="mb-2 block text-sm font-medium">
          名称
        </label>
        <input id="name" v-model="newName" type="text" class="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="请输入新名称" @keydown.enter="confirm" />
      </div>

      <div class="flex justify-end space-x-2">
        <button @click="cancel" class="rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80">
          取消
        </button>
        <button @click="confirm" class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
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
});

const emit = defineEmits(['update:modelValue', 'rename']);
const toastStore = useToastStore();

const newName = ref('');

// 监听图片变化，更新名称
watch(() => props.image, (newImage) => {
  if (newImage) {
    newName.value = newImage.name;
  }
}, { immediate: true });

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
  if (!newName.value.trim()) {
    toastStore.warning('请输入有效的名称');
    return;
  }

  emit('rename', {
    id: props.image.id,
    name: newName.value.trim(),
  });

  toastStore.success(`已将图片重命名为 "${newName.value.trim()}"`);
  close();
};
</script> 