<template>
  <div class="upload-container w-full max-w-none p-4 md:p-6">
    <div class="bg-background border rounded-lg shadow-sm p-4 md:p-6">
      <!-- 标题区域和移动端菜单按钮 -->
      <div class="flex items-center justify-between border-b pb-4 mb-6">
        <h5 class="text-lg font-bold flex items-center">
          <ArrowUpTrayIcon class="h-4 w-4 mr-2 text-primary" />
          上传媒体文件
        </h5>

        <!-- 移动端菜单按钮  -->
        <Button variant="ghost" size="icon" class="h-8 w-8 md:hidden" @click="toggleMobileMenu" title="菜单">
          <Bars3Icon class="h-4 w-4" />
        </Button>
      </div>

      <!-- 上传类型选择标签栏 -->
      <div class="flex border-b mb-6">
        <button class="px-4 py-2 font-medium text-sm border-b-2 transition-all" :class="
            activeTab === 'image'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          " @click="activeTab = 'image'">
          <PhotoIcon class="h-4 w-4 inline-block mr-1.5" />
          图片上传
        </button>
        <button class="px-4 py-2 font-medium text-sm border-b-2 transition-all" :class="
            activeTab === 'video'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          " @click="activeTab = 'video'">
          <VideoCameraIcon class="h-4 w-4 inline-block mr-1.5" />
          视频上传
        </button>
      </div>

      <!-- 图片上传区域 -->
      <div v-if="activeTab === 'image'">
        <!-- 拖拽上传区域 -->
        <div class="drag-upload-area border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-all" :class="[
            isDragging
              ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
              : 'border-muted-foreground/30 hover:border-primary/50 hover:shadow-sm',
            uploading ? 'pointer-events-none opacity-80' : 'cursor-pointer',
          ]" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="!uploading && $refs.fileInput.click()">
          <div class="flex flex-col items-center justify-center py-6">
            <div class="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <CloudArrowUpIcon v-if="!uploading" class="h-10 w-10 text-primary/70" />
              <ArrowPathIcon v-else class="h-10 w-10 text-primary animate-spin" />
            </div>

            <h3 class="text-lg font-medium mb-2">
              {{ uploading ? "上传中..." : "拖拽图片到此处或点击上传" }}
            </h3>
            <p class="text-sm text-muted-foreground max-w-md mx-auto">
              {{
                uploading
                  ? `${uploadProgress}%`
                  : "支持JPG、PNG、GIF、WebP等图片格式"
              }}
            </p>
          </div>

          <input ref="fileInput" type="file" multiple accept="image/*" class="hidden" @change="handleFileSelect" />
        </div>

        <!-- 上传设置 -->
        <div class="mb-6 p-5 border rounded-lg bg-muted/5">
          <h3 class="text-base font-medium mb-4 flex items-center">
            <AdjustmentsHorizontalIcon class="h-5 w-5 mr-2 text-primary" />
            上传设置
          </h3>

          <div class="flex flex-wrap items-center gap-8">
            <!-- 自动上传开关 -->
            <div class="flex items-center gap-3">
              <div class="flex items-center">
                <Switch v-model="autoUpload" @change="handleAutoUploadChange" :debounceTime="500">
                  <label for="autoUpload" class="text-sm font-medium cursor-pointer">自动上传</label>
                </Switch>
              </div>
              <div class="text-xs text-muted-foreground max-w-xs">
                <BoltIcon class="h-3.5 w-3.5 inline-block mr-0.5" :class="
                    autoUpload ? 'text-amber-500' : 'text-muted-foreground'
                  " />
                {{
                  autoUpload
                    ? "添加文件后自动开始上传"
                    : "添加文件后需手动点击上传"
                }}
              </div>
            </div>

            <!-- 最大上传数量 -->
            <div class="flex items-center gap-3">
              <label for="uploadLimit" class="flex items-center text-sm font-medium whitespace-nowrap">
                <DocumentDuplicateIcon class="h-4 w-4 mr-1.5 text-primary/80" />
                最大上传数量:
              </label>
              <Select v-model="uploadLimit" :options="uploadLimitOptions" class="w-36"></Select>
            </div>
          </div>

          <!-- 文件类型提示 -->
          <div class="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <InformationCircleIcon class="h-4 w-4 flex-shrink-0 text-blue-500" />
            <p>
              支持的图片格式: JPG, PNG, GIF, WebP, AVIF
              等。单个文件大小不超过50MB。
            </p>
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
            <UploadFilePreview v-for="(file, index) in selectedFiles" :key="index" :file="file" @remove="removeFile(index)" />
          </div>
        </div>

        <!-- 空状态或提示 -->
        <div v-else-if="!isDragging && !uploading" class="text-center py-12 border rounded-lg bg-muted/10">
          <PhotoIcon class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p class="text-muted-foreground font-medium">
            请选择图片文件或拖拽图片到上方区域
          </p>
        </div>
      </div>

      <!-- 视频上传区域 -->
      <div v-if="activeTab === 'video'" class="video-upload-container">
        <VideoUploader />

        <div class="mt-8 p-5 border rounded-lg bg-muted/5">
          <h3 class="text-base font-medium mb-4 flex items-center">
            <InformationCircleIcon class="h-5 w-5 mr-2 text-primary" />
            视频上传说明
          </h3>

          <div class="space-y-4 text-sm">
            <div>
              <h4 class="font-medium">支持的格式</h4>
              <p class="text-muted-foreground mt-1">
                支持常见视频格式，包括 MP4、WebM、MOV、AVI 等。
              </p>
            </div>
            <div>
              <h4 class="font-medium">文件大小</h4>
              <p class="text-muted-foreground mt-1">
                视频文件不限制大小，使用切片上传技术处理大型文件。
              </p>
            </div>
            <div>
              <h4 class="font-medium">断点续传</h4>
              <p class="text-muted-foreground mt-1">
                支持断点续传，上传过程中可以暂停和继续，刷新页面后也可以继续上传。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToastStore } from "../stores/toastStore";
