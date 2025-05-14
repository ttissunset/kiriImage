<template>
  <div class="relative h-full">
    <!-- 页面标题和工具栏 -->
    <div class="sticky top-0 z-10 bg-background px-4 py-2 md:px-6 lg:px-8 border-b shadow-sm">
      <!-- 桌面端控制区 -->
      <div class="hidden md:flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <!-- 网格布局滑块控制器 -->
          <div class="flex items-center gap-2 mr-3">
            <Slider v-model="gridSize" :min="4" :max="8" :step="1" width="8rem" />
          </div>

          <!-- 图片显示模式切换按钮 -->
          <Button variant="outline" size="icon" @click="appStore.toggleDisplayMode" :title="
              appStore.imageDisplayMode === 'fill'
                ? '切换到原始比例'
                : '切换到填充模式'
            " class="h-8 w-8 mr-1">
            <ViewColumnsIcon v-if="appStore.imageDisplayMode === 'fill'" class="h-4 w-4" />
            <Squares2X2Icon v-else class="h-4 w-4" />
          </Button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <!-- 选择计数和操作按钮 -->
          <transition name="fade-slide" mode="out-in">
            <div v-if="favoriteStore.hasSelected" class="flex items-center gap-2" key="selection-controls-desktop">
              <span class="text-sm text-muted-foreground">已选择 {{ favoriteStore.selectedFavorites.length }} 项</span>
              <!-- 操作图标按钮区 -->
              <div class="flex items-center">
                <!-- 取消收藏按钮 -->
                <Button variant="outline" size="icon" class="h-8 w-8 mr-1" @click="openBatchRemoveDialog" title="取消收藏">
                  <HeartIcon class="h-4 w-4 text-destructive" />
                </Button>

                <!-- 取消选择按钮 -->
                <Button variant="ghost" size="icon" class="h-8 w-8 ml-1" @click="favoriteStore.clearSelection" title="取消选择">
                  <XMarkIcon class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <!-- 全选按钮 -->
            <Button v-else-if="
                !favoriteStore.hasSelected && favoriteStore.favorites.length > 0
              " variant="outline" size="icon" @click="favoriteStore.selectAll" title="全选" class="h-8 w-8" key="select-all-desktop">
              <CheckCircleIcon class="h-4 w-4" />
            </Button>
          </transition>
        </div>
      </div>

      <!-- 移动端操作栏 -->
      <div class="flex items-center justify-between">
        <h5 class="text-lg font-semibold text-card-foreground sm:text-xl">
          我的收藏
        </h5>

        <!-- 移动端操作按钮组 -->
        <div class="flex items-center">
          <!-- 选择计数和操作按钮 -->
          <transition name="fade-slide" mode="out-in">
            <div v-if="favoriteStore.hasSelected" class="flex items-center md:hidden" key="selection-controls-mobile">
              <span class="text-xs text-muted-foreground mr-2">{{ favoriteStore.selectedFavorites.length }}项</span>

              <!-- 取消收藏按钮 -->
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="openBatchRemoveDialog" title="取消收藏">
                <HeartIcon class="h-4 w-4 text-destructive" />
              </Button>

              <!-- 取消选择按钮 -->
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="favoriteStore.clearSelection" title="取消选择">
                <XMarkIcon class="h-4 w-4" />
              </Button>
            </div>

            <!-- 常规操作按钮 -->
            <div v-else class="flex items-center md:hidden" key="standard-controls-mobile">
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="appStore.toggleDisplayMode" title="显示模式">
                <Squares2X2Icon class="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" class="h-8 w-8" @click="favoriteStore.selectAll" title="全选">
                <CheckCircleIcon class="h-4 w-4" />
              </Button>
            </div>
          </transition>

          <!-- 菜单按钮 -->
          <Button variant="ghost" size="icon" class="h-8 w-8 ml-1 md:hidden" @click="toggleMobileMenu" title="菜单">
            <Bars3Icon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="p-4 pt-6 md:px-6 lg:px-8" ref="scrollContainer">
      <!-- 加载状态 -->
      <div v-if="favoriteStore.isLoading && !favoriteStore.isLoadingMore" class="flex justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="favoriteStore.error" class="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
        {{ favoriteStore.error }}
        <Button variant="outline" class="mt-2" @click="favoriteStore.fetchFavorites">重试</Button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="favoriteStore.favorites.length === 0" class="py-12 flex flex-col items-center justify-center space-y-4">
        <div class="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <HeartIcon class="h-10 w-10" />
        </div>
        <div class="text-center space-y-2">
          <p class="text-lg font-medium">暂无收藏</p>
          <p class="text-sm text-muted-foreground max-w-md">
            您还没有收藏任何图片，浏览相册并点击心形图标将喜欢的图片添加到收藏夹
          </p>
        </div>
        <Button @click="goToGallery" variant="outline" class="mt-4">
          <PhotoIcon class="mr-2 h-4 w-4" />
          浏览相册
        </Button>
      </div>

      <!-- 收藏网格 -->
      <div v-else>
        <!-- 收藏网格 -->
        <div class="grid-gallery" :style="gridStyle">
          <div v-for="favorite in favoriteStore.favorites" :key="favorite.id" class="grid-item">
            <ImageCard 
              :image="favorite.image" 
              :is-selected="favoriteStore.isSelected(favorite.imageId)"
              @click="toggleSelect(favorite.imageId)" 
            />
          </div>
        </div>

        <!-- 加载更多指示器 -->
        <div v-if="favoriteStore.isLoadingMore" class="flex justify-center py-6">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
        </div>

        <!-- 加载完成提示 -->
        <div v-if="!favoriteStore.hasMore && favoriteStore.favorites.length > 0" class="py-4 text-center text-sm text-muted-foreground">
          已加载全部收藏
        </div>

        <!-- 底部信息栏 -->
        <div class="mt-4 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>{{ favoriteStore.total }} 张收藏</p>
          <p>最后更新于 {{ formatUpdateTime(new Date()) }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- 批量取消收藏对话框 -->
  <DeleteConfirmDialog 
    v-model="showBatchRemoveDialog" 
    :multiple="true" 
    :count="favoriteStore.selectedFavorites.length" 
    confirm-text="取消收藏" 
    title="取消收藏" 
    message="确定要取消收藏这些图片吗？" 
    @confirm="handleBatchRemove" 
  />
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount, nextTick } from "vue";
import { useFavoriteStore } from "../stores/favoriteStore";
import Button from "../components/ui/Button.vue";
import ImageCard from "../components/ImageCard.vue";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog.vue";
import {
  HeartIcon,
  PhotoIcon,
  CheckCircleIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/vue/24/outline";
import { useRouter } from "vue-router";
import Slider from "../components/ui/Slider.vue";
import { useAppStore } from "../stores/appStore";
import { useGalleryStore } from "../stores/galleryStore";
import { throttle, debounce } from "../utils/performance";

const favoriteStore = useFavoriteStore();
const router = useRouter();
const appStore = useAppStore();
const galleryStore = useGalleryStore();

const showBatchRemoveDialog = ref(false);
const gridSize = ref(5); // 默认每行显示5个图片
const scrollContainer = ref(null);
const isScrollListenerActive = ref(true);

// 移动端菜单控制
const showMobileMenu = ref(false);

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  // 触发App组件中的toggleMobileMenu方法
  document.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
};

