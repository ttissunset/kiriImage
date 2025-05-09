<template>
  <div class="image-preview-container h-full flex flex-col relative">
    <!-- 顶部工具栏 -->
    <div class="flex items-center justify-between p-3 border-b">
      <!-- 左侧返回按钮和全屏按钮 -->
      <div class="flex items-center space-x-3">
        <button @click="goBack" class="flex items-center text-muted-foreground hover:text-foreground">
          <ChevronLeftIcon class="w-5 h-5 mr-1" />
        </button>
        <button @click="toggleFullscreen" class="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowsPointingOutIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 中间日期时间 -->
      <div class="text-sm text-muted-foreground">
        {{ formattedDateTime }}
        <div class="text-xs text-center">
          {{ currentIndex + 1 }} / {{ totalImages }}
        </div>
      </div>

      <!-- 右侧工具按钮 -->
      <div class="flex space-x-4">
        <button title="信息" class="text-muted-foreground hover:text-foreground">
          <InformationCircleIcon class="w-5 h-5" />
        </button>
        <button title="收藏" class="text-muted-foreground hover:text-foreground" :class="{ 'text-primary': isFavorite }" @click="toggleFavorite">
          <HeartIcon class="w-5 h-5" />
        </button>
        <button title="下载" class="text-muted-foreground hover:text-foreground" @click="downloadImage">
          <ArrowDownTrayIcon class="w-5 h-5" />
        </button>
        <button title="分享" class="text-muted-foreground hover:text-foreground">
          <ShareIcon class="w-5 h-5" />
        </button>
        <button title="删除" class="text-muted-foreground hover:text-destructive" @click="deleteImage">
          <TrashIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- 中间图片预览区 - 固定高度 -->
    <div class="flex-1 flex items-center justify-center bg-muted/20" style="height: calc(100vh - 140px)">
      <!-- 上一张/下一张按钮 -->
      <button v-if="currentIndex > 0" @click.stop="prevImage" class="absolute left-4 bg-background/80 rounded-full p-2 text-muted-foreground hover:text-foreground">
        <ChevronLeftIcon class="w-6 h-6" />
      </button>

      <img ref="imageRef" :src="currentImage.url" :alt="currentImage.name" class="h-full object-contain" @click.stop />

      <button v-if="currentIndex < totalImages - 1" @click.stop="nextImage" class="absolute right-4 bg-background/80 rounded-full p-2 text-muted-foreground hover:text-foreground">
        <ChevronRightIcon class="w-6 h-6" />
      </button>
    </div>

    <!-- 底部缩略图列表 - 固定在底部 -->
    <div class="h-24 border-t absolute bottom-0 left-0 right-0 bg-background">
      <div ref="thumbnailsContainer" class="flex p-2 space-x-2 overflow-x-auto thumbnail-scroll" @wheel="handleMouseWheel">
        <div v-for="(image, index) in images" :key="image.id" :ref="
            (el) => {
              if (index === currentIndex) currentThumbnailRef = el;
            }
          " @click="selectImage(index)" class="h-20 w-20 shrink-0 cursor-pointer overflow-hidden transition-all" :class="{ 'ring-2 ring-primary': index === currentIndex }">
          <img :src="image.thumbnailUrl" :alt="image.name" class="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useGalleryStore } from "../stores/galleryStore";
import { useToastStore } from "../stores/toastStore";
// 引入 Heroicons
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsPointingOutIcon,
  InformationCircleIcon,
  HeartIcon,
  ShareIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();
const route = useRoute();
const galleryStore = useGalleryStore();
const toastStore = useToastStore();

// 获取所有图片和当前图片索引
const images = computed(() => galleryStore.images);
const totalImages = computed(() => images.value.length);
const currentIndex = ref(parseInt(route.params.id) || 0);

// 缩略图滚动相关的 refs
const thumbnailsContainer = ref(null);
const currentThumbnailRef = ref(null);
const imageRef = ref(null); // 添加图片元素引用

// 全屏状态
const isFullscreen = ref(false);

// 当前图片
const currentImage = computed(() => {
  if (images.value.length > 0 && currentIndex.value < images.value.length) {
    return images.value[currentIndex.value];
  }
  return { name: "", url: "", date: new Date() };
});

// 是否已收藏
const isFavorite = computed(() => {
  if (currentImage.value && currentImage.value.id) {
    return galleryStore.isFavorite(currentImage.value.id);
  }
  return false;
});

// 切换收藏状态
const toggleFavorite = () => {
  if (currentImage.value && currentImage.value.id) {
    const isFavorite = galleryStore.isFavorite(currentImage.value.id);
    galleryStore.toggleFavorite(currentImage.value.id);

    // 添加提示消息
    if (isFavorite) {
      toastStore.info(`已将 "${currentImage.value.name}" 移出收藏~~`);
    } else {
      toastStore.success(`已将 "${currentImage.value.name}" 加入收藏~~`);
    }
  }
};

// 格式化日期时间
const formattedDateTime = computed(() => {
  const now = new Date();
  return now.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    if (imageRef.value) {
      imageRef.value.requestFullscreen().then(() => {
        isFullscreen.value = true;
      }).catch(err => {
        console.error(`全屏错误: ${err.message}`);
      });
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        isFullscreen.value = false;
      }).catch(err => {
        console.error(`退出全屏错误: ${err.message}`);
      });
    }
  }
};

// 监听全屏变化事件
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
  });
});

// 导航方法
const goBack = () => {
  router.push({ name: "gallery" });
};

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    updateRoute();
  }
};

const nextImage = () => {
  if (currentIndex.value < totalImages.value - 1) {
    currentIndex.value++;
    updateRoute();
  }
};