import { useGalleryStore } from "../stores/galleryStore";
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
  InformationCircleIcon,
  Bars3Icon,
  VideoCameraIcon,
} from "@heroicons/vue/24/outline";
import Select from "../components/ui/Select.vue";
import Switch from "../components/ui/Switch.vue";
import Button from "../components/ui/Button.vue";
import UploadFilePreview from "../components/UploadFilePreview.vue";
import VideoUploader from "../components/VideoUploader.vue";
import { formatFileSize } from "../utils";

const toastStore = useToastStore();
const galleryStore = useGalleryStore();
const router = useRouter();
const route = useRoute();

// 切换标签
const activeTab = ref("image"); // 默认显示图片上传

// 从URL查询参数中获取初始标签
onMounted(() => {
  if (route.query.tab === "video") {
    activeTab.value = "video";
  }
});

// 当标签变化时更新URL
watch(activeTab, (newTab) => {
  router.replace({
    query: {
      ...route.query,
      tab: newTab,
    },
  });
});

// 上传状态
const isDragging = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const autoUpload = ref(true);
const uploadLimit = ref(20);
const selectedFiles = ref([]);
const fileInput = ref(null);
const hasIdleFiles = ref(false);
const uploadCompleteDialogShown = ref(false);

// 上传限制选项
const uploadLimitOptions = [
  { value: 5, label: "5个文件" },
  { value: 10, label: "10个文件" },
  { value: 20, label: "20个文件" },
  { value: 50, label: "50个文件" },
  { value: 999, label: "不限制" },
];