// 通过gridSize计算网格样式
const gridStyle = computed(() => {
  return {
    "grid-template-columns": `repeat(${gridSize.value}, 1fr)`,
    gap: "8px",
  };
});

// 监听滚动事件，实现无限滚动
const handleScroll = throttle(() => {
  if (!isScrollListenerActive.value || !favoriteStore.hasMore || favoriteStore.isLoadingMore) {
    return;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  // 当滚动到距离底部300px时，加载更多
  if (documentHeight - scrollTop - windowHeight < 300) {
    loadMoreFavorites();
  }
}, 200);

// 加载更多收藏
const loadMoreFavorites = async () => {
  if (favoriteStore.hasMore && !favoriteStore.isLoadingMore) {
    await favoriteStore.loadMoreFavorites();
  }
};

// 监听路由变化，实现更可靠的状态重置
watch(() => router.currentRoute.value.name, (newRouteName) => {
  // 当进入favorites页面时，清除gallery的选中状态并重置当前页面状态
  if (newRouteName === 'favorites') {
    favoriteStore.clearSelection();
    galleryStore.clearSelection();
  }
});

// 加载收藏
onMounted(() => {
  favoriteStore.fetchFavorites();

  // 添加滚动事件监听
  window.addEventListener('scroll', handleScroll);

  // 进入页面时重置相册页面的选中状态和当前页面状态
  galleryStore.clearSelection();
  favoriteStore.clearSelection();
});

// 监听路由变化，当进入收藏页面时重新获取数据
const refreshOnRouteEnter = async () => {
  if (router.currentRoute.value.name === 'favorites') {
    await favoriteStore.fetchFavorites();
  }
};

// 监听路由变化
watch(() => router.currentRoute.value.path, refreshOnRouteEnter);

// 还可以订阅自定义事件，当图片被删除时刷新收藏列表
onMounted(() => {
  window.addEventListener('image-deleted', refreshOnRouteEnter);
});

onBeforeUnmount(() => {
  window.removeEventListener('image-deleted', refreshOnRouteEnter);
  window.removeEventListener('scroll', handleScroll);

  // 离开收藏页面时清除收藏选中状态
  favoriteStore.clearSelection();
});

// 切换选择
const toggleSelect = (imageId) => {
  favoriteStore.toggleSelect(imageId);
};

// 打开批量取消收藏对话框
const openBatchRemoveDialog = () => {
  showBatchRemoveDialog.value = true;
};

// 处理批量取消收藏
const handleBatchRemove = async () => {
  // 暂停滚动监听，防止操作过程中触发
  isScrollListenerActive.value = false;

  const result = await favoriteStore.batchRemoveFavorites();

  // 无论成功与否，都关闭对话框
  showBatchRemoveDialog.value = false;

  // 如果取消收藏成功，刷新收藏列表
  if (result) {
    // 重新获取最新的收藏列表
    await favoriteStore.fetchFavorites();
  }

  // 恢复滚动监听
  nextTick(() => {
    isScrollListenerActive.value = true;
  });
};

// 格式化更新时间
const formatUpdateTime = (date) => {
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 跳转到相册页面
const goToGallery = () => {
  router.push({ name: "gallery" });
};
</script> 

<style scoped>
.grid-gallery {
  display: grid;
  margin: 0 auto;
  width: 100%;
}

/* 移动端一行显示3张照片 */
@media (max-width: 640px) {
  .grid-gallery {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 4px !important;
  }
}

.grid-item {
  aspect-ratio: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .grid-item {
    padding: 2px;
  }
}

/* 安全区适配 */
@supports (padding: max(0px)) {
  .p-4 {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
  }
}

/* 添加过渡动画效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
