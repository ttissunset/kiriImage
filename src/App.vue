<script setup>
// App.vue
import TheNavbar from './components/TheNavbar.vue'
import ThemeCustomizer from './components/ThemeCustomizer.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import { ref } from 'vue'
import { Cog6ToothIcon } from '@heroicons/vue/24/outline'

// 主题自定义器控制
const showThemeCustomizer = ref(false)
const themeButtonRef = ref(null)

const openThemeCustomizer = () => {
  showThemeCustomizer.value = true
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <TheNavbar />
    <main class="ml-0 transition-all md:ml-56">
      <div>
        <router-view></router-view>
      </div>
    </main>

    <!-- 主题设置按钮 - 左侧导航栏底部但在用户头像上方 -->
    <button ref="themeButtonRef" class="fixed bottom-20 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90" @click="openThemeCustomizer" title="主题设置">
      <Cog6ToothIcon class="h-5 w-5" />
    </button>

    <!-- 主题自定义器 -->
    <ThemeCustomizer v-model="showThemeCustomizer" :trigger-el="themeButtonRef" />

    <!-- 消息提示容器 -->
    <ToastContainer />
  </div>
</template>

<style>
/* 在这里可以添加全局样式 */
</style>
