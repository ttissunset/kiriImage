<template>
  <div class="image-preview-container h-full flex flex-col relative">
    <!-- 顶部工具栏 -->
    <div class="flex items-center border-b p-3 relative">
      <!-- 左侧返回按钮和全屏按钮 -->
      <div class="flex items-center space-x-3 z-10">
        <button @click="goBack" class="flex items-center text-muted-foreground hover:text-foreground p-1">
          <ChevronLeftIcon class="w-5 h-5 sm:w-5 sm:h-5" />
        </button>
        <button @click="toggleFullscreen" class="hidden sm:flex items-center text-muted-foreground hover:text-foreground">
          <ArrowsPointingOutIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 中间日期时间 - 使用绝对定位实现真正居中 -->
      <div class="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none">
        <div class="text-sm text-muted-foreground text-center">
          <div class="hidden sm:block">{{ formattedDateTime }}</div>
          <div class="text-xs">
            {{ currentIndex + 1 }} / {{ totalImages }}
          </div>
        </div>
      </div>

      <!-- 右侧工具按钮 -->
      <div class="flex space-x-1 sm:space-x-4 ml-auto z-10">
        <button title="信息" class="hidden sm:block text-muted-foreground hover:text-foreground">
          <InformationCircleIcon class="w-5 h-5" />
        </button>
        <button title="收藏" class="text-muted-foreground hover:text-foreground p-1 pointer-events-auto" :class="{ 'text-primary': isFavorite }" @click="toggleFavorite">
          <HeartIcon class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button title="下载" class="text-muted-foreground hover:text-foreground p-1 pointer-events-auto" @click="downloadImage">
          <ArrowDownTrayIcon class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button title="分享" class="hidden sm:block text-muted-foreground hover:text-foreground">
          <ShareIcon class="w-5 h-5" />
        </button>
        <button title="删除" class="text-muted-foreground hover:text-destructive p-1 pointer-events-auto" @click="deleteImage">
          <TrashIcon class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>

    <!-- 中间图片预览区 -->
    <div class="flex-1 flex items-center justify-center bg-muted/20 overflow-hidden relative" :style="{
        height: 'calc(100vh - ' + (isMobile ? '120px' : '140px') + ')',
      }">
      <!-- 上一张/下一张按钮 -->
      <button v-if="currentIndex > 0" @click.stop="prevImage" class="absolute left-4 bg-background/80 rounded-full p-2 text-muted-foreground hover:text-foreground sm:opacity-50 sm:hover:opacity-100 z-10">
        <ChevronLeftIcon class="w-6 h-6" />
      </button>

      <!-- 添加触摸滑动支持 -->
      <div ref="swipeContainer" class="w-full h-full flex items-center justify-center overflow-hidden" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <!-- 加载指示器 -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center gap-2">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          <p class="text-muted-foreground text-sm">加载中...</p>
        </div>

        <!-- 图片预览 -->
        <img v-if="!isLoading && isImage && currentImage.url" ref="imageRef" :src="currentImage.url" :alt="currentImage.name" class="max-h-full max-w-full object-contain" @click.stop @load="handleImageLoaded" @error="handleMediaError" />

        <!-- 视频预览 -->
        <div v-else-if="!isLoading && !isImage && currentImage.url" class="relative w-full h-full flex items-center justify-center">
          <video ref="videoRef" :src="currentImage.url" controls :class="[
              'w-full', 
              videoViewMode === 'cover' ? 'object-cover h-full' : 'object-contain h-auto'
            ]" @click.stop @error="handleMediaError" @loadeddata="handleVideoLoaded">
            您的浏览器不支持视频播放
          </video>

          <!-- 视频视图模式切换按钮 -->
          <button @click.stop="toggleVideoViewMode" class="absolute bottom-16 right-4 bg-background/80 rounded-full p-2 text-muted-foreground hover:text-foreground sm:opacity-70 sm:hover:opacity-100 z-10" title="切换视图模式">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        <!-- 加载错误提示 -->
        <div v-if="loadError" class="text-center p-4 bg-destructive/10 rounded-lg">
          <p class="text-destructive font-medium">媒体加载失败</p>
          <p class="text-sm text-muted-foreground mt-2">{{ loadError }}</p>
          <button @click="retryLoading" class="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md">
            重试加载
          </button>
        </div>
      </div>

      <button v-if="currentIndex < totalImages - 1" @click.stop="nextImage" class="absolute right-4 bg-background/80 rounded-full p-2 text-muted-foreground hover:text-foreground sm:opacity-50 sm:hover:opacity-100 z-10">
        <ChevronRightIcon class="w-6 h-6" />
      </button>
    </div>

    <!-- 底部缩略图列表 - 所有设备都显示 -->
    <div class="border-t absolute bottom-0 left-0 right-0 bg-background" :class="isMobile ? 'h-16' : 'h-24'">
      <div ref="thumbnailsContainer" class="flex p-2 space-x-2 overflow-x-auto thumbnail-scroll h-full" @wheel="handleMouseWheel">
        <div v-for="(image, index) in images" :key="image.id" :ref="
            (el) => {
              if (index === currentIndex) currentThumbnailRef = el;
            }
          " @click="selectImage(index)" class="shrink-0 cursor-pointer overflow-hidden transition-all relative" :class="[
            isMobile ? 'h-12 w-12' : 'h-20 w-20',
            index === currentIndex ? 'ring-2 ring-primary' : '',
          ]">
          <!-- 使用图片缩略图 -->
          <img v-if="isMediaImage(image)" :src="image.url" :alt="image.name" class="h-full w-full object-cover" />

          <!-- 使用视频缩略图 -->
          <video v-else :src="image.url" class="h-full w-full object-cover" preload="metadata" muted></video>

          <!-- 视频标识 -->
          <div v-if="!isMediaImage(image)" class="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] px-1 py-0.5 rounded-tl-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeMount, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useGalleryStore } from "../stores/galleryStore";
