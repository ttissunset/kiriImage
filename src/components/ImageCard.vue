<template>
  <div class="relative flex flex-col w-full h-full overflow-hidden text-card-foreground transition-all">
    <!-- 图片区域 - iCloud风格居中显示 -->
    <div class="flex flex-grow w-full h-full items-center justify-center relative group p-1 overflow-hidden" @click="toggleSelect" @dblclick="openPreview" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
      <!-- 图片显示 -->
      <img v-if="isImage" :src="image.url" :alt="image.name" :class="[
          'transition-all relative',
          { 'ring-2 ring-primary ring-offset-2': selected },
          appStore.imageDisplayMode === 'fill'
            ? 'object-cover w-full h-full object-position-top'
            : 'object-contain max-h-full max-w-full',
        ]" loading="lazy" @mouseenter="handleMouseEnter" />

      <!-- 视频显示 -->
      <video v-else :src="image.url" :class="[
          'transition-all relative',
          { 'ring-2 ring-primary ring-offset-2': selected },
          appStore.imageDisplayMode === 'fill'
            ? 'object-cover w-full h-full'
            : 'object-contain max-h-full max-w-full',
        ]" preload="metadata" muted @mouseover="playVideoPreview" @mouseout="pauseVideoPreview" @loadedmetadata="getVideoDuration" ref="videoRef">
        您的浏览器不支持视频播放
      </video>

      <!-- 视频时长显示 -->
      <div v-if="!isImage && videoDuration" class="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-white text-xs font-medium z-10">
        {{ formatDuration(videoDuration) }}
      </div>

      <!-- 右上角操作按钮 - 在收藏页面的移动端不显示 -->
      <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 sm:gap-2" :class="{ 'max-sm:hidden': isInFavoritesPage }">
        <!-- 下载按钮 -->
        <button class="w-7 h-7 sm:w-8 sm:h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm" @click.stop="downloadImage" title="下载图片" aria-label="下载图片">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        <!-- 复制按钮 (原更多操作按钮) -->
        <button class="w-7 h-7 sm:w-8 sm:h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm" @click.stop="copyImageUrl" title="复制图片地址" aria-label="复制图片地址">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>

      <!-- 左下角收藏图标 -->
      <div v-if="checkFavoriteStatus()" class="absolute bottom-2 left-2">
        <div class="w-6 h-6 sm:w-6 sm:h-6 max-sm:w-4 max-sm:h-4 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-4 sm:h-4 max-sm:w-3 max-sm:h-3">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </div>
      </div>

      <!-- 移动设备长按提示 - 仅在小屏幕上显示 -->
      <div class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 pointer-events-none transition-opacity duration-300 sm:hidden" :class="{ 'opacity-100': isLongPressed }">
        <div class="text-white text-center p-4">
          <p class="font-medium">图片已选中</p>
          <p class="text-xs mt-1">点击预览，长按选择</p>
        </div>
      </div>

      <!-- 移动端操作按钮 - 悬浮在图片上，在收藏页面不显示 -->
      <div v-if="!isInFavoritesPage" class="absolute bottom-3 right-3 sm:hidden opacity-0 group-active:opacity-100 transition-opacity z-10 flex items-center gap-2">
        <button class="w-9 h-9 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground shadow-md" @click.stop="downloadImage" aria-label="下载图片">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 图片名称 - 显示在图片下方，支持双击重命名，在移动端隐藏 -->
    <div class="px-1 py-1 text-xs text-center text-muted-foreground truncate cursor-pointer hover:text-foreground max-sm:hidden" title="双击重命名" @dblclick.stop="handleNameDblClick">
      {{ image.name }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, inject, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGalleryStore } from "../stores/galleryStore";
import { useAppStore } from "../stores/appStore";
import { useFavoriteStore } from "../stores/favoriteStore";
import { useToastStore } from "../stores/toastStore";
import { checkFavoriteStatus as apiFetchFavoriteStatus } from "../api/favorites";
import { preloadImages } from '../utils/performance';

