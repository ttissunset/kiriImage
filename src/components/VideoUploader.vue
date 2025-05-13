<template>
  <div class="video-uploader w-full">
    <!-- 上传区域 -->
    <div class="drag-upload-area border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-all" :class="[
        isDragging
          ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
          : 'border-muted-foreground/30 hover:border-primary/50 hover:shadow-sm',
        isUploading ? 'pointer-events-none opacity-80' : 'cursor-pointer',
        uploadError ? 'border-destructive bg-destructive/5' : '',
      ]" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop" @click="triggerFileSelect">
      <input ref="fileInput" type="file" accept="video/*" class="hidden" @change="onFileChange" />

      <div v-if="!selectedFile && !isUploading" class="flex flex-col items-center justify-center py-6">
        <div class="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <CloudArrowUpIcon class="h-10 w-10 text-primary/70" />
        </div>
        <h3 class="text-lg font-medium mb-2">拖拽视频到此处或点击上传</h3>
        <p class="text-sm text-muted-foreground max-w-md mx-auto">
          支持常见视频格式，包括 MP4、WebM、MOV、AVI 等
        </p>
      </div>

      <div v-else-if="isUploading" class="uploading-status w-full max-w-xl mx-auto py-4" @click.stop>
        <div class="flex items-center gap-3 mb-4">
          <div class="h-10 w-10 flex-shrink-0 bg-muted rounded-full flex items-center justify-center">
            <FilmIcon class="h-5 w-5 text-muted-foreground" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate">{{ selectedFile.name }}</p>
            <p class="text-xs text-muted-foreground">
              {{ formatFileSize(selectedFile.size) }}
            </p>
          </div>
        </div>

        <div class="w-full mb-4">
          <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-primary transition-all" :style="{ width: `${uploadProgress}%` }"></div>
          </div>
          <div class="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{{ uploadProgressText }}</span>
            <span>{{ uploadStatusText }}</span>
          </div>
        </div>

        <div class="flex justify-center gap-2 mt-4">
          <Button v-if="!isPaused && uploadProgress < 100" variant="outline" size="sm" class="flex items-center gap-1.5" @click.stop="pauseUpload">
            <PauseIcon class="h-4 w-4" />
            暂停
          </Button>
          <Button v-else-if="isPaused" variant="default" size="sm" class="flex items-center gap-1.5" @click.stop="resumeUpload">
            <PlayIcon class="h-4 w-4" />
            继续
          </Button>
          <Button variant="outline" size="sm" class="flex items-center gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" @click.stop="cancelUpload">
            <XMarkIcon class="h-4 w-4" />
            取消
          </Button>
        </div>
      </div>

      <div v-else-if="uploadError" class="flex flex-col items-center py-6" @click.stop>
        <div class="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <ExclamationCircleIcon class="h-10 w-10 text-destructive" />
        </div>
        <h3 class="text-lg font-medium mb-2 text-destructive">上传失败</h3>
        <p class="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          {{ uploadError }}
        </p>
        <Button variant="default" size="sm" class="flex items-center gap-1.5" @click.stop="retryUpload">
          <ArrowPathIcon class="h-4 w-4" />
          重试上传
        </Button>
      </div>

      <div v-else-if="uploadSuccess" class="flex flex-col items-center py-6" @click.stop>
        <div class="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircleIcon class="h-10 w-10 text-success" />
        </div>
        <h3 class="text-lg font-medium mb-2 text-success">上传成功</h3>
        <div class="flex items-center gap-3 mb-4">
          <FilmIcon class="h-5 w-5 text-muted-foreground" />
          <div>
            <p class="text-sm font-medium">{{ selectedFile.name }}</p>
            <p class="text-xs text-muted-foreground">
              {{ formatFileSize(selectedFile.size) }}
            </p>
          </div>
        </div>
        <Button variant="default" size="sm" class="flex items-center gap-1.5" @click.stop="resetUploader">
          继续上传
        </Button>
      </div>
    </div>

    <!-- 上传历史和文件列表 -->
    <div v-if="uploadHistory.length > 0" class="mt-6 border rounded-lg p-4 bg-muted/5">
      <h3 class="text-base font-medium mb-4 flex items-center border-b pb-2">
        <FilmIcon class="h-5 w-5 mr-2 text-primary" />
        已上传视频
      </h3>
      <div class="space-y-3">
        <div v-for="(item, index) in uploadHistory" :key="index" class="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-muted/20 transition-colors">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <FilmIcon class="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate">{{ item.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ formatFileSize(item.size) }}
              </p>
            </div>
          </div>
          <a :href="item.url" target="_blank" class="ml-2 rounded-md px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center" @click.stop>
            查看
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from "vue";
import { formatFileSize } from "../utils";
import { uploadVideo } from "../api/videos";
import {
  pauseUpload as pauseUploadUtil,
  resumeUpload as resumeUploadUtil,
} from "../utils/chunkUpload";
import { useToastStore } from "../stores/toastStore";
import Button from "../components/ui/Button.vue";
import {
  CloudArrowUpIcon,
  FilmIcon,
  PauseIcon,
  PlayIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";

// 组件状态
const fileInput = ref(null);
const selectedFile = ref(null);
const isUploading = ref(false);
const isPaused = ref(false);
const uploadProgress = ref(0);
const uploadError = ref(null);
const uploadSuccess = ref(false);
const uploadHistory = ref([]);
const isDragging = ref(false);
const isProcessing = ref(false);

// 上传控制器
const abortController = ref(null);

// 通知
const toastStore = useToastStore();

// 上传状态文本
const uploadStatusText = computed(() => {
  if (isProcessing.value) {
    return "处理中...";
  }
  if (isPaused.value) {
    return "已暂停";
  }
  return `${uploadProgress.value}%`;
});

// 上传进度文本
const uploadProgressText = computed(() => {
  if (selectedFile.value) {
    const loaded = Math.floor(
      selectedFile.value.size * (uploadProgress.value / 100)
    );
    return `${formatFileSize(loaded)} / ${formatFileSize(selectedFile.value.size)}`;
  }
  return "";
});

// 触发文件选择对话框
const triggerFileSelect = () => {
  if (isUploading.value && !isPaused.value) return;
  fileInput.value.click();
};

// 文件选择回调
const onFileChange = (event) => {
  const files = event.target.files;
  if (files.length === 0) return;

  const file = files[0];
  if (!file.type.startsWith("video/")) {
    uploadError.value = "请选择视频文件";
    toastStore.error("请选择视频文件", {
      title: "文件类型错误",
      duration: 3000,
    });
    return;
  }

  selectedFile.value = file;
  uploadError.value = null;
  uploadSuccess.value = false;

  // 自动开始上传
  startUpload();
};

// 拖拽相关处理
const onDragOver = (event) => {
  event.dataTransfer.dropEffect = "copy";
  isDragging.value = true;
};

const onDragLeave = (event) => {
  isDragging.value = false;
};

const onDrop = (event) => {
  isDragging.value = false;

  const files = event.dataTransfer.files;
  if (files.length === 0) return;

  const file = files[0];
  if (!file.type.startsWith("video/")) {
    uploadError.value = "请选择视频文件";
    toastStore.error("请选择视频文件", {
      title: "文件类型错误",
      duration: 3000,
    });
    return;
  }

  selectedFile.value = file;
  uploadError.value = null;
  uploadSuccess.value = false;

  // 自动开始上传
  startUpload();
};

// 开始上传
const startUpload = async () => {
  if (!selectedFile.value) return;

  try {
    isUploading.value = true;
    isPaused.value = false;
    uploadProgress.value = 0;
    uploadError.value = null;
    isProcessing.value = false;

    // 显示开始上传的提示
    toastStore.info(`开始上传 ${selectedFile.value.name}`, {
      title: "上传开始",
      duration: 3000,
    });

    // 创建新的中断控制器
    abortController.value = new AbortController();

    await uploadVideo(selectedFile.value, {
      onProgress: (progressData) => {
        uploadProgress.value = progressData.percentage;

        // 显示上传里程碑提示
        if (progressData.percentage === 100 && !isPaused.value) {
          isProcessing.value = true;
          toastStore.info("视频上传完成，正在处理中...", {
            title: "处理中",
            duration: 3000,
          });
        }
      },
      onError: (error) => {
        uploadError.value = error.message || "上传失败";
        isUploading.value = false;
        isProcessing.value = false;
      },
      onSuccess: (data) => {
        isProcessing.value = false;
        uploadSuccess.value = true;
        isUploading.value = false;

        // 添加到上传历史
        uploadHistory.value.unshift({
          id: data.id,
          name: data.name,
          size: selectedFile.value.size,
          url: data.url,
          type: selectedFile.value.type,
        });

        // 显示成功通知
        toastStore.success("视频已成功上传", {
          title: "上传成功",
          duration: 3000,
        });
      },
      signal: abortController.value.signal,
    });
  } catch (error) {
    console.error("上传过程中发生错误:", error);
    uploadError.value = error.message || "上传失败";
    isUploading.value = false;
    isProcessing.value = false;

    // 显示错误通知
    toastStore.error(error.message || "视频上传失败", {
      title: "上传失败",
      duration: 5000,
    });
  }
};

// 暂停上传
const pauseUpload = () => {
  if (!isUploading.value) return;

  pauseUploadUtil(abortController.value);
  isPaused.value = true;

  toastStore.info("视频上传已暂停，可随时继续", {
    title: "上传暂停",
    duration: 3000,
  });
};

// 继续上传
const resumeUpload = async () => {
  if (!isPaused.value || !selectedFile.value) return;

  isPaused.value = false;
  abortController.value = new AbortController();

  toastStore.info("继续上传视频", { duration: 2000 });

  try {
    await resumeUploadUtil(selectedFile.value, {
      onProgress: (progressData) => {
        uploadProgress.value = progressData.percentage;

        // 处理上传进度
        if (progressData.percentage === 100) {
          isProcessing.value = true;
          toastStore.info("视频上传完成，正在处理中...", {
            title: "处理中",
            duration: 3000,
          });
        }
      },
      onError: (error) => {
        uploadError.value = error.message || "上传失败";
        isUploading.value = false;
        isProcessing.value = false;
      },
      onSuccess: (data) => {
        isProcessing.value = false;
        uploadSuccess.value = true;
        isUploading.value = false;

        // 添加到上传历史
        uploadHistory.value.unshift({
          id: data.id,
          name: data.name,
          size: selectedFile.value.size,
          url: data.url,
          type: selectedFile.value.type,
        });

        // 显示成功通知
        toastStore.success("视频已成功上传", {
          title: "上传成功",
          duration: 3000,
        });
      },
      signal: abortController.value.signal,
    });
  } catch (error) {
    console.error("继续上传过程中发生错误:", error);
    uploadError.value = error.message || "上传失败";
    isUploading.value = false;
    isProcessing.value = false;
  }
};

// 取消上传
const cancelUpload = () => {
  if (abortController.value) {
    abortController.value.abort();
  }

  isUploading.value = false;
  isPaused.value = false;
  uploadProgress.value = 0;
  selectedFile.value = null;
  uploadError.value = null;
  uploadSuccess.value = false;
  isProcessing.value = false;

  // 重置文件输入
  if (fileInput.value) {
    fileInput.value.value = "";
  }

  toastStore.info("已取消视频上传", { duration: 2000 });
};

// 重试上传
const retryUpload = () => {
  uploadError.value = null;
  startUpload();
};

// 重置上传器
const resetUploader = () => {
  isUploading.value = false;
  isPaused.value = false;
  uploadProgress.value = 0;
  selectedFile.value = null;
  uploadError.value = null;
  uploadSuccess.value = false;
  isProcessing.value = false;

  // 重置文件输入
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// 组件销毁前清理
onBeforeUnmount(() => {
  if (abortController.value) {
    abortController.value.abort();
  }
});
</script>

<style scoped>
.drag-upload-area {
  min-height: 220px;
  transition: all 0.2s ease;
}

@media (max-width: 640px) {
  .drag-upload-area {
    min-height: 180px;
  }
}
</style>