import { useFavoriteStore } from "../stores/favoriteStore";
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
  ArrowDownTrayIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const route = useRoute();
const galleryStore = useGalleryStore();
const favoriteStore = useFavoriteStore();
const toastStore = useToastStore();

// 检测是否为移动设备
const isMobile = ref(false);

onBeforeMount(() => {
  checkMobileDevice();
  window.addEventListener("resize", checkMobileDevice);
});

const checkMobileDevice = () => {
  isMobile.value = window.innerWidth < 640;
};

// 获取所有图片和当前图片索引
const images = computed(() => galleryStore.images);
const totalImages = computed(() => images.value.length);

// 修改currentIndex初始化逻辑，根据ID找到对应的索引
const currentIndex = ref(0);

// 初始化时设置正确的索引
onMounted(async () => {
  // 首先确保数据已加载
  if (galleryStore.images.length === 0) {
    try {
      // 先设置加载状态，防止可能的错误显示
      loadError.value = null;
      await galleryStore.fetchImages();
      // 数据加载完成后再查找索引
      findAndSetCurrentImageIndex();
    } catch (err) {
      console.error('加载图片数据失败:', err);
      loadError.value = '加载图片数据失败，请重试';
    }
  } else {
    findAndSetCurrentImageIndex();
  }

  // 初始加载时滚动到当前缩略图
  nextTick(() => {
    scrollToCurrentThumbnail();
  });

  // 添加页面可见性变化监听，当页面重新可见时刷新数据
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

// 查找并设置当前图片的索引
const findAndSetCurrentImageIndex = () => {
  const imageId = route.params.id;
  const index = images.value.findIndex((img) => img.id === imageId);
  if (index !== -1) {
    currentIndex.value = index;
    updateRoute();
  } else {
    // 如果没有找到对应的图片，先不做任何更新
    // 等待图片数据加载完成后再尝试
    console.log('未找到图片ID，等待数据加载完成');
  }
};

// 缩略图滚动相关的 refs
const thumbnailsContainer = ref(null);
const currentThumbnailRef = ref(null);
const imageRef = ref(null); // 图片元素引用
const videoRef = ref(null); // 视频元素引用
const swipeContainer = ref(null); // 滑动容器引用

// 触摸滑动相关
const touchStartX = ref(0);
const touchEndX = ref(0);
const minSwipeDistance = 50; // 最小滑动距离

// 处理触摸开始事件
const handleTouchStart = (e) => {
  touchStartX.value = e.changedTouches[0].screenX;
};

// 处理触摸移动事件
const handleTouchMove = (e) => {
  // 可以添加一些视觉反馈
};

// 处理触摸结束事件
const handleTouchEnd = (e) => {
  touchEndX.value = e.changedTouches[0].screenX;
  const distance = touchEndX.value - touchStartX.value;

  // 检测滑动方向并导航
  if (distance > minSwipeDistance && currentIndex.value > 0) {
    // 向右滑动，显示上一张
    prevImage();
  } else if (
    distance < -minSwipeDistance &&
    currentIndex.value < totalImages.value - 1
  ) {
    // 向左滑动，显示下一张
    nextImage();
  }
};

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
    return favoriteStore.isFavorite(currentImage.value.id);
  }
  return false;
});