const selectImage = (index) => {
  currentIndex.value = index;
  updateRoute();
};

const updateRoute = () => {
  router.replace({
    name: "preview",
    params: { id: currentIndex.value },
  });
};

// 鼠标滚轮事件处理 - 实现水平滚动
const handleMouseWheel = (e) => {
  if (thumbnailsContainer.value) {
    e.preventDefault();
    const container = thumbnailsContainer.value;
    // 使用deltaY实现水平滚动，可以调整滚动速度
    container.scrollLeft += e.deltaY * 0.5;
  }
};

// 删除图片
const deleteImage = async () => {
  const confirmed = await toastStore.confirm("确定要删除这张图片吗？", {
    title: "删除确认",
    type: "warning"
  });

  if (confirmed) {
    galleryStore.deleteImage(currentImage.value.id);

    if (images.value.length === 0) {
      // 如果没有图片了，返回相册
      goBack();
    } else if (currentIndex.value >= images.value.length) {
      // 如果当前索引超出范围，显示最后一张
      currentIndex.value = images.value.length - 1;
      updateRoute();
    }

    toastStore.success("图片已删除");
  }
};

// 滚动当前缩略图到中间位置
const scrollToCurrentThumbnail = () => {
  nextTick(() => {
    if (currentThumbnailRef.value && thumbnailsContainer.value) {
      const container = thumbnailsContainer.value;
      const thumbnail = currentThumbnailRef.value;

      // 计算滚动位置，使当前缩略图居中
      const containerWidth = container.offsetWidth;
      const thumbnailWidth = thumbnail.offsetWidth;
      const scrollLeft =
        thumbnail.offsetLeft - containerWidth / 2 + thumbnailWidth / 2;

      // 确保不会滚动到负值（第一张图片不会在左侧溢出）
      const finalScrollLeft = Math.max(0, scrollLeft);

      // 使用平滑滚动效果
      container.scrollTo({
        left: finalScrollLeft,
        behavior: "smooth",
      });
    }
  });
};

// 监视当前索引变化，自动滚动到当前缩略图
watch(currentIndex, () => {
  scrollToCurrentThumbnail();
});

// 加载图片
onMounted(() => {
  if (galleryStore.images.length === 0) {
    galleryStore.fetchImages();
  }

  // 初始加载时滚动到当前缩略图
  scrollToCurrentThumbnail();
});

// 下载图片
const downloadImage = async () => {
  if (currentImage.value && currentImage.value.url) {
    try {
      // 显示下载开始提示
      const loadingToastId = toastStore.info(`正在准备下载 "${currentImage.value.name}"...`, { duration: 0 });

      // 使用fetch获取图片内容，转换为blob
      const response = await fetch(currentImage.value.url);
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }

      // 获取blob格式的图片数据
      const blob = await response.blob();

      // 尝试从Content-Type中获取正确的扩展名
      let fileExtension = '.jpg'; // 默认扩展名
      const contentType = response.headers.get('content-type');
      if (contentType) {
        const mimeType = contentType.split(';')[0].trim();
        switch (mimeType) {
          case 'image/jpeg':
            fileExtension = '.jpg';
            break;
          case 'image/png':
            fileExtension = '.png';
            break;
          case 'image/gif':
            fileExtension = '.gif';
            break;
          case 'image/webp':
            fileExtension = '.webp';
            break;
          case 'image/svg+xml':
            fileExtension = '.svg';
            break;
          case 'image/avif':
            fileExtension = '.avif';
            break;
          case 'image/bmp':
            fileExtension = '.bmp';
            break;
          // 其他类型可以继续添加
        }
      }

      // 设置文件名，使用原图片名称或使用默认名称
      let filename = currentImage.value.name || `kiri-image-${Date.now()}`;

      // 确保文件名有扩展名
      if (!filename.includes('.')) {
        // 从URL尝试获取扩展名
        const urlExtension = currentImage.value.url.split('.').pop().split(/[?#]/)[0];
        if (urlExtension && urlExtension.length <= 4 && /^[a-zA-Z0-9]+$/.test(urlExtension)) {
          fileExtension = `.${urlExtension.toLowerCase()}`;
        }
        filename += fileExtension;
      }

      // 创建Blob URL
      const blobUrl = URL.createObjectURL(blob);

      // 创建一个隐形的a标签用于下载
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);

      // 关闭加载提示
      toastStore.removeToast(loadingToastId);

      // 执行下载并清理
      a.click();
      document.body.removeChild(a);

      // 延迟释放Blob URL，确保下载已开始
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);

      // 显示下载成功提示
      toastStore.success(`图片 "${filename}" 开始下载`);
    } catch (error) {
      console.error('下载图片失败', error);
      toastStore.error(`下载图片失败: ${error.message}`);
    }
  } else {
    toastStore.error('无法下载图片，图片地址无效');
  }
};
</script>

<style scoped>
.image-preview-container {
  height: 100vh;
  width: 100%;
  padding-bottom: 6rem; /* 为底部固定的缩略图列表留出空间 */
}

/* 禁用缩略图容器的默认滚动行为，这样鼠标滚轮事件可以被我们的处理函数捕获 */
.thumbnail-scroll {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-color: transparent transparent;
}

.thumbnail-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none; /* Chrome, Safari, Opera */
}

.thumbnail-scroll::-webkit-scrollbar-thumb {
  background: transparent;
}

.thumbnail-scroll::-webkit-scrollbar-track {
  background: transparent;
}

/* 全屏状态下的图片样式 */
img:-webkit-full-screen {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

img:-moz-full-screen {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

img:fullscreen {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
