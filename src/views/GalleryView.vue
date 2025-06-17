<template>
  <div class="relative h-full">
    <!-- 页面标题和工具栏 -->
    <div class="sticky top-0 z-10 bg-background px-4 py-2 md:px-6 lg:px-8 border-b shadow-sm">
      <!-- 桌面端控制区 -->
      <div class="hidden md:flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <!-- 网格布局滑块控制器 -->
          <div class="flex items-center gap-2 mr-3">
            <Slider :model-value="gridSize" @update:model-value="handleGridSizeChange" :min="4" :max="8" :step="1" width="8rem" />
          </div>

          <!-- 图片显示模式切换按钮 - 仅在桌面端显示 -->
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
          <!-- 选择计数和操作按钮 - 桌面端版本 -->
          <transition name="fade-slide" mode="out-in">
            <div v-if="galleryStore.hasSelected" class="flex items-center gap-2" key="selection-controls-desktop">
              <span class="text-sm text-muted-foreground">已选择 {{ galleryStore.selectedCount }} 项</span>
              <!-- 操作图标按钮区 -->
              <div class="flex items-center">
                <!-- 收藏按钮 -->
                <Button variant="outline" size="icon" class="h-8 w-8 mr-1" @click="batchAddToFavorites" title="添加到收藏">
                  <HeartIcon class="h-4 w-4" />
                </Button>

                <!-- 删除按钮 -->
                <Button variant="outline" size="icon" class="h-8 w-8" @click="openDeleteMultipleDialog" title="删除所选">
                  <TrashIcon class="h-4 w-4 text-destructive" />
                </Button>

                <!-- 取消选择按钮 -->
                <Button variant="ghost" size="icon" class="h-8 w-8 ml-1" @click="galleryStore.clearSelection" title="取消选择">
                  <XMarkIcon class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <!-- 全选按钮 - 仅在桌面端显示 -->
            <Button v-else-if="
                !galleryStore.hasSelected && galleryStore.images.length > 0
              " variant="outline" size="icon" @click="galleryStore.selectAll" title="全选" class="h-8 w-8" key="select-all-desktop">
              <CheckCircleIcon class="h-4 w-4" />
            </Button>
          </transition>
        </div>
      </div>

      <!-- 移动端操作栏 -->
      <div class="flex items-center justify-between">
        <h5 class="text-lg font-semibold text-card-foreground sm:text-xl">
          所有图片 <span class="ml-2 text-sm text-muted-foreground" v-if="galleryStore.images.length > 0">共 {{ galleryStore.total }} 张</span>
        </h5>

        <!-- 移动端操作按钮组-->
        <div class="flex items-center">
          <!-- 选择计数和操作按钮 - 移动端版本 -->
          <transition name="fade-slide" mode="out-in">
            <div v-if="galleryStore.hasSelected" class="flex items-center md:hidden" key="selection-controls-mobile">
              <span class="text-xs text-muted-foreground mr-2">{{ galleryStore.selectedCount }}项</span>

              <!-- 收藏按钮 -->
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="batchAddToFavorites" title="添加到收藏">
                <HeartIcon class="h-4 w-4" />
              </Button>

              <!-- 删除按钮 -->
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="openDeleteMultipleDialog" title="删除所选">
                <TrashIcon class="h-4 w-4 text-destructive" />
              </Button>

              <!-- 取消选择按钮 -->
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="galleryStore.clearSelection" title="取消选择">
                <XMarkIcon class="h-4 w-4" />
              </Button>
            </div>

            <!-- 常规操作按钮 - 未选择状态 -->
            <div v-else class="flex items-center md:hidden" key="standard-controls-mobile">
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="appStore.toggleDisplayMode" title="显示模式">
                <Squares2X2Icon class="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" class="h-8 w-8" @click="galleryStore.selectAll" title="全选">
                <CheckCircleIcon class="h-4 w-4" />
              </Button>
            </div>
          </transition>

          <!-- 菜单按钮 - 只在移动端显示 -->
          <Button variant="ghost" size="icon" class="h-8 w-8 ml-1 md:hidden" @click="toggleMobileMenu" title="菜单">
            <Bars3Icon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- 内容区域-->
    <div class="p-4 pt-6 md:px-6 lg:px-8" ref="scrollContainer">
      <div v-if="galleryStore.isLoading && !galleryStore.isLoadingMore" class="flex justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
      </div>

      <div v-else-if="galleryStore.error" class="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
        {{ galleryStore.error }}
        <Button variant="outline" class="mt-2" @click="galleryStore.fetchImages">重试</Button>
      </div>

      <div v-else-if="galleryStore.images.length === 0" class="py-12 text-center">
        <p class="text-lg text-muted-foreground">暂无图片</p>
      </div>

      <!-- 图片网格  -->
      <div v-else>
        <div class="grid-gallery" :style="gridStyle">
          <div v-for="image in galleryStore.images" :key="image.id" class="grid-item">
            <ImageCard :image="image" :is-selected="galleryStore.isSelected(image.id)" @rename="openRenameDialog" @delete="openDeleteDialog" />
          </div>
        </div>

        <div v-if="galleryStore.isLoadingMore" class="flex justify-center py-6">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
        </div>
      </div>
    </div>
  </div>

  <RenameDialog v-model="showRenameDialog" :image="selectedImage" @rename="handleRename" />

  <DeleteConfirmDialog v-model="showDeleteDialog" :image="selectedImage" @confirm="handleDelete" />

  <DeleteConfirmDialog v-model="showDeleteMultipleDialog" :multiple="true" :count="galleryStore.selectedCount" @confirm="handleDeleteMultiple" />
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch, nextTick } from "vue";
import { useGalleryStore } from "../stores/galleryStore";
import { useAppStore } from "../stores/appStore";
import Button from "../components/ui/Button.vue";
import ImageCard from "../components/ImageCard.vue";
import RenameDialog from "../components/RenameDialog.vue";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog.vue";
import Slider from "../components/ui/Slider.vue";
import {
  CheckCircleIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  HeartIcon,
  TrashIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/vue/24/outline";
import { useToastStore } from "../stores/toastStore";
import { useFavoriteStore } from "../stores/favoriteStore";
import { batchAddToFavorites as apiBatchAddToFavorites } from "../api/favorites";
import { throttle, debounce } from "../utils/performance";
import { useRouter, useRoute } from "vue-router";

const galleryStore = useGalleryStore();
const appStore = useAppStore();
const toastStore = useToastStore();
const favoriteStore = useFavoriteStore();
const router = useRouter();
const route = useRoute();

const showRenameDialog = ref(false);
const showDeleteDialog = ref(false);
const showDeleteMultipleDialog = ref(false);
const selectedImage = ref(null);
const gridSize = ref(5);
const scrollContainer = ref(null);
const isScrollListenerActive = ref(true);

// 通过gridSize计算网格样式
const gridStyle = computed(() => {
  return {
    "grid-template-columns": `repeat(${gridSize.value}, 1fr)`,
    gap: "8px",
  };
});

// 使用节流函数优化滑块组件的值变化处理
const handleGridSizeChange = throttle((newSize) => {
  gridSize.value = newSize;
}, 100);

// 使用防抖函数优化窗口调整大小的事件处理
const handleWindowResize = debounce(() => {
  // 调整网格布局以适应窗口大小
  const windowWidth = window.innerWidth;
  if (windowWidth < 640) { // 移动设备
    gridSize.value = 3;
  } else if (windowWidth < 1024) {
    gridSize.value = 4;
  } else { // 桌面设备
    gridSize.value = 5;
  }
}, 200);

// 监听滚动事件，实现无限滚动
const handleScroll = throttle(() => {
  if (!isScrollListenerActive.value || !galleryStore.hasMore || galleryStore.isLoadingMore) {
    return;
  }

  const container = scrollContainer.value;
  if (!container) return;

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  // 当滚动到距离底部300px时，加载更多
  if (documentHeight - scrollTop - windowHeight < 300) {
    loadMoreImages();
  }
}, 200);

// 加载更多图片
const loadMoreImages = async () => {
  if (galleryStore.hasMore && !galleryStore.isLoadingMore) {
    await galleryStore.loadMoreImages();
  }
};

watch(() => route.name, (newRouteName) => {
  // 当进入gallery页面清除收藏页面的选中状态并重置当前页面状态
  if (newRouteName === 'gallery') {
    galleryStore.clearSelection();
    favoriteStore.clearSelection();
  }
});

// 监听窗口大小变化
onMounted(() => {
  galleryStore.fetchImages();

  // 初始化根据窗口大小设置网格大小
  handleWindowResize();

  // 添加窗口大小调整事件监听
  window.addEventListener('resize', handleWindowResize);

  // 添加滚动事件监听
  window.addEventListener('scroll', handleScroll);

  // 进入页面时重置收藏页面的选中状态和当前页面状态
  favoriteStore.clearSelection();
  galleryStore.clearSelection();
});

// 组件卸载时清除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize);
  window.removeEventListener('scroll', handleScroll);

  // 离开页面时重置当前页面的选中状态
  galleryStore.clearSelection();
});