// 切换收藏状态
const toggleFavorite = async () => {
  if (currentImage.value && currentImage.value.id) {
    const imageId = currentImage.value.id;
    const isCurrentlyFavorite = favoriteStore.isFavorite(imageId);

    let result;
    if (isCurrentlyFavorite) {
      // 移除收藏
      result = await favoriteStore.removeFavorite(imageId);
      if (result) {
        toastStore.info(`已将 "${currentImage.value.name}" 移出收藏`);
      }
    } else {
      // 添加收藏
      result = await favoriteStore.addFavorite(imageId);
      if (result) {
        toastStore.success(`已将 "${currentImage.value.name}" 加入收藏`);
      }
    }

    // 操作完成后，获取最新的收藏列表状态
    if (result) {
      // 刷新收藏列表数据
      await favoriteStore.fetchFavorites();
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

// 判断媒体类型相关函数
const isImage = computed(() => {
  if (!currentImage.value || !currentImage.value.name) return true;

  return isMediaImage(currentImage.value);
});

// 判断给定媒体项是否为图片
const isMediaImage = (mediaItem) => {
  if (!mediaItem || !mediaItem.name) return true;

  // 通过文件扩展名判断是否为图片
  const videoExtensions = [
    ".mp4",
    ".webm",
    ".ogg",
    ".mov",
    ".avi",
    ".wmv",
    ".mkv",
    ".flv",
  ];
  const fileName = mediaItem.name.toLowerCase();
  const url = mediaItem.url ? mediaItem.url.toLowerCase() : "";

  // 检查文件名或URL中是否包含视频扩展名
  return !videoExtensions.some(
    (ext) => fileName.endsWith(ext) || url.endsWith(ext)
  );
};

// 媒体加载状态管理
const isLoading = ref(true);
const imageReady = ref(false);
const videoReady = ref(false);
const loadError = ref(null);
const loadRetryCount = ref(0);
const maxRetryCount = 3;

// 图片加载完成处理函数
const handleImageLoaded = () => {
  console.log('图片加载成功');
  isLoading.value = false;
  loadError.value = null;
  loadRetryCount.value = 0; // 重置重试计数
};

// 视频加载完成处理函数
const handleVideoLoaded = () => {
  console.log('视频加载成功');
  isLoading.value = false;
  loadError.value = null;
  loadRetryCount.value = 0; // 重置重试计数
};

// 媒体加载错误处理
const handleMediaError = (event) => {
  console.error("媒体加载失败:", event);

  // 增加重试计数
  loadRetryCount.value++;

  // 特别处理: 图片可能已加载但触发了错误事件
  // 有些情况下浏览器会报错但图片实际加载成功
  if (event.target && event.target.complete && event.target.naturalWidth > 0) {
    console.log("媒体已成功加载，忽略错误");
    isLoading.value = false;
    loadError.value = null;
    return;
  }

  // 如果未超过最大重试次数，自动重试
  if (loadRetryCount.value < maxRetryCount) {
    console.log(`自动重试加载 (${loadRetryCount.value}/${maxRetryCount})...`);
    setTimeout(() => {
      retryLoading();
    }, 1000); // 延迟1秒后重试
  } else {
    // 超过重试次数，显示错误
    isLoading.value = false;
    loadError.value = `无法加载文件: ${currentImage.value?.name || '未知文件'} (已重试${loadRetryCount.value}次)`;
  }
};

// 重试加载媒体
const retryLoading = () => {
  isLoading.value = true;
  loadError.value = null;

  // 短暂延迟后重新设置媒体元素的src
  setTimeout(() => {
    if (isImage.value && imageRef.value) {
      const currentSrc = currentImage.value.url;
      imageRef.value.src = "";
      setTimeout(() => {
        if (imageRef.value) {
          imageRef.value.src = `${currentSrc}?t=${Date.now()}`; // 添加时间戳防止缓存
        }
      }, 100);
    } else if (!isImage.value && videoRef.value) {
      const currentSrc = currentImage.value.url;
      videoRef.value.src = "";
      setTimeout(() => {
        if (videoRef.value) {
          videoRef.value.src = `${currentSrc}?t=${Date.now()}`; // 添加时间戳防止缓存
        }
      }, 100);
    }
  }, 300);
};

// 监视当前图片变化，重置媒体状态
watch(currentImage, () => {
  // 重置媒体加载状态
  isLoading.value = true;
  loadError.value = null;
  loadRetryCount.value = 0;

  // 立即尝试加载
  if (currentImage.value && currentImage.value.url) {
    const img = new Image();

    img.onload = () => {
      // 预加载成功，更新状态
      isLoading.value = false;
    };

    img.onerror = () => {
      // 如果预加载失败但图片仍然加载了部分内容(有naturalWidth)，我们仍然显示
      if (img.naturalWidth > 0) {
        isLoading.value = false;
        return;
      }

      // 真正的加载失败，调用错误处理
      handleMediaError({ target: img });
    };

    // 开始加载图片，添加时间戳避免缓存问题
    img.src = `${currentImage.value.url}?t=${Date.now()}`;
  }
}, { immediate: true });

// 切换全屏时根据媒体类型选择合适的元素
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    const mediaElement = isImage.value ? imageRef.value : videoRef.value;
    if (mediaElement) {
      mediaElement
        .requestFullscreen()
        .then(() => {
          isFullscreen.value = true;
        })
        .catch((err) => {
          console.error(`全屏错误: ${err.message}`);
        });
    }
  } else {
    if (document.exitFullscreen) {
      document
        .exitFullscreen()
        .then(() => {
          isFullscreen.value = false;
        })
        .catch((err) => {
          console.error(`退出全屏错误: ${err.message}`);
        });
    }
  }
};

// 监听全屏变化事件
onMounted(() => {
  document.addEventListener("fullscreenchange", () => {
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
  if (images.value[currentIndex.value]) {
    router.replace({
      name: "preview",
      params: { id: images.value[currentIndex.value].id },
    });
  }
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
  try {
    const confirmed = await toastStore.confirm("确定要删除这张图片吗？", {
      title: "删除确认",
      type: "warning",
    });

    if (confirmed) {
      // 确保当前图片存在
      if (!currentImage.value || !currentImage.value.id) {
        toastStore.error("无法删除：当前图片信息不完整");
        return;
      }

      const imageId = currentImage.value.id;

      // 检查图片是否在收藏中
      const isImageFavorited = favoriteStore.isFavorite(imageId);

      // 直接调用删除方法，该方法内部已实现乐观更新
      const result = await galleryStore.deleteImage(imageId);

      if (result) {
        // 如果图片在收藏中，也从收藏中删除
        if (isImageFavorited) {
          await favoriteStore.removeFavorite(imageId);
          // 刷新收藏列表
          await favoriteStore.fetchFavorites();
        }

        // 触发图片删除事件，通知其他组件（特别是收藏页面）刷新数据
        window.dispatchEvent(
          new CustomEvent("image-deleted", {
            detail: { imageId },
          })
        );

        // 在UI上处理删除后的状态
        if (images.value.length === 0) {
          // 如果没有图片了，返回相册
          goBack();
        } else if (currentIndex.value >= images.value.length) {
          // 如果当前索引超出范围，显示最后一张
          currentIndex.value = images.value.length - 1;
          updateRoute();
        } else {
          // 确保路由更新
          updateRoute();
        }

        toastStore.success("图片已删除");

        // 在后台静默刷新数据
        setTimeout(() => {
          galleryStore.fetchImagesInBackground();
        }, 1000);
      }
    }
  } catch (error) {
    console.error("删除图片出错:", error);
    toastStore.error("删除图片失败，请重试");
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

// 监听route参数变化，更新当前索引
watch(
  () => route.params.id,
  (newId) => {
    if (newId && images.value.length > 0) {
      findAndSetCurrentImageIndex();
    }
  }
);

// 下载图片
const downloadImage = () => {
  if (currentImage.value && currentImage.value.url) {
    try {
      // 显示下载开始提示
      toastStore.info(`开始下载 "${currentImage.value.name}"...`);

      // 创建一个隐形的a标签用于下载
      const a = document.createElement("a");
      a.href = currentImage.value.url;
      a.download = currentImage.value.name || `image-${Date.now()}.jpg`;
      a.target = "_blank"; // 在新标签页打开，避免当前页面导航
      a.rel = "noopener noreferrer"; // 安全设置
      a.style.display = "none";

      // 添加到文档中
      document.body.appendChild(a);

      // 执行点击
      a.click();

      // 清理DOM
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);

      // 显示下载成功提示
      toastStore.success(`图片开始下载`);
    } catch (error) {
      console.error("下载图片失败", error);
      toastStore.error(`下载图片失败: ${error.message}`);
    }
  } else {
    toastStore.error("无法下载图片，图片地址无效");
  }
};

// 视频视图模式
const videoViewMode = ref('contain');

// 切换视频视图模式
const toggleVideoViewMode = () => {
  videoViewMode.value = videoViewMode.value === 'cover' ? 'contain' : 'cover';
};

// 处理页面可见性变化
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible' && galleryStore.images.length === 0) {
    // 页面变为可见且没有图片数据时，重新加载数据
    galleryStore.fetchImages().then(() => {
      findAndSetCurrentImageIndex();
    });
  }
};

// 组件卸载时清理事件监听
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style scoped>
.image-preview-container {
  height: 100vh;
  width: 100%;
  padding-bottom: 6rem; /* 为底部固定的缩略图列表留出空间 */
}

/* 预览容器中的图片和视频样式 */
img,
video {
  transition: all 0.3s ease;
  max-height: 100%;
  max-width: 100%;
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
