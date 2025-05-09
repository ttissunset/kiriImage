<template>
  <aside class="fixed left-0 top-0 z-30 h-full w-56 border-r bg-background">
    <div class="flex h-16 items-center border-b px-4">
      <a href="/" class="flex items-center gap-2">
        <span class="font-bold">KiriImage</span>
      </a>
    </div>

    <nav class="flex flex-col p-4">
      <div class="space-y-2">
        <router-link to="/" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors" :class="{ 'text-primary': $route.name === 'gallery', 'text-muted-foreground hover:text-primary hover:bg-accent': $route.name !== 'gallery' }">
          <PhotoIcon class="h-5 w-5" />
          相册
        </router-link>
        <router-link to="/favorites" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors" :class="{ 'text-primary': $route.name === 'favorites', 'text-muted-foreground hover:text-primary hover:bg-accent': $route.name !== 'favorites' }">
          <HeartIcon class="h-5 w-5" />
          收藏
          <span v-if="favoriteCount > 0" class="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            {{ favoriteCount }}
          </span>
        </router-link>
        <a href="#" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary">
          <ShareIcon class="h-5 w-5" />
          共享
        </a>
      </div>
    </nav>
  </aside>

  <!-- 移动端导航切换按钮 -->
  <div class="fixed left-4 top-4 z-40 md:hidden">
    <button class="flex h-10 w-10 items-center justify-center rounded-md bg-background shadow-md">
      <Bars3Icon class="h-5 w-5" />
    </button>
  </div>
</template>

<script setup>
// 引入 Heroicons 组件
import {
  PhotoIcon,
  HeartIcon,
  ShareIcon,
  Bars3Icon
} from '@heroicons/vue/24/outline';
import { computed } from 'vue';
import { useGalleryStore } from '../stores/galleryStore';
import { useRoute } from 'vue-router';

const route = useRoute();
const galleryStore = useGalleryStore();
const favoriteCount = computed(() => galleryStore.favoriteCount);
</script> 