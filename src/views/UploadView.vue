<template>
  <div class="upload-container w-full max-w-none p-4 md:p-6">
    <div class="bg-background border rounded-lg shadow-sm p-4 md:p-6">
      <h1 class="text-2xl font-bold mb-6 flex items-center border-b pb-4">
        <ArrowUpTrayIcon class="h-6 w-6 mr-2 text-primary" />
        上传文件
      </h1>

      <!-- 拖拽上传区域 -->
      <div class="drag-upload-area border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-all" :class="[
          isDragging ? 'border-primary bg-primary/5 shadow-md scale-[1.01]' : 'border-muted-foreground/30 hover:border-primary/50 hover:shadow-sm',
          uploading ? 'pointer-events-none opacity-80' : 'cursor-pointer'
        ]" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="!uploading && $refs.fileInput.click()">
        <div class="flex flex-col items-center justify-center py-6">
          <div class="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <CloudArrowUpIcon v-if="!uploading" class="h-10 w-10 text-primary/70" />
            <ArrowPathIcon v-else class="h-10 w-10 text-primary animate-spin" />
          </div>

          <h3 class="text-lg font-medium mb-2">
            {{ uploading ? '上传中...' : '拖拽文件到此处或点击上传' }}
          </h3>
          <p class="text-sm text-muted-foreground max-w-md mx-auto">
            {{ uploading ? `${uploadProgress}%` : '支持JPG、PNG、GIF、WebP等图片格式及MP4、WebM等视频格式' }}
          </p>
        </div>

        <input ref="fileInput" type="file" multiple accept="image/*,video/*" class="hidden" @change="handleFileSelect" />
      </div>

      <!-- 上传设置 -->
      <div class="mb-6 p-5 border rounded-lg bg-muted/5">
        <h3 class="text-base font-medium mb-4 flex items-center">
          <AdjustmentsHorizontalIcon class="h-5 w-5 mr-2 text-primary" />
          上传设置
        </h3>

        <div class="flex flex-wrap  items-center gap-8">
          <!-- 自动上传开关 -->
          <div class="flex items-center gap-3">
            <div class="flex items-center">
              <Switch v-model="autoUpload" @change="handleAutoUploadChange" :debounceTime="500">
                <label for="autoUpload" class="text-sm font-medium cursor-pointer">自动上传</label>
              </Switch>
            </div>
            <div class="text-xs text-muted-foreground max-w-xs">
              <BoltIcon class="h-3.5 w-3.5 inline-block mr-0.5" :class="autoUpload ? 'text-amber-500' : 'text-muted-foreground'" />
              {{ autoUpload ? '添加文件后自动开始上传' : '添加文件后需手动点击上传' }}
            </div>
          </div>

          <!-- 最大上传数量 -->
          <div class="flex items-center gap-3">
            <label for="uploadLimit" class="flex items-center text-sm font-medium">
              <DocumentDuplicateIcon class="h-4 w-4 mr-1.5 text-primary/80" />
              最大上传数量:
            </label>
            <Select v-model="uploadLimit" :options="uploadLimitOptions" class="w-36"></Select>
          </div>
        </div>

        <!-- 文件类型提示 -->
        <div class="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <InformationCircleIcon class="h-4 w-4 flex-shrink-0 text-blue-500" />
          <p>支持的图片格式: JPG, PNG, GIF, WebP, AVIF 等；视频格式: MP4, WebM, MOV 等。单个文件大小不超过50MB。</p>
        </div>
      </div>

      <!-- 预览和上传列表 -->
      <div v-if="selectedFiles.length > 0" class="mb-6">
        <div class="flex justify-between items-center mb-4 p-3 border-b">
          <h2 class="text-lg font-semibold flex items-center">
            <DocumentIcon class="h-5 w-5 mr-2 text-primary" />
            已选择 {{ selectedFiles.length }} 个文件
          </h2>
          <div class="flex gap-2">
            <button v-if="!autoUpload && canUpload" @click="uploadFiles" class="flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all" :disabled="uploading">
              <ArrowUpTrayIcon class="h-4 w-4" />
              上传所有
            </button>
            <button @click="clearFiles" class="flex items-center gap-1 px-4 py-2 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 shadow-sm transition-all" :disabled="uploading">
              <XMarkIcon class="h-4 w-4" />
              清空
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div v-for="(file, index) in selectedFiles" :key="index" class="relative group border rounded-lg overflow-hidden bg-background shadow-sm transition-all hover:shadow-md hover:border-primary/30">
            <!-- 预览缩略图 -->
            <div class="aspect-square bg-muted/50 overflow-hidden flex items-center justify-center border-b">
              <img v-if="file.type.startsWith('image/')" :src="file.preview" class="w-full h-full object-cover" />
              <video v-else-if="file.type.startsWith('video/')" :src="file.preview" class="w-full h-full object-cover"></video>
              <DocumentIcon v-else class="h-12 w-12 text-muted-foreground" />
            </div>

            <!-- 文件信息 -->
            <div class="p-3">
              <div class="text-sm font-medium truncate mb-1" :title="file.name">{{ file.name }}</div>
              <div class="text-xs text-muted-foreground">{{ formatFileSize(file.size) }}</div>

              <!-- 状态或进度条 -->
              <div v-if="file.status !== 'idle'" class="mt-2">
                <div v-if="file.status === 'uploading'" class="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div class="bg-primary h-1.5 rounded-full transition-all" :style="{ width: `${file.progress}%` }"></div>
                </div>
                <div v-else-if="file.status === 'success'" class="text-xs text-green-500 flex items-center gap-1 mt-1">
                  <CheckCircleIcon class="h-4 w-4" />
                  上传成功
                </div>
                <div v-else-if="file.status === 'error'" class="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <ExclamationCircleIcon class="h-4 w-4" />
                  {{ file.error || '上传失败' }}
                </div>
              </div>
            </div>

            <!-- 删除按钮 -->
            <button @click="removeFile(index)" class="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 shadow flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all" :disabled="uploading">
              <XMarkIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态或提示 -->
      <div v-else-if="!isDragging && !uploading" class="text-center py-12 border rounded-lg bg-muted/10">
        <PhotoIcon class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p class="text-muted-foreground font-medium">请选择文件或拖拽文件到上方区域</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue';
