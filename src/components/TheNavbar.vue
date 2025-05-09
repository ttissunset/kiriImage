<template>
  <aside class="fixed left-0 top-0 z-30 h-full w-56 border-r bg-background">
    <div class="flex h-16 items-center border-b px-4">
      <a href="/" class="flex items-center gap-2">
        <span class="font-bold">KiriImage</span>
      </a>
    </div>

    <nav class="flex flex-col p-4 h-[calc(100%-4rem)] justify-between">
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
        <router-link to="/upload" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors" :class="{ 'text-primary': $route.name === 'upload', 'text-muted-foreground hover:text-primary hover:bg-accent': $route.name !== 'upload' }">
          <ArrowUpTrayIcon class="h-5 w-5" />
          上传
        </router-link>
      </div>

      <!-- 底部用户信息和退出按钮 -->
      <div class="mt-auto border-t pt-2">
        <div class="flex items-center justify-between px-3 py-2">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-full bg-muted overflow-hidden flex items-center justify-center">
              <UserIcon class="h-4 w-4 text-muted-foreground" />
            </div>
            <div class="text-sm font-medium">用户</div>
          </div>
          <button @click="logout" class="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" title="退出登录">
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
          </button>
        </div>
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
  Bars3Icon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ArrowUpTrayIcon
} from '@heroicons/vue/24/outline';
import { computed } from 'vue';
import { useGalleryStore } from '../stores/galleryStore';
import { useRoute } from 'vue-router';
import { useToastStore } from '../stores/toastStore';

const route = useRoute();
const galleryStore = useGalleryStore();
const toastStore = useToastStore();
const favoriteCount = computed(() => galleryStore.favoriteCount);

// 退出登录
const logout = async () => {
  const confirmed = await toastStore.confirm('确定要退出登录吗？', {
    title: '退出确认'
  });

  if (confirmed) {
    // 这里可以添加实际的登出逻辑
    toastStore.success('已成功退出登录');
    // 可能需要重定向到登录页面或执行其他登出后操作
  }
};
</script> 