const props = defineProps({
  image: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["rename", "delete"]);

const router = useRouter();
const galleryStore = useGalleryStore();
const appStore = useAppStore();
const favoriteStore = useFavoriteStore();
const toastStore = useToastStore();

// 判断是否在收藏页面
const isInFavoritesPage = computed(() => {
  return router.currentRoute.value.name === "favorites";
});

// 图片是否被选中
const selected = computed(() => {
  return galleryStore.isSelected(props.image.id);
});

// 收藏状态缓存
const favoriteStatusCache = ref(new Map());
// 图片加载状态
const imageLoaded = ref(false);
const videoRef = ref(null);
const videoDuration = ref(null);

// 检查图片是否已收藏 (适用于所有页面)
const checkFavoriteStatus = () => {
  // 首先检查store中是否有记录
  if (favoriteStore.isFavorite(props.image.id)) {
    return true;
  }

  // 如果缓存中有记录，返回缓存结果
  if (favoriteStatusCache.value.has(props.image.id)) {
    return favoriteStatusCache.value.get(props.image.id);
  }

  // 否则异步获取状态并缓存
  fetchFavoriteStatus();
  return false;
};

// 异步获取收藏状态
const fetchFavoriteStatus = async () => {
  try {
    const response = await apiFetchFavoriteStatus(props.image.id);
    if (response.code === 200) {
      favoriteStatusCache.value.set(props.image.id, response.data.isFavorite);
    }
  } catch (error) {
    console.error("获取收藏状态失败:", error);
  }
};

// 组件挂载时获取收藏状态
onMounted(() => {
  fetchFavoriteStatus();
});

// 移动端长按和点击相关
const touchTimeout = ref(null);
const isLongPressed = ref(false);
const longPressThreshold = 500; // 长按阈值，单位毫秒
const touchStartY = ref(0); // 记录触摸开始的Y坐标
const touchStartTime = ref(0); // 记录触摸开始的时间

// 处理触摸开始事件
const handleTouchStart = (e) => {
  // 记录触摸起始位置和时间
  touchStartY.value = e.changedTouches[0].screenY;
  touchStartTime.value = Date.now();

  // 设置长按计时器
  touchTimeout.value = setTimeout(() => {
    isLongPressed.value = true;
    toggleSelect();

    // 提供触觉反馈（如果设备支持）
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // 2秒后自动隐藏提示
    setTimeout(() => {
      isLongPressed.value = false;
    }, 2000);
  }, longPressThreshold);
};

// 处理触摸结束事件
const handleTouchEnd = (e) => {
  // 清除长按计时器
  if (touchTimeout.value) {
    clearTimeout(touchTimeout.value);
    touchTimeout.value = null;

    // 计算触摸时长和滑动距离
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime.value;
    const touchEndY = e.changedTouches[0].screenY;
    const touchDistance = Math.abs(touchEndY - touchStartY.value);

    // 判断是否为滚动操作 - 如果垂直移动超过20px或持续时间超过300ms，认为是滚动而非点击
    const isScrolling = touchDistance > 20 || touchDuration > 300;

    // 如果没有长按，不是滚动操作，且是移动设备，则触发预览
    if (!isLongPressed.value && !isScrolling && window.innerWidth < 768) {
      openPreview();
    }

    isLongPressed.value = false;
  }
};

const toggleSelect = () => {
  galleryStore.toggleSelect(props.image.id);
};

const openPreview = () => {
  router.push({ name: "preview", params: { id: props.image.id } });
};

// 双击图片名称处理
const handleNameDblClick = (event) => {
  event.stopPropagation();

  // 如果在收藏页面，不允许重命名
  if (router.currentRoute.value.name === "favorites") {
    toastStore.info("在收藏页面无法重命名图片，请前往相册页面进行操作");
    return;
  }

  // 触发重命名事件
  emit("rename", props.image);
};

// 打开图片操作菜单
const openMenu = (event) => {
  event.stopPropagation();

  // 根据当前页面路径判断是否在收藏页面
  const isInFavorites = router.currentRoute.value.name === "favorites";

  if (isInFavorites) {
    // 如果在收藏页面，发出取消收藏的事件
    emit("delete", props.image);
  } else {
    // 否则，显示重命名对话框
    emit("rename", props.image);
  }
};

// 下载图片函数
const downloadImage = async (event) => {
  event.stopPropagation();

  try {
    // 创建一个临时链接
    const link = document.createElement("a");
    link.href = props.image.url;
    link.download = props.image.name || "download.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 显示成功提示
    toastStore.success("图片已开始下载", {
      title: "下载成功",
    });
  } catch (error) {
    console.error("下载图片失败:", error);
    toastStore.error("下载图片失败，请稍后重试", {
      title: "下载失败",
    });
  }
};

// 复制图片地址函数
const copyImageUrl = async (event) => {
  event.stopPropagation();

  try {
    // 获取图片URL
    const imageUrl = props.image.url;

    // 使用Clipboard API复制到剪贴板
    await navigator.clipboard.writeText(imageUrl);

    // 显示成功提示
    toastStore.success("图片地址已复制到剪贴板", {
      title: "复制成功",
    });
  } catch (error) {
    console.error("复制图片地址失败:", error);

    // 尝试使用备用方法
    try {
      const textArea = document.createElement("textarea");
      textArea.value = props.image.url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      toastStore.success("图片地址已复制到剪贴板", {
        title: "复制成功",
      });
    } catch (fallbackError) {
      toastStore.error("复制图片地址失败，请手动复制", {
        title: "复制失败",
      });
    }
  }
};

// 判断文件类型相关函数
const isImage = computed(() => {
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
  const fileName = props.image.name.toLowerCase();
  const url = props.image.url.toLowerCase();

  // 检查文件名或URL中是否包含视频扩展名
  return !videoExtensions.some(
    (ext) => fileName.endsWith(ext) || url.endsWith(ext)
  );
});

// 视频预览控制
const playVideoPreview = (event) => {
  if (!isImage.value) {
    event.target.play().catch((err) => {
      console.warn("自动播放视频失败:", err);
    });
  }
};

const pauseVideoPreview = (event) => {
  if (!isImage.value) {
    event.target.pause();
  }
};

// 视频时长相关
const getVideoDuration = (event) => {
  if (event.target.duration) {
    videoDuration.value = event.target.duration;
  }
};

// 格式化时长为 mm:ss 格式
const formatDuration = (seconds) => {
  if (!seconds) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 当鼠标悬停时预加载原始图片
const handleMouseEnter = () => {
  if (props.image.url && props.image.originalUrl && !imageLoaded.value) {
    preloadImages([props.image.originalUrl])
      .then(() => {
        imageLoaded.value = true;
      })
      .catch(error => {
        console.error('Failed to preload image:', error);
      });
  }
};
</script>

<style scoped>
/* 添加触摸反馈 */
@media (max-width: 768px) {
  .w-full {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}

/* 移动端支持点击时显示操作按钮 */
@media (hover: none) {
  .group:active .opacity-0.group-hover\:opacity-100 {
    opacity: 1;
  }
}

/* 长图片显示上半部分 */
.object-position-top {
  object-position: top;
}
</style>