// 打开重命名对话框
const openRenameDialog = (image) => {
  selectedImage.value = image;
  showRenameDialog.value = true;
};

// 打开删除对话框
const openDeleteDialog = (image) => {
  selectedImage.value = image;
  showDeleteDialog.value = true;
};

// 打开批量删除对话框
const openDeleteMultipleDialog = () => {
  showDeleteMultipleDialog.value = true;
};

// 处理重命名
const handleRename = async ({ id, name }) => {
  // 暂停滚动监听，防止操作过程中触发
  isScrollListenerActive.value = false;

  // 直接调用更新方法，该方法内部已实现乐观更新
  const result = await galleryStore.updateImageName(id, name);

  // 恢复滚动监听
  nextTick(() => {
    isScrollListenerActive.value = true;
  });

  // 在后台静默刷新数据
  if (result) {
    setTimeout(() => {
      galleryStore.fetchImagesInBackground();
    }, 1000); // 延迟1秒后进行后台刷新
  }
};

// 处理删除
const handleDelete = async () => {
  if (selectedImage.value) {
    // 暂停滚动监听，防止操作过程中触发
    isScrollListenerActive.value = false;

    // 直接调用删除方法
    const result = await galleryStore.deleteImage(selectedImage.value.id);

    // 恢复滚动监听
    nextTick(() => {
      isScrollListenerActive.value = true;
    });

    // 在后台静默刷新数据
    if (result) {
      setTimeout(() => {
        galleryStore.fetchImagesInBackground();
      }, 1000); // 延迟1秒后进行后台刷新
    }
  }
};

