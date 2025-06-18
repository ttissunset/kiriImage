<template>
  <!-- 移动端侧边菜单背景遮罩 -->
  <div v-if="showMobile" class="fixed inset-0 z-40 bg-black/50 md:hidden" @click="closeMobileMenu"></div>

  <!-- 侧边导航栏 -->
  <aside class="fixed left-0 top-0 z-40 h-full w-64 border-r bg-background transition-transform duration-300 ease-in-out transform" :class="[
      showMobile ? 'translate-x-0' : '-translate-x-full',
      'md:translate-x-0 md:w-56',
    ]">
    <!-- 移动端侧边栏顶部添加关闭按钮 -->
    <div class="flex h-16 items-center justify-between border-b px-4 logo-with-close">
      <a href="/" class="flex items-center gap-2">
        <img src="https://kiripet.tos-cn-beijing.volces.com/image/logo.png" alt="kiriimage" class="w-6 h-6">
        <span class="font-bold">KiriImage</span>
      </a>

      <!-- 移动端关闭按钮 -->
      <button v-if="showMobile" @click="closeMobileMenu" class="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden close-button" aria-label="关闭菜单">
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>

    <nav class="flex flex-col p-4 h-[calc(100%-4rem)] justify-between">
      <div class="space-y-2">
        <router-link to="/" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors" :class="{
            'text-primary': $route.name === 'gallery',
            'text-muted-foreground hover:text-primary hover:bg-accent':
              $route.name !== 'gallery',
          }" @click="closeMobileMenu">
          <PhotoIcon class="h-5 w-5" />
          相册
        </router-link>
        <router-link to="/favorites" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors" :class="{
            'text-primary': $route.name === 'favorites',
            'text-muted-foreground hover:text-primary hover:bg-accent':
              $route.name !== 'favorites',
          }" @click="closeMobileMenu">
          <HeartIcon class="h-5 w-5" />
          收藏
        </router-link>
        <router-link to="/upload" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors" :class="{
            'text-primary': $route.name === 'upload',
            'text-muted-foreground hover:text-primary hover:bg-accent':
              $route.name !== 'upload',
          }" @click="closeMobileMenu">
          <ArrowUpTrayIcon class="h-5 w-5" />
          上传
        </router-link>

        <!-- 添加推荐路由 -->
        <router-link to="/recommend" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors" :class="{
            'text-primary': $route.name === 'recommend',
            'text-muted-foreground hover:text-primary hover:bg-accent':
              $route.name !== 'recommend',
          }" @click="closeMobileMenu">
          <SparklesIcon class="h-5 w-5" />
          推荐
        </router-link>

        <!-- 只对特定用户显示数据统计页面 -->
        <router-link v-if="authStore.isAdmin" to="/dashboard" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors" :class="{
            'text-primary': $route.name === 'dashboard',
            'text-muted-foreground hover:text-primary hover:bg-accent':
              $route.name !== 'dashboard',
          }" @click="closeMobileMenu">
          <ChartBarIcon class="h-5 w-5" />
          数据统计
        </router-link>
      </div>

      <!-- 底部用户信息和退出按钮 -->
      <div class="mt-auto border-t pt-2">
        <div class="flex items-center justify-between px-3 py-2">
          <div class="flex items-center gap-2 cursor-pointer" @click="showProfileDialog = true">
            <div class="h-8 w-8 rounded-full bg-muted overflow-hidden flex items-center justify-center">
              <img v-if="authStore.user && authStore.user.avatar" :src="authStore.user.avatar" :key="authStore.user.avatar" alt="用户头像" class="h-full w-full object-cover" />
              <UserIcon v-else class="h-4 w-4 text-muted-foreground" />
            </div>
            <div class="text-sm font-medium">
              {{
                authStore.user
                  ? authStore.user.nickname || authStore.user.username
                  : "未登录"
              }}
            </div>
          </div>
          <button @click="logout" class="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" title="退出登录">
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  </aside>

  <!-- 用户信息弹窗 -->
  <UserProfileDialog v-model="showProfileDialog" />
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
  ArrowUpTrayIcon,
  XMarkIcon,
  ArrowUpOnSquareIcon,
  VideoCameraIcon,
  ChartBarIcon,
  SparklesIcon
} from "@heroicons/vue/24/outline";
import { computed, ref } from "vue";
import { useToastStore } from "../stores/toastStore";
import { useAuthStore } from "../stores/authStore";
import UserProfileDialog from "./UserProfileDialog.vue";

const props = defineProps({
  showMobile: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close-mobile-menu"]);
const toastStore = useToastStore();
const authStore = useAuthStore();
// 用户信息弹窗控制
const showProfileDialog = ref(false);

// 检查是否为管理员用户
const isAdmin = computed(() => {
  return authStore.isAdmin;
});

// 关闭移动端菜单
const closeMobileMenu = () => {
  emit("close-mobile-menu");
};

// 退出登录
const logout = async () => {
  const confirmed = await toastStore.confirm("确定要退出登录吗？", {
    title: "退出确认",
    showConfirm: true
  });

  if (confirmed) {
    // 关闭菜单
    closeMobileMenu();
    // 调用authStore的登出方法
    authStore.logout();
    toastStore.success("已成功退出登录");
  }
};
</script>

<style scoped>
/* 适配iOS上的安全区 */
@supports (padding: max(0px)) {
  aside {
    padding-top: max(0px, env(safe-area-inset-top));
    padding-bottom: max(0px, env(safe-area-inset-bottom));
    padding-left: max(0px, env(safe-area-inset-left));
  }
}

/* 移动端顶部间距和关闭按钮位置优化 */
@media (max-width: 768px) {
  .logo-with-close {
    margin-top: env(safe-area-inset-top, 0);
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  .close-button {
    position: relative;
    top: -1px;
  }
}
</style>