// 处理自动上传切换
const handleAutoUploadChange = () => {
  if (autoUpload.value) {
    toastStore.info("已开启自动上传模式");
    // 如果有待上传的文件，立即开始上传
    const idleFiles = selectedFiles.value.filter(
      (file) => file.status === "idle"
    );
    if (idleFiles.length > 0) {
      toastStore.info(`检测到 ${idleFiles.length} 个待上传文件，开始上传...`);
      uploadFiles();
    }
  } else {
    toastStore.info("已关闭自动上传模式，添加文件后需手动点击上传");
  }
};

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  addFiles(files);
  // 重置文件输入，确保可以再次选择相同的文件
  event.target.value = "";
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
  // 定义最大文件大小限制 (50MB)
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  // 过滤出图片文件
  const imageFiles = files.filter((file) => {
    return file.type.startsWith("image/");
  });

  // 检查文件类型
  if (imageFiles.length === 0) {
    toastStore.error("只能上传图片文件");
    return;
  }

  if (files.length !== imageFiles.length) {
    toastStore.warning(
      `已过滤掉 ${files.length - imageFiles.length} 个非图片的文件`
    );
  }

  // 检查文件大小
  const validSizeFiles = imageFiles.filter(
    (file) => file.size <= MAX_FILE_SIZE
  );
  if (validSizeFiles.length !== imageFiles.length) {
    toastStore.error(
      `已过滤掉 ${imageFiles.length - validSizeFiles.length} 个超过50MB的文件`
    );

    if (validSizeFiles.length === 0) {
      return; // 如果没有有效文件，直接返回
    }
  }

  const currentCount = selectedFiles.value.length;
  const availableSlots = uploadLimit.value - currentCount;

  if (availableSlots <= 0) {
    toastStore.error(`最多只能上传 ${uploadLimit.value} 个文件`);
    return;
  }

  const newFiles = validSizeFiles.slice(0, availableSlots).map((file) => {
    return {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
      status: "idle",
      progress: 0,
      error: null,
    };
  });

  selectedFiles.value.push(...newFiles);

  if (newFiles.length < validSizeFiles.length) {
    toastStore.warning(
      `已添加 ${newFiles.length} 个文件，由于超过限制，已忽略 ${validSizeFiles.length - newFiles.length} 个文件`
    );
  } else {
    toastStore.success(
      `已添加 ${newFiles.length} 个文件${autoUpload.value ? "，开始上传..." : ""}`
    );
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
  hasIdleFiles.value = selectedFiles.value.some(
    (file) => file.status === "idle"
  );
};

// 监听文件状态变化
watch(
  selectedFiles,
  () => {
    updateIdleFilesStatus();
  },
  { deep: true }
);

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
  selectedFiles.value.forEach((file) => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  });
  selectedFiles.value = [];
};

// 上传文件
const uploadFiles = async () => {
  const filesToUpload = selectedFiles.value.filter(
    (file) => file.status === "idle"
  );
  if (filesToUpload.length === 0) return;

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    // 单文件上传时，直接使用该文件的进度
    if (filesToUpload.length === 1) {
      const singleFile = filesToUpload[0];

      // 创建一个观察函数，直接使用文件的进度作为总进度
      watch(
        () => singleFile.progress,
        (newProgress) => {
          uploadProgress.value = newProgress;
        }
      );

      // 上传单个文件
      await uploadSingleFile(singleFile);
    } else {
      // 多文件上传时，计算加权进度
      // 计算所有文件的总大小，用于加权进度计算
      const totalSize = filesToUpload.reduce((sum, file) => sum + file.size, 0);

      // 设置进度更新函数
      const updateTotalProgress = () => {
        // 根据文件大小加权计算进度
        let totalWeightedProgress = 0;

        filesToUpload.forEach((file) => {
          // 文件大小占总大小的权重
          const fileWeight = file.size / totalSize;
          // 文件进度对总进度的贡献 = 文件大小权重 * 文件上传进度
          totalWeightedProgress += fileWeight * file.progress;
        });

        // 更新总体进度，确保值在0-100范围内
        uploadProgress.value = Math.floor(
          Math.min(100, Math.max(0, totalWeightedProgress))
        );
      };

      // 创建一个观察函数，监视所有文件的进度变化
      const stopWatcher = watch(
        filesToUpload,
        () => {
          updateTotalProgress();
        },
        { deep: true }
      );

      // 是否使用批量上传
      const useBatchUpload = filesToUpload.length > 1;

      if (useBatchUpload) {
        // 批量上传
        await batchUploadFiles(filesToUpload);
      } else {
        // 多个文件但一个个上传
        await Promise.all(
          filesToUpload.map(async (file) => {
            await uploadSingleFile(file);
          })
        );
      }

      // 停止观察
      stopWatcher();
    }

    // 最终进度确保为100%
    uploadProgress.value = 100;

    // 计算成功和失败的数量
    const successCount = selectedFiles.value.filter(
      (f) => f.status === "success"
    ).length;
    const errorCount = selectedFiles.value.filter(
      (f) => f.status === "error"
    ).length;

    if (successCount > 0) {
      toastStore.success(
        `成功上传 ${successCount} 个文件${errorCount > 0 ? `，${errorCount} 个文件失败` : ""}`
      );

      // 上传成功后询问用户是否要查看图库
      if (!uploadCompleteDialogShown.value) {
        uploadCompleteDialogShown.value = true;

        setTimeout(() => {
          toastStore
            .confirm("上传完成，是否查看图库？", {
              title: "上传成功",
              confirmText: "前往图库",
              cancelText: "继续上传",
              duration: 5000, // 设置5秒后自动关闭
            })
            .then((confirmed) => {
              if (confirmed) {
                // 导航到图库页面
                router.push({ name: "gallery" });
              }
              // 重置标志，允许下次上传后再次显示
              uploadCompleteDialogShown.value = false;
            });
        }, 500);
      }
    } else if (errorCount > 0) {
      toastStore.error(`所有文件上传失败`);
    }
  } catch (error) {
    console.error("上传过程中出错:", error);
    toastStore.error("上传过程中出错: " + error.message);
  } finally {
    uploading.value = false;
  }
};

