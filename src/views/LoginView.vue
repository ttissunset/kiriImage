<template>
  <div class="flex h-screen w-full bg-background">
    <!-- 左侧随机大图 -->
    <div class="hidden md:block md:w-1/2 lg:w-2/3 relative overflow-hidden">
      <img 
        :src="`https://img.loliapi.cn/i/pc/img${randomImageId}.webp`" 
        class="h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-black/15 flex items-start justify-start">
        <div class="text-white p-2 mt-2">
          <h5 class="font-bold mb-2 drop-shadow-md text-2xl">KiriImage</h5>
        </div>
      </div>
    </div>
    
    <!-- 右侧登录表单 -->
    <div class="w-full md:w-1/2 lg:w-1/3 flex items-center justify-center bg-background">
      <div class="w-full max-w-md space-y-8 p-8 md:p-10">
        <!-- 移动端上的品牌Logo和标题 -->
        <div class="text-center md:hidden">
          <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-10 w-10 text-primary">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <path d="M21 15l-5-5L5 21"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-foreground">KiriImage</h1>
          <p class="mt-3 text-sm text-muted-foreground">请登录您的账号以访问在线相册</p>
        </div>

        <!-- 桌面端的登录标题 -->
        <div class="hidden md:block">
          <h2 class="text-2xl font-bold tracking-tight text-foreground">欢迎回来</h2>
          <p class="mt-2 text-sm text-muted-foreground">请登录您的账号继续使用</p>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-4">
            <!-- 用户名输入 -->
            <div class="relative">
              <label 
                for="username" 
                class="absolute left-3 text-sm font-medium transition-all"
                :class="[
                  username || isFocusedUsername ? 
                  'top-2 text-xs text-primary' : 
                  'top-1/2 -translate-y-1/2 text-muted-foreground'
                ]"
              >
                输入用户名
              </label>
              <input
                id="username"
                v-model="username"
                type="text"
                required
                class="w-full rounded-md border px-3 pt-6 pb-2 transition-all focus:outline-none"
                :class="[
                  isFocusedUsername ? 
                  'border-primary ring-1 ring-primary' : 
                  'border-input bg-background'
                ]"
                @focus="isFocusedUsername = true"
                @blur="isFocusedUsername = false"
                :disabled="authStore.loading"
              />
            </div>

            <!-- 密码输入 -->
            <div class="relative">
              <label 
                for="password" 
                class="absolute left-3 text-sm font-medium transition-all"
                :class="[
                  password || isFocusedPassword ? 
                  'top-2 text-xs text-primary' : 
                  'top-1/2 -translate-y-1/2 text-muted-foreground'
                ]"
              >
                输入密码
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="w-full rounded-md border px-3 pt-6 pb-2 transition-all focus:outline-none"
                :class="[
                  isFocusedPassword ? 
                  'border-primary ring-1 ring-primary' : 
                  'border-input bg-background'
                ]"
                @focus="isFocusedPassword = true"
                @blur="isFocusedPassword = false"
                :disabled="authStore.loading"
              />
            </div>
          </div>

          <!-- 错误消息显示 -->
          <div v-if="authStore.error" class="rounded-md bg-destructive/10 p-4">
            <p class="text-sm font-medium text-destructive">{{ authStore.error }}</p>
          </div>

          <!-- 登录按钮 -->
          <div>
            <button
              type="submit"
              class="w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              :disabled="authStore.loading"
            >
              <span v-if="authStore.loading" class="flex items-center justify-center">
                <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                登录中...
              </span>
              <span v-else>登录</span>
            </button>
          </div>
        </form>
        
        <!-- 版权信息 -->
        <div class="mt-8 text-center text-xs text-muted-foreground">
          &copy; {{ new Date().getFullYear() }} KiriImage By Kiri · 保留所有权利
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/authStore";

const authStore = useAuthStore();
const username = ref("");
const password = ref("");
const randomImageId = ref(Math.floor(Math.random() * 500)); // 生成0-499的随机数

// 添加输入框焦点状态
const isFocusedUsername = ref(false);
const isFocusedPassword = ref(false);

const handleLogin = async () => {
  if (username.value && password.value) {
    await authStore.login(username.value, password.value);
  }
};
</script>

<style scoped>
/* 添加平滑过渡效果 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style> 