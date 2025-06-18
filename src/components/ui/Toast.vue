<template>
  <div v-if="visible" class="w-80 pointer-events-auto">
    <!-- 移除黑色遮罩层，对于模态对话框，仍保留点击关闭逻辑，但不显示蒙层 -->
    <div v-if="toast.isModal" class="fixed inset-0 z-40 pointer-events-auto" @click="closeIfNotModal"></div>

    <!-- Toast消息 -->
    <div class="toast-container rounded-lg p-4 shadow-lg transition-all relative w-full z-50" :class="[typeClasses, { 'toast-exit': isClosing }]" @mouseenter="pauseTimer" @mouseleave="resumeTimer">
      <!-- 消息内容 -->
      <div class="flex items-start">
        <!-- 图标 -->
        <div v-if="icon" class="mr-3 flex-shrink-0">
          <component :is="icon" class="h-6 w-6" />
        </div>

        <!-- 文本内容 -->
        <div class="flex-1 mr-6 overflow-hidden">
          <h3 v-if="toast.title" class="font-medium mb-1 pr-2 truncate">{{ toast.title }}</h3>
          <p class="text-sm break-words">{{ toast.message }}</p>

          <!-- 确认/取消按钮 (用于模态对话框) -->
          <div v-if="toast.isModal" class="mt-4 flex justify-end gap-2">
            <button v-if="toast.showCancel" @click="onCancel" class="px-3 py-1.5 rounded-md text-sm bg-muted text-muted-foreground hover:bg-muted/80">
              {{ toast.cancelText || '取消' }}
            </button>
            <button v-if="toast.showConfirm" @click="onConfirm" class="px-3 py-1.5 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90">
              {{ toast.confirmText || '确定' }}
            </button>
          </div>
        </div>

        <!-- 关闭按钮 (对所有类型的Toast都显示) -->
        <button @click="close" class="flex-shrink-0 rounded-md p-1 text-muted-foreground/70 hover:text-foreground">
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>

      <!-- 倒计时进度条 -->
      <div v-if="!toast.isModal && toast.duration" class="progress-bar-container absolute bottom-0 left-0 right-0 h-1 rounded-b-lg overflow-hidden">
        <div class="progress-bar h-full transition-[width]" :class="progressBarClass" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  toast: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'confirm', 'cancel']);

const visible = ref(false);
const isClosing = ref(false);
const progressPercentage = ref(100);
let timeout;
let animationFrameId;
let startTime = 0;
let remainingTime = 0;
let isPaused = false;

// 根据不同类型显示不同样式和图标
const typeClasses = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200';
    case 'error':
      return 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200';
    case 'info':
    default:
      return 'bg-background text-foreground';
  }
});

// 根据类型选择图标
const icon = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return CheckCircleIcon;
    case 'error':
      return ExclamationCircleIcon;
    case 'warning':
      return ExclamationTriangleIcon;
    case 'info':
    default:
      return InformationCircleIcon;
  }
});

const progressBarClass = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'bg-green-500 dark:bg-green-400';
    case 'error':
      return 'bg-red-500 dark:bg-red-400';
    case 'warning':
      return 'bg-yellow-500 dark:bg-yellow-400';
    case 'info':
    default:
      return 'bg-primary';
  }
});

// 更新进度条
const updateProgress = (timestamp) => {
  if (!startTime) startTime = timestamp;
  if (isPaused) {
    startTime = timestamp - (props.toast.duration - remainingTime);
    animationFrameId = requestAnimationFrame(updateProgress);
    return;
  }

  const elapsed = timestamp - startTime;
  remainingTime = props.toast.duration - elapsed;

  if (remainingTime <= 0) {
    progressPercentage.value = 0;
    close();
    return;
  }

  progressPercentage.value = (remainingTime / props.toast.duration) * 100;
  animationFrameId = requestAnimationFrame(updateProgress);
};

// 暂停计时器
const pauseTimer = () => {
  if (props.toast.isModal || !props.toast.duration) return;
  isPaused = true;
};

// 恢复计时器
const resumeTimer = () => {
  if (props.toast.isModal || !props.toast.duration) return;
  isPaused = false;
};

// 关闭消息
const close = () => {
  if (isClosing.value) return;

  cancelAnimationFrame(animationFrameId);
  clearTimeout(timeout);

  isClosing.value = true;

  // 动画结束后再移除组件
  timeout = setTimeout(() => {
    visible.value = false;
    emit('close', props.toast.id);
  }, 400); // 与CSS动画时长匹配
};

// 点击背景关闭
const closeIfNotModal = () => {
  if (!props.toast.isModal) {
    close();
  }
};

// 确认操作
const onConfirm = () => {
  emit('confirm', props.toast.id);
  close();
};

// 取消操作
const onCancel = () => {
  emit('cancel', props.toast.id);
  close();
};

watch(() => props.toast, () => {
  cancelAnimationFrame(animationFrameId);
  clearTimeout(timeout);
  isClosing.value = false;

  // 重置进度条和时间
  progressPercentage.value = 100;
  startTime = 0;
  remainingTime = props.toast.duration || 0;

  // 如果是自动消失的消息，开始倒计时
  if (props.toast.duration && !props.toast.isModal) {
    animationFrameId = requestAnimationFrame(updateProgress);
  }
}, { immediate: true });

onMounted(() => {
  visible.value = true;
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  clearTimeout(timeout);
});
</script>

<style scoped>
.toast-container {
  animation: slide-in-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.toast-exit {
  animation: slide-out-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.progress-bar-container {
  opacity: 0.7;
}

.progress-bar {
  transition-timing-function: linear;
}

@keyframes slide-in-right {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  70% {
    transform: translateX(-10px);
  }
  85% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-right {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style> 