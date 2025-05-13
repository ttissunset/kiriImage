<template>
  <div
    class="relative group border rounded-lg overflow-hidden bg-background shadow-sm transition-all hover:shadow-md hover:border-primary/30"
  >
    <!-- 预览缩略图 -->
    <div
      class="aspect-square bg-muted/50 overflow-hidden flex items-center justify-center border-b"
    >
      <img
        v-if="file.type.startsWith('image/')"
        :src="file.preview"
        class="w-full h-full object-cover"
      />
      <video
        v-else-if="file.type.startsWith('video/')"
        :src="file.preview"
        class="w-full h-full object-cover"
      ></video>
      <DocumentIcon v-else class="h-12 w-12 text-muted-foreground" />
    </div>

    <!-- 文件信息 -->
    <div class="p-3">
      <div class="text-sm font-medium truncate mb-1" :title="file.name">
        {{ file.name }}
      </div>
      <div class="text-xs text-muted-foreground">
        {{ formatFileSize(file.size) }}
      </div>

      <!-- 状态或进度条 -->
      <div class="mt-2">
        <div
          v-if="file.status === 'uploading'"
          class="w-full bg-muted rounded-full h-1.5 overflow-hidden"
        >
          <div
            class="bg-primary h-1.5 rounded-full transition-all duration-300"
            :style="{ width: `${displayProgress}%` }"
          ></div>
        </div>
        <div
          v-if="file.status === 'uploading'"
          class="text-xs text-primary flex justify-between mt-1"
        >
          <span>{{ progressStatusText }}</span>
          <span>{{ Math.round(displayProgress) }}%</span>
        </div>
        <div
          v-else-if="file.status === 'success'"
          class="text-xs text-green-500 flex items-center gap-1 mt-1"
        >
          <CheckCircleIcon class="h-4 w-4" />
          上传成功
        </div>
        <div
          v-else-if="file.status === 'error'"
          class="text-xs text-red-500 flex items-center gap-1 mt-1"
        >
          <ExclamationCircleIcon class="h-4 w-4" />
          {{ file.error || "上传失败" }}
        </div>
        <div
          v-else
          class="text-xs text-muted-foreground flex items-center gap-1 mt-1"
        >
          <span>准备上传</span>
        </div>
      </div>
    </div>

    <!-- 删除按钮 -->
    <button
      @click="onRemove"
      class="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 shadow flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
      :disabled="file.status === 'uploading'"
    >
      <XMarkIcon class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/vue/24/outline";
import { formatFileSize } from "../utils";

const props = defineProps({
  file: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["remove"]);

// 进度缓冲，用于动画过渡
const currentProgress = ref(0);

// 计算显示进度 - 确保当进度接近100%时，显示处理中状态
const displayProgress = computed(() => {
  // 实际进度接近100%但状态仍为uploading时，限制显示进度不超过95%
  if (currentProgress.value > 95 && props.file.status === "uploading") {
    return Math.min(currentProgress.value, 95);
  }

  // 只有当状态变为success时，才显示100%
  if (props.file.status === "success") {
    return 100;
  }

  return currentProgress.value;
});

// 显示的进度状态文本
const progressStatusText = computed(() => {
  if (currentProgress.value >= 95 && props.file.status === "uploading") {
    return "服务器处理中";
  }
  return "上传中";
});

// 监控文件进度变化，平滑更新进度数值
watch(
  () => props.file.progress,
  (newProgress) => {
    // 如果文件状态不是uploading，则不更新进度
    if (props.file.status !== "uploading") return;

    // 防止进度闪回
    if (newProgress < currentProgress.value) return;

    // 使用requestAnimationFrame确保在下一帧更新，创建流畅的过渡效果
    requestAnimationFrame(() => {
      // 当进度接近100%时，缓慢增加以等待服务器处理
      if (newProgress > 95) {
        // 缓慢增加剩余的进度
        currentProgress.value = Math.min(newProgress, 95);
      } else {
        currentProgress.value = newProgress;
      }
    });
  },
  { immediate: true }
);

// 当状态变为success时，确保进度为100%
watch(
  () => props.file.status,
  (newStatus) => {
    if (newStatus === "success") {
      currentProgress.value = 100;
    }
  }
);

// 组件挂载时初始化进度
onMounted(() => {
  currentProgress.value = props.file.progress || 0;
});

const onRemove = () => {
  if (props.file.status === "uploading") return;
  emit("remove");
};
</script>
