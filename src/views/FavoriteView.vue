<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">我的收藏</h1>
      <div class="flex space-x-2">
        <div v-if="favoriteCount === 0" class="text-muted-foreground text-sm">
          暂无收藏图片
        </div>
        <div v-else class="text-muted-foreground text-sm">
          共 {{ favoriteCount }} 张图片
        </div>
      </div>
    </div>

    <!-- 图片网格 -->
    <div v-if="favoriteCount > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      <div v-for="image in favoriteImages" :key="image.id" class="aspect-square overflow-hidden group relative">
        <ImageCard :image="image" @rename="showRenameDialog" @delete="showDeleteDialog" />
      </div>
    </div>

    <!-- 空白提示 -->
    <div v-else class="flex flex-col items-center justify-center h-[50vh] text-center">
      <StarIcon class="w-16 h-16 text-muted-foreground/30 mb-4" />
      <h3 class="text-xl font-semibold mb-2">没有收藏图片</h3>
      <p class="text-muted-foreground mb-6">浏览图库并点击心形图标来收藏您喜欢的图片</p>
      <router-link to="/" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        返回图库
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGalleryStore } from '../stores/galleryStore';
import { useToastStore } from '../stores/toastStore';
import ImageCard from '../components/ImageCard.vue';
import { StarIcon } from '@heroicons/vue/24/outline';

const galleryStore = useGalleryStore();
const toastStore = useToastStore();

// 获取收藏的图片
const favoriteImages = galleryStore.getFavoriteImages;
const favoriteCount = computed(() => galleryStore.favoriteCount);

// 重命名对话框
const showRenameDialog = async (image) => {
  // 使用prompt功能，目前Toast组件没有提供输入框功能
  // 在实际项目中，应该创建一个带输入框的模态对话框组件
  const newName = prompt("请输入新名称", image.name);
  if (newName && newName.trim() !== '') {
    galleryStore.updateImageName(image.id, newName.trim());
    toastStore.success(`已重命名为"${newName.trim()}"`);
  }
};

// 删除对话框
const showDeleteDialog = async (image) => {
  const confirmed = await toastStore.confirm(`确定要删除"${image.name}"吗？`, {
    title: "删除确认",
    type: "warning"
  });

  if (confirmed) {
    galleryStore.deleteImage(image.id);
    toastStore.success("图片已删除");
  }
};
</script> 