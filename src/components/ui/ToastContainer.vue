<template>
  <div class="fixed top-10 right-0 z-50 p-4 flex flex-col-reverse items-end gap-3 max-h-screen overflow-hidden">
    <Toast v-for="toast in toasts" :key="toast.id" :toast="toast" @close="removeToast" @confirm="handleConfirm" @cancel="handleCancel" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useToastStore } from '../../stores/toastStore';
import Toast from './Toast.vue';

const toastStore = useToastStore();
const toasts = computed(() => toastStore.toasts);

// 移除消息
const removeToast = (id) => {
  toastStore.removeToast(id);
};

// 处理确认操作
const handleConfirm = (id) => {
  const toast = toastStore.getToastById(id);
  if (toast && toast.onConfirm) {
    toast.onConfirm();
  }
  removeToast(id);
};

// 处理取消操作
const handleCancel = (id) => {
  const toast = toastStore.getToastById(id);
  if (toast && toast.onCancel) {
    toast.onCancel();
  }
  removeToast(id);
};
</script> 