// 单个文件上传
const uploadSingleFile = async (file) => {
  // 再次验证文件类型和大小
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  if (
    !(
      file.file.type.startsWith("image/") || file.file.type.startsWith("video/")
    )
  ) {
    file.status = "error";
    file.error = "文件格式不支持，仅支持图片或视频";
    return;
  }

  if (file.file.size > MAX_FILE_SIZE) {
    file.status = "error";
    file.error = "文件大小超过50MB限制";
    return;
  }

  file.status = "uploading";
  file.progress = 0;

  try {
    // 创建FormData对象
    const formData = new FormData();
    formData.append("file", file.file);
    formData.append("name", file.name);

    // 使用axios上传并跟踪进度
    const { uploadImage } = await import("../api/images");

    // 上传前保存上传开始时间 - 用于确保最小显示时间
    const uploadStartTime = Date.now();

    // 创建上传请求
    const response = await uploadImage(formData, {
      onUploadProgress: (progressEvent) => {
        // 计算上传进度百分比
        let percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        // 上传结束前，最高显示到98%，表示还有服务器处理时间
        if (percentCompleted >= 98) {
          percentCompleted = 98;
        }

        // 使用Vue的响应式API确保视图更新
        // 直接更新file对象的progress属性
        file.progress = percentCompleted;

        // 触发一个微小的更改，确保Vue检测到变化
        if (
          file === selectedFiles.value[0] &&
          selectedFiles.value.length === 1
        ) {
          uploadProgress.value = percentCompleted;
        }
      },
    });

    // 计算上传已经花费的时间
    const elapsedTime = Date.now() - uploadStartTime;
    const minimumProcessingTime = 500; // 最小处理时间，让用户感知到处理过程

    // 如果上传太快，添加一个短暂的延迟，让用户感知到处理过程
    if (elapsedTime < minimumProcessingTime) {
      // 先将进度设为99%，表示正在最后处理
      file.progress = 99;
      await new Promise((resolve) =>
        setTimeout(resolve, minimumProcessingTime - elapsedTime)
      );
    }

    if (response.code === 200) {
      // 上传成功
      file.status = "success";
      file.progress = 100;

      // 添加到图库
      galleryStore.addImage(response.data);
    } else {
      // 上传失败
      file.status = "error";
      file.error = response.message || "上传失败";
    }
  } catch (error) {
    file.status = "error";
    file.error = error.message || "上传失败";
    console.error("文件上传失败:", error);
  }
};

