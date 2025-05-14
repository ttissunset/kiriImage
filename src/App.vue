<script setup>
// App.vue
import TheNavbar from './components/TheNavbar.vue'
import ThemeCustomizer from './components/ThemeCustomizer.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { Cog6ToothIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from './stores/authStore'
import { useRoute, useRouter } from 'vue-router'

// 认证状态
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// 是否显示导航和主题自定义器
const isLoginPage = computed(() => route.path === '/login')
const showNavbar = computed(() => authStore.isAuthenticated && !isLoginPage.value)

// 监听路由变化
watch(() => route.path, (newPath) => {
  // 如果用户未登录且不在登录页面，重定向到登录页面
  if (!authStore.isAuthenticated && newPath !== '/login') {
    router.push('/login')
  }
})

// 主题自定义器控制
const showThemeCustomizer = ref(false)
const themeButtonRef = ref(null)
const showMobileMenu = ref(false)
const isMobileDevice = ref(false)

// 判断是否为移动设备
const checkIsMobile = () => {
  isMobileDevice.value = window.innerWidth < 768
}

const openThemeCustomizer = () => {
  showThemeCustomizer.value = true
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// 监听窗口大小变化，在桌面模式自动展开侧边栏
const handleResize = () => {
  if (window.innerWidth >= 768) {
    showMobileMenu.value = false
  }
  checkIsMobile()
}

// 添加窗口大小变化监听和自定义事件监听
onMounted(() => {
  window.addEventListener('resize', handleResize)
  // 添加自定义事件监听，以处理从GalleryView页面触发的菜单切换
  document.addEventListener('toggle-mobile-menu', toggleMobileMenu)
  // 初始检查设备类型
  checkIsMobile()
})

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('toggle-mobile-menu', toggleMobileMenu)
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- 登录页面 -->
    <template v-if="isLoginPage">
      <router-view></router-view>
      <!-- 仅显示消息提示容器 -->
      <ToastContainer />
    </template>
    
    <!-- 已登录 -->
    <template v-else>
      <!-- 响应式侧边栏导航 -->
      <TheNavbar v-if="showNavbar" :show-mobile="showMobileMenu" @close-mobile-menu="showMobileMenu = false" />
      
      <!-- 主内容区域 -->
      <main 
        :class="[
          'transition-all duration-300', 
          { 'filter blur-sm pointer-events-none': showMobileMenu },
          showNavbar ? 'ml-0 md:ml-56 md:pt-0' : 'ml-0 pt-0'
        ]"
      >
        <div>
          <router-view></router-view>
        </div>
      </main>

      <!-- 主题设置按钮 -->
      <button 
        v-if="showNavbar && !isMobileDevice"
        ref="themeButtonRef" 
        class="fixed bottom-20 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 md:left-6 md:right-auto" 
        @click="openThemeCustomizer" 
        title="主题设置"
      >
        <Cog6ToothIcon class="h-5 w-5" />
      </button>

      <!-- 主题自定义器 -->
      <ThemeCustomizer v-if="showNavbar && !isMobileDevice" v-model="showThemeCustomizer" :trigger-el="themeButtonRef" />

      <!-- 消息提示容器 -->
      <ToastContainer />
    </template>
  </div>
</template>

<style>
/* 移动端滑动优化 */
html, body {
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  touch-action: manipulation;
}

/* 禁用双击缩放 */
* {
  touch-action: manipulation;
}

/* 遮罩层样式 */
.blur-sm {
  pointer-events: none;
}

@media (max-width: 768px) {
  /* 移除之前的样式覆盖，因为我们已经直接修改了按钮类 */
}
</style>