import { useToastStore } from '../stores/toastStore';
import { useGalleryStore } from '../stores/galleryStore';
import {
  CloudArrowUpIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PhotoIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline';
import Select from '../components/ui/Select.vue';
import Switch from '../components/ui/Switch.vue';
import { formatFileSize } from '../utils';

const toastStore = useToastStore();
const galleryStore = useGalleryStore();

// 上传状态
const isDragging = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const autoUpload = ref(true);
const uploadLimit = ref(20);
const selectedFiles = ref([]);
const fileInput = ref(null);
const hasIdleFiles = ref(false);

// 上传限制选项
const uploadLimitOptions = [
  { value: 5, label: '5个文件' },
  { value: 10, label: '10个文件' },
  { value: 20, label: '20个文件' },
  { value: 50, label: '50个文件' },
  { value: 999, label: '不限制' }
];

// 处理自动上传切换
const handleAutoUploadChange = () => {
  if (autoUpload.value) {
    toastStore.info('已开启自动上传模式');
    // 如果有待上传的文件，立即开始上传
    const idleFiles = selectedFiles.value.filter(file => file.status === 'idle');
    if (idleFiles.length > 0) {
      toastStore.info(`检测到 ${idleFiles.length} 个待上传文件，开始上传...`);
      uploadFiles();
    }
  } else {
    toastStore.info('已关闭自动上传模式，添加文件后需手动点击上传');
  }
};

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  addFiles(files);
  // 重置文件输入，确保可以再次选择相同的文件
  event.target.value = '';
};

// 处理拖放
const handleDrop = (event) => {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer.files);
  if (files.length === 0) return;

  addFiles(files);
};

// 添加文件到列表
const addFiles = (files) => {
  // 过滤出图片和视频文件
  const mediaFiles = files.filter(file => {
    return file.type.startsWith('image/') || file.type.startsWith('video/');
  });

  if (mediaFiles.length === 0) {
    toastStore.error('只能上传图片或视频文件');
    return;
  }

  if (files.length !== mediaFiles.length) {
    toastStore.warning(`已过滤掉 ${files.length - mediaFiles.length} 个非图片或视频的文件`);
  }

  const currentCount = selectedFiles.value.length;
  const availableSlots = uploadLimit.value - currentCount;

  if (availableSlots <= 0) {
    toastStore.error(`最多只能上传 ${uploadLimit.value} 个文件`);
    return;
  }

  const newFiles = mediaFiles.slice(0, availableSlots).map(file => {
    return {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
      status: 'idle',
      progress: 0,
      error: null
    };
  });

  selectedFiles.value.push(...newFiles);

  if (newFiles.length < mediaFiles.length) {
    toastStore.warning(`已添加 ${newFiles.length} 个文件，由于超过限制，已忽略 ${mediaFiles.length - newFiles.length} 个文件`);
  } else {
    toastStore.success(`已添加 ${newFiles.length} 个文件${autoUpload.value ? '，开始上传...' : ''}`);
  }

  // 自动上传
  if (autoUpload.value && newFiles.length > 0) {
    uploadFiles();
  } else {
    // 更新待上传文件状态
    updateIdleFilesStatus();
  }
};