// 处理批量删除
const handleDeleteMultiple = async () => {
  // 暂停滚动监听，防止操作过程中触发
  isScrollListenerActive.value = false;

  // 直接调用批量删除方法
  const result = await galleryStore.deleteSelectedImages();

  // 恢复滚动监听
  nextTick(() => {
    isScrollListenerActive.value = true;
  });

  // 在后台静默刷新数据
  if (result) {
    setTimeout(() => {
      galleryStore.fetchImagesInBackground();
    }, 1000); // 延迟1秒后进行后台刷新
  }
};

// 批量添加到收藏
const batchAddToFavorites = async () => {
  if (!galleryStore.hasSelected) return;

  // 暂停滚动监听，防止操作过程中触发
  isScrollListenerActive.value = false;

  try {
    // 获取所有选中图片的ID
    const imageIds = galleryStore.selectedImages.map(image => image.id);

    // 确保先获取最新收藏列表
    await favoriteStore.fetchFavorites();

    // 使用favoriteStore的isFavorite方法检查哪些图片已经被收藏
    const newImageIds = imageIds.filter(id => !favoriteStore.isFavorite(id));

    // 如果所有图片都已收藏，直接提示并返回
    if (newImageIds.length === 0) {
      toastStore.warning('所选图片均已收藏', {
        title: '请勿重复收藏'
      });
      return;
    }

    // 如果有部分图片已收藏，显示信息
    if (newImageIds.length < imageIds.length) {
      toastStore.info(`已排除${imageIds.length - newImageIds.length}张已收藏图片`, {
        title: '智能收藏'
      });
    }

    // 调用API函数，只收藏未收藏的图片
    const result = await apiBatchAddToFavorites(newImageIds);

    // 显示成功消息
    toastStore.success(`成功添加${result.data.succeeded.count}张图片到收藏`, {
      title: '添加收藏成功'
    });

    // 如果有失败的项目，显示失败消息
    if (result.data.failed && result.data.failed.count > 0) {
      toastStore.warning(`${result.data.failed.count}张图片添加失败`, {
        title: '部分图片添加失败'
      });
    }

    // 清除选择
    galleryStore.clearSelection();

    // 刷新收藏列表
    favoriteStore.fetchFavorites();
  } catch (error) {
    console.error('批量添加收藏失败:', error);
    toastStore.error(error.message || '请稍后重试', {
      title: '添加收藏失败'
    });
  } finally {
    // 恢复滚动监听
    nextTick(() => {
      isScrollListenerActive.value = true;
    });
  }
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

// 移动端菜单控制
const showMobileMenu = ref(false);

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  // 触发App组件中的toggleMobileMenu方法
  document.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
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