// 批量上传文件
const batchUploadFiles = async (files) => {
  // 再次验证所有文件
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  const validFiles = [];
  const invalidFiles = [];

  files.forEach((file) => {
    if (
      !(
        file.file.type.startsWith("image/") ||
        file.file.type.startsWith("video/")
      )
    ) {
      file.status = "error";
      file.error = "文件格式不支持，仅支持图片或视频";
      invalidFiles.push(file);
    } else if (file.file.size > MAX_FILE_SIZE) {
      file.status = "error";
      file.error = "文件大小超过50MB限制";
      invalidFiles.push(file);
    } else {
      validFiles.push(file);
    }
  });

  // 如果没有有效文件，直接返回
  if (validFiles.length === 0) {
    toastStore.error("没有符合要求的文件可上传");
    return;
  }

  // 如果有无效文件，显示提示
  if (invalidFiles.length > 0) {
    toastStore.warning(`已排除 ${invalidFiles.length} 个不符合要求的文件`);
  }

  try {
    // 创建FormData对象
    const formData = new FormData();

    // 只添加有效文件
    validFiles.forEach((file, index) => {
      formData.append("files", file.file);
      formData.append("names[]", file.name);
    });

    // 设置所有有效文件为上传中状态
    validFiles.forEach((file) => {
      file.status = "uploading";
      file.progress = 0;
    });

    // 导入批量上传方法
    const { batchUploadImages } = await import("../api/images");

    // 设置上传数量限制
    const params = { count: validFiles.length };

    // 上传开始时间
    const uploadStartTime = Date.now();

    // 执行批量上传
    const response = await batchUploadImages(formData, params, {
      onUploadProgress: (progressEvent) => {
        // 由于批量上传无法区分各个文件的进度，只能平均分配进度
        let percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        // 限制进度最高到98%，留出服务器处理时间
        if (percentCompleted >= 98) {
          percentCompleted = 98;
        }

        // 将总体进度平均分配给每个文件，使用Vue的响应式系统
        validFiles.forEach((file, index) => {
          // 使用setTimeout错开更新时间，避免Vue一次性处理过多更新
          setTimeout(() => {
            file.progress = percentCompleted;
          }, index * 5); // 轻微错开更新时间
        });
      },
    });

    // 计算上传已经花费的时间
    const elapsedTime = Date.now() - uploadStartTime;
    const minimumProcessingTime = 800; // 批量上传最小处理时间

    // 如果上传太快，添加一个短暂的延迟
    if (elapsedTime < minimumProcessingTime) {
      // 先将进度设为99%，表示正在最后处理
      validFiles.forEach((file, index) => {
        setTimeout(() => {
          file.progress = 99;
        }, index * 5);
      });
      await new Promise((resolve) =>
        setTimeout(resolve, minimumProcessingTime - elapsedTime)
      );
    }

    if (response.code === 200) {
      // 处理批量上传结果
      const { successful, failed } = response.data;

      // 更新成功上传的文件状态
      successful.items.forEach((item) => {
        const fileIndex = validFiles.findIndex((f) => f.name === item.name);
        if (fileIndex !== -1) {
          validFiles[fileIndex].status = "success";
          validFiles[fileIndex].progress = 100;

          // 添加到图库
          galleryStore.addImage(item);
        }
      });

      // 更新失败的文件状态
      failed.items.forEach((item) => {
        const fileIndex = validFiles.findIndex(
          (f) => f.name === item.originalName
        );
        if (fileIndex !== -1) {
          validFiles[fileIndex].status = "error";
          validFiles[fileIndex].error = item.message || "上传失败";
          validFiles[fileIndex].progress = 0;
        }
      });
    } else {
      // 整个批量请求失败
      validFiles.forEach((file) => {
        file.status = "error";
        file.error = response.message || "批量上传失败";
      });
    }
  } catch (error) {
    // 处理异常
    validFiles.forEach((file) => {
      file.status = "error";
      file.error = error.message || "批量上传请求失败";
    });
    console.error("批量上传失败:", error);
  }
};

// 移动端菜单控制
const toggleMobileMenu = () => {
  // 触发App组件中的toggleMobileMenu方法
  document.dispatchEvent(new CustomEvent("toggle-mobile-menu"));
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