// 更新待上传文件状态
const updateIdleFilesStatus = () => {
  hasIdleFiles.value = selectedFiles.value.some(file => file.status === 'idle');
};

// 监听文件状态变化
watch(selectedFiles, () => {
  updateIdleFilesStatus();
}, { deep: true });

// 计算是否可以上传
const canUpload = computed(() => {
  return hasIdleFiles.value && !uploading.value;
});

// 移除文件
const removeFile = (index) => {
  const file = selectedFiles.value[index];
  if (file.preview) {
    URL.revokeObjectURL(file.preview);
  }
  selectedFiles.value.splice(index, 1);
};

// 清空所有文件
const clearFiles = () => {
  // 清理所有预览URL
  selectedFiles.value.forEach(file => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  });
  selectedFiles.value = [];
};

// 上传文件
const uploadFiles = async () => {
  const filesToUpload = selectedFiles.value.filter(file => file.status === 'idle');
  if (filesToUpload.length === 0) return;

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    // 模拟总体上传进度
    const progressInterval = setInterval(() => {
      const totalProgress = selectedFiles.value.reduce((sum, file) => sum + file.progress, 0);
      uploadProgress.value = Math.floor(totalProgress / selectedFiles.value.length);

      if (uploadProgress.value >= 100) {
        clearInterval(progressInterval);
      }
    }, 200);

    // 模拟并行上传文件
    await Promise.all(
      filesToUpload.map(async (file, index) => {
        file.status = 'uploading';

        try {
          // 模拟文件上传过程
          await simulateFileUpload(file);

          // 模拟服务器返回的图片/视频信息
          const uploadedMedia = {
            id: `uploaded-${Date.now()}-${index}`,
            name: file.name,
            url: file.preview, // 实际环境中应该是服务器返回的URL
            thumbnailUrl: file.preview,
            date: new Date().toISOString(),
            type: file.type.startsWith('video/') ? 'video' : 'image',
            favorite: false
          };

          // 将上传的媒体添加到相册
          galleryStore.addImage(uploadedMedia);

          file.status = 'success';
        } catch (error) {
          file.status = 'error';
          file.error = error.message;
          console.error('上传失败:', error);
        }
      })
    );

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    // 计算成功和失败的数量
    const successCount = selectedFiles.value.filter(f => f.status === 'success').length;
    const errorCount = selectedFiles.value.filter(f => f.status === 'error').length;

    if (successCount > 0) {
      toastStore.success(`成功上传 ${successCount} 个文件${errorCount > 0 ? `，${errorCount} 个文件失败` : ''}`);
    } else if (errorCount > 0) {
      toastStore.error(`所有文件上传失败`);
    }
  } catch (error) {
    console.error('上传过程中出错:', error);
    toastStore.error('上传过程中出错');
  } finally {
    uploading.value = false;
  }
};

// 模拟单个文件上传
const simulateFileUpload = (file) => {
  return new Promise((resolve, reject) => {
    const duration = 1000 + Math.random() * 2000; // 1-3秒的随机上传时间
    const interval = 100;
    const steps = duration / interval;
    let progress = 0;

    const updateProgress = setInterval(() => {
      progress += 100 / steps;
      if (progress >= 100) {
        progress = 100;
        clearInterval(updateProgress);

        // 模拟5%的概率上传失败
        if (Math.random() < 0.05) {
          reject(new Error('网络错误'));
        } else {
          resolve();
        }
      }
      file.progress = Math.floor(progress);
    }, interval);
  });
};

// 组件销毁前清理所有预览URL
onBeforeUnmount(() => {
  clearFiles();
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

.upload-container {
  min-height: calc(100vh - 4rem);
}
</style>